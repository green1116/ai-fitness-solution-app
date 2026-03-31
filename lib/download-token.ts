import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

export type DownloadTokenMode = "preview" | "full" | "budget" | "pack";
export type DownloadTokenVariant = "sales" | "tender";

function getDownloadSecret() {
  const s = (process.env.DOWNLOAD_TOKEN_SECRET || "").trim();
  if (!s) throw new Error("DOWNLOAD_TOKEN_SECRET_MISSING");
  return s;
}

function getDownloadKey() {
  return new TextEncoder().encode(getDownloadSecret());
}

function sha256HexRaw(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function signDownloadJwt(input: {
  planId: string;
  mode: DownloadTokenMode;
  variant?: DownloadTokenVariant;
  email?: string;
  ttlSec?: number;
}) {
  const ttlSec = Math.max(60, Number(input.ttlSec || 1800));
  const variant = input.variant === "tender" ? "tender" : "sales";

  return await new SignJWT({
    scope: "pdf_download",
    planId: input.planId,
    mode: input.mode,
    variant,
    email: input.email || "",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSec}s`)
    .sign(getDownloadKey());
}

export async function verifyDownloadJwt(token: string) {
  const { payload } = await jwtVerify(token, getDownloadKey());

  return {
    scope: String(payload.scope || ""),
    planId: String(payload.planId || ""),
    mode: String(payload.mode || ""),
    variant: String(payload.variant || "sales") as DownloadTokenVariant,
    email: String(payload.email || ""),
    exp: Number(payload.exp || 0),
    iat: Number(payload.iat || 0),
  };
}

export async function issueStatefulDownloadToken(input: {
  planId: string;
  mode: DownloadTokenMode;
  variant?: DownloadTokenVariant;
  email?: string;
  ttlSec?: number;
  maxUses?: number;
}) {
  const token = await signDownloadJwt({
    planId: input.planId,
    mode: input.mode,
    variant: input.variant,
    email: input.email,
    ttlSec: input.ttlSec,
  });

  const ttlSec = Math.max(60, Number(input.ttlSec || 1800));
  const expAt = new Date(Date.now() + ttlSec * 1000);
  const tokenHash = sha256HexRaw(token);

  await prisma.pdfDownloadTokenState.upsert({
    where: { tokenHash },
    update: {
      expAt,
      revoked: false,
      maxUses: Number(input.maxUses || 1),
    },
    create: {
      tokenHash,
      planId: input.planId,
      mode: input.mode,
      expAt,
      maxUses: Number(input.maxUses || 1),
      usedCount: 0,
      revoked: false,
    },
  });

  return token;
}

/**
 * 统一下载 token 消费逻辑
 * 支持：
 * 1) DEV_MODE_TOKEN（仅非生产）
 * 2) 纯 JWT token（邮箱验证码验证成功后直接签发）
 * 3) JWT + pdfDownloadTokenState 的旧状态型 token
 */
export async function requireAndConsumeDownloadToken(params: {
  downloadToken: string;
  planId: string;
  mode: DownloadTokenMode;
  variant?: DownloadTokenVariant;
  fingerprint: string;
  ip?: string | null;
  ua?: string | null;
}) {
  const token = String(params.downloadToken || "").trim();
  if (!token) {
    return { ok: false as const, code: "TOKEN_MISSING" as const };
  }

  if (token === "DEV_MODE_TOKEN") {
    if (process.env.NODE_ENV !== "production") {
      console.log("[DOWNLOAD_TOKEN] dev_mode_token");
      return {
        ok: true as const,
        tokenId: "DEV_MODE_TOKEN",
        usedCount: 0,
        maxUses: 0,
        bypass: true as const,
      };
    }
    return { ok: false as const, code: "TOKEN_DEV_NOT_ALLOWED" as const };
  }

  // 先按 JWT 校验
  try {
    const payload = await verifyDownloadJwt(token);

    if (payload.scope !== "pdf_download") {
      return { ok: false as const, code: "BAD_TOKEN_SCOPE" as const };
    }

    if (payload.planId !== params.planId) {
      return {
        ok: false as const,
        code: "TOKEN_PLAN_MISMATCH" as const,
        tokenPlanId: payload.planId,
      };
    }

    if (payload.mode && payload.mode !== params.mode) {
      return {
        ok: false as const,
        code: "TOKEN_MODE_MISMATCH" as const,
        tokenMode: payload.mode,
      };
    }

    // V6: variant 校验（tender-pack 必须 variant=tender）
    if (params.variant !== undefined && params.variant !== null) {
      const tokenVariant = (payload.variant || "sales") as DownloadTokenVariant;
      if (tokenVariant !== params.variant) {
        return {
          ok: false as const,
          code: "TOKEN_VARIANT_MISMATCH" as const,
          tokenVariant,
        };
      }
    }

    const tokenHash = sha256HexRaw(token);

    const row = await prisma.pdfDownloadTokenState.findUnique({
      where: { tokenHash },
    });

    // 新版纯 JWT：JWT 合法但没有 state，直接放行
    if (!row) {
      console.log("[DOWNLOAD_TOKEN] jwt_only");
      return {
        ok: true as const,
        tokenId: "JWT_ONLY",
        usedCount: 0,
        maxUses: 0,
        jwtOnly: true as const,
        email: payload.email || "",
      };
    }

    // 旧版状态型 token：继续状态校验
    if (row.revoked) {
      return { ok: false as const, code: "TOKEN_REVOKED" as const, tokenId: row.id };
    }

    if (row.expAt && row.expAt.getTime() <= Date.now()) {
      return { ok: false as const, code: "TOKEN_EXPIRED" as const, tokenId: row.id };
    }

    if (row.planId !== params.planId) {
      return {
        ok: false as const,
        code: "TOKEN_PLAN_MISMATCH" as const,
        tokenId: row.id,
        tokenPlanId: row.planId,
      };
    }

    if (row.mode && row.mode !== params.mode) {
      return {
        ok: false as const,
        code: "TOKEN_MODE_MISMATCH" as const,
        tokenId: row.id,
        tokenMode: row.mode,
      };
    }

    const hasLimit = (row.maxUses ?? 1) > 0;
    if (hasLimit && (row.usedCount ?? 0) >= (row.maxUses ?? 1)) {
      return {
        ok: false as const,
        code: "TOKEN_QUOTA_EXCEEDED" as const,
        tokenId: row.id,
        usedCount: row.usedCount,
        maxUses: row.maxUses,
      };
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        await tx.licenseConsume.create({
          data: {
            licenseId: row.id,
            planId: params.planId,
            fingerprint: params.fingerprint,
          },
        });
      } catch {
        return row;
      }

      const next = await tx.pdfDownloadTokenState.update({
        where: { id: row.id },
        data: { usedCount: { increment: 1 } },
      });

      return next;
    });

    console.log("[DOWNLOAD_TOKEN] stateful");
    return {
      ok: true as const,
      tokenId: updated.id,
      usedCount: updated.usedCount,
      maxUses: updated.maxUses,
    };
  } catch {
    // JWT 验证失败，回退到旧纯 state token 兼容逻辑
  }

  const tokenHash = sha256HexRaw(token);

  const row = await prisma.pdfDownloadTokenState.findUnique({
    where: { tokenHash },
  });

  if (!row) return { ok: false as const, code: "TOKEN_STATE_NOT_FOUND" as const };
  if (row.revoked) return { ok: false as const, code: "TOKEN_REVOKED" as const };

  if (row.expAt && row.expAt.getTime() <= Date.now()) {
    return { ok: false as const, code: "TOKEN_EXPIRED" as const, tokenId: row.id };
  }

  if (row.planId !== params.planId) {
    return {
      ok: false as const,
      code: "TOKEN_PLAN_MISMATCH" as const,
      tokenId: row.id,
      tokenPlanId: row.planId,
    };
  }

  if (row.mode && row.mode !== params.mode) {
    return {
      ok: false as const,
      code: "TOKEN_MODE_MISMATCH" as const,
      tokenId: row.id,
      tokenMode: row.mode,
    };
  }

  const hasLimit = (row.maxUses ?? 1) > 0;
  if (hasLimit && (row.usedCount ?? 0) >= (row.maxUses ?? 1)) {
    return {
      ok: false as const,
      code: "TOKEN_QUOTA_EXCEEDED" as const,
      tokenId: row.id,
      usedCount: row.usedCount,
      maxUses: row.maxUses,
    };
  }

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    try {
      await tx.licenseConsume.create({
        data: {
          licenseId: row.id,
          planId: params.planId,
          fingerprint: params.fingerprint,
        },
      });
    } catch {
      return row;
    }

    const next = await tx.pdfDownloadTokenState.update({
      where: { id: row.id },
      data: { usedCount: { increment: 1 } },
    });

    return next;
  });

  console.log("[DOWNLOAD_TOKEN] stateful_fallback");
  return {
    ok: true as const,
    tokenId: updated.id,
    usedCount: updated.usedCount,
    maxUses: updated.maxUses,
  };
}