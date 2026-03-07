import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { logPdfDownloadSafe } from "@/lib/audit/pdfLog";

function getSecret() {
  // 如果你 env 目前不稳定，也能先跑：fallback 固定字符串（仅开发期）
  return process.env.LICENSE_HASH_SECRET || "dev_license_secret";
}

export function hashLicenseKey(raw: string) {
  return crypto.createHmac("sha256", getSecret()).update(raw.trim()).digest("hex");
}

export function generatePlainLicenseKey(prefix = "lic") {
  const rand = crypto.randomBytes(16).toString("hex");
  return `${prefix}-${rand}`;
}

export async function createLicenseKey(params: {
  plainKey?: string;        // 你也可以自带 key
  planId?: string | null;   // null/undefined = 全站
  maxDownloads?: number;    // 0 = 不限
  expiresAt?: Date | null;
  requireLogin?: boolean;
  note?: string | null;
}) {
  const plain = (params.plainKey || generatePlainLicenseKey()).trim();
  const keyHash = hashLicenseKey(plain);

  const row = await prisma.licenseKey.create({
    data: {
      keyHash,
      planId: params.planId ?? null,
      maxDownloads: params.maxDownloads ?? 0,
      expiresAt: params.expiresAt ?? null,
      requireLogin: params.requireLogin ?? false,
      note: params.note ?? null,
    },
  });

  // 返回明文只在创建时给一次（DB 只存 hash）
  return { licenseId: row.id, plainKey: plain };
}

export async function validateAndConsumeLicenseKey(params: {
  licenseKey: string;
  planId: string;
  email?: string | null;
  ip?: string | null;
  ua?: string | null;
  mode: "preview" | "full";
}) {
  const raw = params.licenseKey.trim();
  if (!raw) return { ok: false as const, code: "MISSING" as const };

  const keyHash = hashLicenseKey(raw);
  const lic = await prisma.licenseKey.findUnique({ where: { keyHash } });
  if (!lic) return { ok: false as const, code: "NOT_FOUND" as const };

  if (lic.expiresAt && lic.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, code: "EXPIRED" as const, licenseId: lic.id };
  }

  if (lic.planId && lic.planId !== params.planId) {
    return { ok: false as const, code: "PLAN_MISMATCH" as const, licenseId: lic.id };
  }

  if (lic.requireLogin && !params.email) {
    return { ok: false as const, code: "LOGIN_REQUIRED" as const, licenseId: lic.id };
  }

  if (lic.maxDownloads > 0 && lic.usedCount >= lic.maxDownloads) {
    await logPdfDownloadSafe({
      planId: params.planId,
      mode: params.mode,
      ok: false,
      ip: params.ip ?? null,
      ua: params.ua ?? null,
      extra: {
        license: { id: lic.id },
        event: "LICENSE_DENY",
        code: "QUOTA_EXCEEDED",
      },
    });
    return { ok: false as const, code: "QUOTA_EXCEEDED" as const, licenseId: lic.id };
  }

  // 通过 -> 计数 + 打点（事务）
  const fp = [
    params.planId,
    params.mode,
    (params.ip || "noip").split(",")[0].trim(),
    (params.ua || "noua").slice(0, 80),
  ].join("|");

  const { result, duplicate } = await prisma.$transaction(async (tx) => {
    // ✅ 幂等：同一 fingerprint 已消费过 -> 不再扣 usedCount
    try {
      await tx.licenseConsume.create({
        data: { licenseId: lic.id, planId: params.planId, fingerprint: fp },
      });
    } catch {
      // 已存在：当作已成功（不重复扣次数）
      return { result: lic, duplicate: true } as const;
    }

    const updatedLic = await tx.licenseKey.update({
      where: { id: lic.id },
      data: { usedCount: { increment: 1 } },
    });

    return { result: updatedLic, duplicate: false } as const;
  });

  await logPdfDownloadSafe({
    planId: params.planId,
    mode: params.mode,
    ok: true,
    ip: params.ip ?? null,
    ua: params.ua ?? null,
    extra: {
      license: { id: result.id },
      event: duplicate ? "LICENSE_DUPLICATE_IGNORED" : "LICENSE_OK",
    },
  });

  return { ok: true as const, licenseId: result.id, usedCount: result.usedCount };
}

// ================================
// DownloadToken (PdfDownloadTokenState) consume
// ================================

export type DownloadTokenMode = "preview" | "full" | "budget" | "pack";

function sha256HexRaw(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

/**
 * ✅ 校验并扣次 downloadToken（DB 表：PdfDownloadTokenState）
 * - 幂等：同一 fingerprint 重复请求不再扣 usedCount
 * - maxUses=0 视为不限（如果你未来需要）
 * - DEV_MODE_TOKEN 仅在非 production 放行
 */
export async function requireAndConsumeDownloadToken(params: {
  downloadToken: string;
  planId: string;
  mode: DownloadTokenMode;

  fingerprint: string; // 你在 route.ts 里拼：planId|mode|ip|ua
  ip?: string | null;
  ua?: string | null;
}) {
  const token = (params.downloadToken || "").trim();
  if (!token) {
    return { ok: false as const, code: "TOKEN_MISSING" as const };
  }

  // ✅ dev token：仅开发环境允许
  if (token === "DEV_MODE_TOKEN") {
    if (process.env.NODE_ENV !== "production") {
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

  const tokenHash = sha256HexRaw(token);

  const row = await prisma.pdfDownloadTokenState.findUnique({
    where: { tokenHash },
  });

  if (!row) return { ok: false as const, code: "TOKEN_STATE_NOT_FOUND" as const };
  if (row.revoked) return { ok: false as const, code: "TOKEN_REVOKED" as const };

  // 过期
  if (row.expAt && row.expAt.getTime() <= Date.now()) {
    return { ok: false as const, code: "TOKEN_EXPIRED" as const, tokenId: row.id };
  }

  // planId 绑定校验
  if (row.planId !== params.planId) {
    return {
      ok: false as const,
      code: "TOKEN_PLAN_MISMATCH" as const,
      tokenId: row.id,
      tokenPlanId: row.planId,
    };
  }

  // mode 绑定校验（如果你允许 token 不绑定 mode，可把这里改成 “仅当 row.mode 存在才校验”）
  if (row.mode && row.mode !== params.mode) {
    return {
      ok: false as const,
      code: "TOKEN_MODE_MISMATCH" as const,
      tokenId: row.id,
      tokenMode: row.mode,
    };
  }

  // maxUses 校验（maxUses=0 视为不限）
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

  // ✅ 事务：幂等扣次（用 LicenseConsume 表做 fingerprint 幂等）
  const updated = await prisma.$transaction(async (tx) => {
    // 1) 幂等：同 fingerprint 已 consume -> 不扣 usedCount
    try {
      await tx.licenseConsume.create({
        data: {
          // 复用 LicenseConsume：licenseId 填 tokenState.id
          licenseId: row.id,
          planId: params.planId,
          fingerprint: params.fingerprint,
        },
      });
    } catch {
      // duplicate -> 不扣次
      return row;
    }

    // 2) 扣 usedCount（如果 maxUses=0 不限，也可以不扣；这里仍扣计数方便审计）
    const next = await tx.pdfDownloadTokenState.update({
      where: { id: row.id },
      data: { usedCount: { increment: 1 } },
    });

    return next;
  });

  return {
    ok: true as const,
    tokenId: updated.id,
    usedCount: updated.usedCount,
    maxUses: updated.maxUses,
  };
}