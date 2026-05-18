/**
 * 正式 License 发放（支付 webhook / 管理端应通过此入口写入 LicenseKey）
 * 与 dev-issue 分离；下载校验仍用 lib/license-guard + hashLicenseKey
 */
import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { hashLicenseKey } from "@/lib/license";

function randomLicensePlain() {
  return crypto.randomBytes(32).toString("base64url");
}

const licenseSelect = {
  id: true,
  planId: true,
  planLevel: true,
  maxDownloads: true,
  usedCount: true,
  expiresAt: true,
  requireLogin: true,
  note: true,
  createdAt: true,
} as const;

export type IssuedLicenseRow = {
  id: string;
  planId: string | null;
  planLevel: string;
  maxDownloads: number;
  usedCount: number;
  expiresAt: Date | null;
  requireLogin: boolean;
  note: string | null;
  createdAt: Date;
};

export type IssueLicenseKeyParams = {
  planId: string | null;
  planLevel: string;
  maxDownloads: number;
  expiresAt: Date | null;
  requireLogin?: boolean;
  note: string;
  /** 日志里区分来源，如 formal-upgrade | formal-order-legacy */
  source?: string;
};

/**
 * 在已有事务中创建 LicenseKey（写入 sha256 keyHash，仅存哈希）
 */
export async function issueLicenseKeyInTransaction(
  tx: Prisma.TransactionClient,
  params: IssueLicenseKeyParams,
): Promise<{ licenseKeyPlain: string; license: IssuedLicenseRow }> {
  const licenseKeyPlain = randomLicensePlain();
  const keyHash = hashLicenseKey(licenseKeyPlain);

  const license = await tx.licenseKey.create({
    data: {
      keyHash,
      planId: params.planId,
      planLevel: params.planLevel,
      maxDownloads: params.maxDownloads,
      usedCount: 0,
      expiresAt: params.expiresAt,
      requireLogin: params.requireLogin ?? false,
      note: params.note,
    },
    select: licenseSelect,
  });

  console.info("[license-issued]", {
    source: params.source ?? "formal",
    licenseId: license.id,
    planId: params.planId,
    planLevel: params.planLevel,
    maxDownloads: params.maxDownloads,
    note: params.note,
  });

  return { licenseKeyPlain, license };
}
