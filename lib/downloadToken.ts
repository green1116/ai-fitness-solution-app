// DEPRECATED: use "@/lib/download-token" only
import crypto from "crypto";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

type DownloadMode = "full" | "budget";

function getSecret() {
  const s = process.env.DOWNLOAD_TOKEN_SECRET?.trim() || "";
  if (!s) throw new Error("DOWNLOAD_TOKEN_SECRET_MISSING");
  return s;
}

function getKey() {
  return new TextEncoder().encode(getSecret());
}

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function signDownloadJwt(input: {
  planId: string;
  mode: DownloadMode;
  email?: string;
  ttlSec?: number;
}) {
  const ttlSec = Math.max(60, Number(input.ttlSec || 1800));

  return await new SignJWT({
    scope: "pdf_download",
    planId: input.planId,
    mode: input.mode,
    email: input.email || "",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSec}s`)
    .sign(getKey());
}

export async function verifyDownloadJwt(token: string) {
  const { payload } = await jwtVerify(token, getKey());

  return {
    scope: String(payload.scope || ""),
    planId: String(payload.planId || ""),
    mode: String(payload.mode || ""),
    email: String(payload.email || ""),
    exp: Number(payload.exp || 0),
    iat: Number(payload.iat || 0),
  };
}

/**
 * 兼容两类 token：
 * 1) 旧版：JWT + pdfDownloadTokenState 数据库状态
 * 2) 新版：纯 JWT（邮箱验证码通过后直接签发，不落库）
 */
export async function requireAndConsumeToken(opts: {
  token: string;
  planId: string;
  mode: DownloadMode;
  fingerprint?: string;
}) {
  const token = String(opts.token || "").trim();
  if (!token) throw new Error("TOKEN_MISSING");

  // 1) 先验 JWT（防伪造）
  const payload = await verifyDownloadJwt(token);

  if (payload.scope !== "pdf_download") {
    throw new Error("BAD_TOKEN_SCOPE");
  }
  if ((payload.planId || "") !== opts.planId) {
    throw new Error("TOKEN_PLAN_MISMATCH");
  }
  if ((payload.mode || "") !== opts.mode) {
    throw new Error("TOKEN_MODE_MISMATCH");
  }

  // 2) 再尝试查旧版 tokenState
  //    如果不存在，说明这很可能是新版“纯 JWT token”，直接放行
  const tokenHash = sha256Hex(token);

  const row = await prisma.pdfDownloadTokenState.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      planId: true,
      mode: true,
      expAt: true,
      maxUses: true,
      usedCount: true,
      revoked: true,
    },
  });

  // 新版纯 JWT：不依赖 token state，直接通过
  if (!row) {
    return {
      ok: true as const,
      kind: "jwt_only" as const,
      planId: payload.planId,
      mode: payload.mode as DownloadMode,
      email: payload.email || "",
    };
  }

  // 旧版状态型 token：继续做状态校验
  if (row.revoked) throw new Error("TOKEN_REVOKED");
  if (row.expAt.getTime() <= Date.now()) throw new Error("TOKEN_EXPIRED");
  if ((row.planId || "") !== opts.planId) throw new Error("TOKEN_STATE_PLAN_MISMATCH");
  if ((row.mode || "full") !== opts.mode) throw new Error("TOKEN_STATE_MODE_MISMATCH");

  // 3) 旧版防重复 / 消耗逻辑
  //    新版纯 JWT 不走这里，避免因为没落库而失败
  await prisma.$transaction(async (tx: any) => {
    await tx.pdfDownloadTokenState.update({
      where: { id: row.id },
      data: {
        usedCount: { increment: 1 },
      },
    });
  });

  return {
    ok: true as const,
    kind: "stateful" as const,
    tokenStateId: row.id,
    planId: row.planId,
    mode: (row.mode || "full") as DownloadMode,
  };
}

export async function issueStatefulDownloadToken(input: {
  planId: string;
  mode: DownloadMode;
  email?: string;
  ttlSec?: number;
  maxUses?: number;
}) {
  const token = await signDownloadJwt({
    planId: input.planId,
    mode: input.mode,
    email: input.email,
    ttlSec: input.ttlSec,
  });

  const ttlSec = Math.max(60, Number(input.ttlSec || 1800));
  const expAt = new Date(Date.now() + ttlSec * 1000);
  const tokenHash = sha256Hex(token);

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

export function normalizeTokenError(err: any) {
  const msg = String(err?.message || err || "TOKEN_INVALID");

  const allowed = new Set([
    "TOKEN_MISSING",
    "BAD_TOKEN_SCOPE",
    "TOKEN_PLAN_MISMATCH",
    "TOKEN_MODE_MISMATCH",
    "TOKEN_REVOKED",
    "TOKEN_EXPIRED",
    "TOKEN_STATE_PLAN_MISMATCH",
    "TOKEN_STATE_MODE_MISMATCH",
    "DOWNLOAD_TOKEN_SECRET_MISSING",
    "TOKEN_INVALID",
  ]);

  const code = allowed.has(msg) ? msg : "TOKEN_INVALID";

  return {
    ok: false as const,
    code,
    message: `download token rejected: ${code}`,
  };
}