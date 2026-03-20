import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logPdfDownloadSafe } from "@/lib/audit/pdfLog";
import {
  requireAndConsumeDownloadToken as requireAndConsumeDownloadTokenCore,
  type DownloadTokenMode,
} from "@/lib/download-token";

function getSecret() {
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
  plainKey?: string;
  planId?: string | null;
  maxDownloads?: number;
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

  const fp = [
    params.planId,
    params.mode,
    (params.ip || "noip").split(",")[0].trim(),
    (params.ua || "noua").slice(0, 80),
  ].join("|");

  const { result, duplicate } = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    try {
      await tx.licenseConsume.create({
        data: { licenseId: lic.id, planId: params.planId, fingerprint: fp },
      });
    } catch {
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

// 兼容旧 import：真正逻辑已迁移到 "@/lib/download-token"
export type { DownloadTokenMode };

export async function requireAndConsumeDownloadToken(params: {
  downloadToken: string;
  planId: string;
  mode: DownloadTokenMode;
  fingerprint: string;
  ip?: string | null;
  ua?: string | null;
}) {
  return requireAndConsumeDownloadTokenCore(params);
}