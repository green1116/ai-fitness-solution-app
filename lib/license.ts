import crypto from "crypto";
import { prisma } from "@/lib/prisma";

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
    return { ok: false as const, code: "QUOTA_EXCEEDED" as const, licenseId: lic.id };
  }

  // 通过 -> 计数 + 打点（事务）
  const fp = [
    params.planId,
    params.mode,
    (params.ip || "noip").split(",")[0].trim(),
    (params.ua || "noua").slice(0, 80),
  ].join("|");

  const updated = await prisma.$transaction(async (tx) => {
    // ✅ 幂等：同一 fingerprint 已消费过 -> 不再扣 usedCount
    try {
      await tx.licenseConsume.create({
        data: { licenseId: lic.id, planId: params.planId, fingerprint: fp },
      });
    } catch {
      // 已存在：当作已成功（不重复扣次数）
      await tx.pdfDownloadLog.create({
        data: {
          planId: params.planId,
          mode: params.mode,
          email: params.email ?? null,
          licenseId: lic.id,
          ip: params.ip ?? null,
          ua: params.ua ?? null,
          ok: true,
          reason: "LICENSE_DUPLICATE_IGNORED",
        },
      });
      return lic;
    }

    const updatedLic = await tx.licenseKey.update({
      where: { id: lic.id },
      data: { usedCount: { increment: 1 } },
    });

    await tx.pdfDownloadLog.create({
      data: {
        planId: params.planId,
        mode: params.mode,
        email: params.email ?? null,
        licenseId: lic.id,
        ip: params.ip ?? null,
        ua: params.ua ?? null,
        ok: true,
        reason: "LICENSE_OK",
      },
    });

    return updatedLic;
  });

  return { ok: true as const, licenseId: updated.id, usedCount: updated.usedCount };
}

