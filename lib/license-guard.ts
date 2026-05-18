import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { normalizeUserTier } from "@/lib/commercial/userTier";
import { prisma } from "@/lib/prisma";
import { hashLicenseKey } from "@/lib/license";
import {
  licenseCoversRequestTier,
  tierRank,
} from "@/lib/license/tierCoverage";

type GuardFail = {
  ok: false;
  status: number;
  error: string;
};

type GuardSuccess = {
  ok: true;
  license: {
    id: string;
    planId: string | null;
    planLevel: string;
    maxDownloads: number;
    usedCount: number;
    requireLogin: boolean;
    expiresAt: Date | null;
  };
  planId: string;
  fingerprint: string;
};

function safeTrim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function readBodyFromRequest(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {};
  }

  try {
    const parsed = await request.clone().json();
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** 日志脱敏：避免完整明文 license 进入日志 */
function maskLicenseKeyForLog(raw: string): string {
  const t = raw.trim();
  if (t.length <= 12) return "***";
  return `${t.slice(0, 8)}…${t.slice(-4)}`;
}

function pickLicenseParams(
  request: Request,
  body: Record<string, unknown>,
  fallbackPlanId?: string,
) {
  const bodyLicenseKey = safeTrim(body.licenseKey);
  const bodyFingerprint = safeTrim(body.fingerprint);
  const bodyPlanId = safeTrim(body.planId);

  const headerLicenseKey = safeTrim(request.headers.get("x-license-key"));
  const headerFingerprint = safeTrim(request.headers.get("x-fingerprint"));
  const headerPlanId = safeTrim(request.headers.get("x-plan-id"));

  const licenseKey = headerLicenseKey || bodyLicenseKey;
  const planId = headerPlanId || bodyPlanId || safeTrim(fallbackPlanId);
  const fingerprint = headerFingerprint || bodyFingerprint || `${planId}:anonymous`;

  return { licenseKey, fingerprint, planId };
}

export type LicenseGuardMeta = {
  tier?: string;
  mode?: string;
  pathname?: string;
};

async function authorizeViaUserSessionBindings(
  effectivePlanId: string,
  fingerprint: string,
  requestTierRaw: string,
): Promise<GuardSuccess | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const requestTier =
    requestTierRaw === "free" ? "pro" : requestTierRaw;

  const bindings = await prisma.licenseBinding.findMany({
    where: { userId: user.id },
    include: { license: true },
  });

  let best: GuardSuccess | null = null;

  for (const b of bindings) {
    const lic = b.license;
    if (lic.expiresAt && lic.expiresAt.getTime() <= Date.now()) continue;
    if (lic.planId && lic.planId !== effectivePlanId) continue;
    if (!licenseCoversRequestTier(lic.planLevel, requestTier)) continue;
    if (
      b.fingerprint?.trim() &&
      b.fingerprint.trim() !== fingerprint.trim()
    ) {
      continue;
    }

    const quotaLimited = lic.maxDownloads > 0;
    const quotaExhausted =
      quotaLimited && lic.usedCount >= lic.maxDownloads;
    if (quotaExhausted) continue;

    const candidate: GuardSuccess = {
      ok: true,
      license: {
        id: lic.id,
        planId: lic.planId,
        planLevel: lic.planLevel,
        maxDownloads: lic.maxDownloads,
        usedCount: lic.usedCount,
        requireLogin: lic.requireLogin,
        expiresAt: lic.expiresAt,
      },
      planId: effectivePlanId,
      fingerprint,
    };

    if (
      !best ||
      tierRank(lic.planLevel) > tierRank(best.license.planLevel)
    ) {
      best = candidate;
    }
  }

  return best;
}

export async function requireValidLicense(
  request: Request,
  planId?: string,
  meta?: LicenseGuardMeta,
): Promise<GuardFail | GuardSuccess> {
  const body = await readBodyFromRequest(request);
  const { licenseKey, fingerprint, planId: effectivePlanId } = pickLicenseParams(request, body, planId);

  const rawTier =
    meta?.tier ??
    meta?.mode ??
    request.headers.get("x-mode") ??
    "pro";
  const requestTier = normalizeUserTier(rawTier);

  console.log("[license-backend-check]", {
    licenseKey: request.headers.get("x-license-key"),
    fingerprint: request.headers.get("x-fingerprint"),
    planId: request.headers.get("x-plan-id"),
    mode: meta?.mode ?? meta?.tier,
    tier: meta?.tier,
    pathname: meta?.pathname,
    picked: { licenseKey, fingerprint, planId: effectivePlanId },
    requestTier,
    sessionFallback: !safeTrim(licenseKey),
  });

  if (!effectivePlanId) {
    return { ok: false, status: 400, error: "planId is required" };
  }

  const trimmedKey = safeTrim(licenseKey);

  if (!trimmedKey) {
    const sessionAuth = await authorizeViaUserSessionBindings(
      effectivePlanId,
      fingerprint,
      requestTier,
    );
    if (sessionAuth) {
      console.info("[license-backend-check]", {
        path: "session_binding",
        userLicense: sessionAuth.license.id,
      });
      return sessionAuth;
    }
    return { ok: false, status: 403, error: "LICENSE_REQUIRED" };
  }

  try {
    const keyHash = hashLicenseKey(trimmedKey);
    const license = await prisma.licenseKey.findUnique({ where: { keyHash } });

    if (!license) {
      return { ok: false, status: 403, error: "LICENSE_INVALID" };
    }
    if (license.expiresAt && license.expiresAt.getTime() <= Date.now()) {
      return { ok: false, status: 403, error: "LICENSE_INVALID" };
    }
    // maxDownloads > 0 时表示配额上限；0 表示不限制次数
    const quotaLimited = license.maxDownloads > 0;
    const quotaExhausted =
      quotaLimited && license.usedCount >= license.maxDownloads;
    console.info("[license-usage]", {
      licenseKey: maskLicenseKeyForLog(trimmedKey),
      usedCount: license.usedCount,
      maxDownloads: license.maxDownloads,
      allowed: !quotaExhausted,
    });
    if (quotaExhausted) {
      return { ok: false, status: 403, error: "LICENSE_EXHAUSTED" };
    }
    if (license.planId && license.planId !== effectivePlanId) {
      return { ok: false, status: 403, error: "LICENSE_INVALID" };
    }

    /**
     * 密钥路径必须满足档位覆盖（与 session binding 分支一致）。
     * 客户端可能仍带着旧 Pro key，而账号已通过 webhook 绑定 Enterprise；
     * 此时回退到 session binding，避免 entitlement 已是 enterprise 却 ZIP 403。
     */
    if (!licenseCoversRequestTier(license.planLevel, requestTier)) {
      const sessionAuth = await authorizeViaUserSessionBindings(
        effectivePlanId,
        fingerprint,
        requestTier,
      );
      if (sessionAuth) {
        console.info("[license-backend-check]", {
          path: "session_fallback_key_tier_insufficient",
          keyPlanLevel: license.planLevel,
          requestTier,
          sessionPlanLevel: sessionAuth.license.planLevel,
        });
        return sessionAuth;
      }
      return { ok: false, status: 403, error: "DOWNLOAD_NOT_ALLOWED" };
    }

    return {
      ok: true,
      license: {
        id: license.id,
        planId: license.planId,
        planLevel: license.planLevel,
        maxDownloads: license.maxDownloads,
        usedCount: license.usedCount,
        requireLogin: license.requireLogin,
        expiresAt: license.expiresAt,
      },
      planId: effectivePlanId,
      fingerprint,
    };
  } catch {
    return { ok: false, status: 500, error: "LICENSE_INVALID" };
  }
}

export async function consumeLicenseOnSuccess(params: {
  licenseId: string;
  planId: string;
  fingerprint: string;
  route: string;
  /** 仅供 [license-usage] 脱敏打印，不传则不打印明文相关字段 */
  licenseKeyPlainForLog?: string;
}): Promise<{ ok: true; usedCount: number } | GuardFail> {
  try {
    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const current = await tx.licenseKey.findUnique({ where: { id: params.licenseId } });
      if (!current) {
        throw new Error("LICENSE_NOT_FOUND");
      }
      if (current.expiresAt && current.expiresAt.getTime() <= Date.now()) {
        throw new Error("LICENSE_EXPIRED");
      }
      const quotaLimited = current.maxDownloads > 0;
      const quotaExhausted =
        quotaLimited && current.usedCount >= current.maxDownloads;
      if (quotaExhausted) {
        console.warn("[license-usage]", {
          licenseKey: maskLicenseKeyForLog(params.licenseKeyPlainForLog ?? ""),
          usedCount: current.usedCount,
          maxDownloads: current.maxDownloads,
          allowed: false,
        });
        throw new Error("LICENSE_QUOTA_EXCEEDED");
      }

      await tx.licenseConsume.create({
        data: {
          licenseId: current.id,
          planId: params.planId,
          fingerprint: params.fingerprint,
        },
      });

      return tx.licenseKey.update({
        where: { id: current.id },
        data: { usedCount: { increment: 1 } },
      });
    });

    console.info("[license.consume.ok]", {
      licenseId: params.licenseId,
      planId: params.planId,
      route: params.route,
      usedCount: updated.usedCount,
    });
    console.info("[license-usage]", {
      licenseKey: maskLicenseKeyForLog(params.licenseKeyPlainForLog ?? ""),
      usedCount: updated.usedCount,
      maxDownloads: updated.maxDownloads,
      allowed: true,
    });

    return { ok: true, usedCount: updated.usedCount };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      console.info("[license.consume.duplicate]", {
        licenseId: params.licenseId,
        planId: params.planId,
        route: params.route,
      });
      return { ok: false, status: 403, error: "LICENSE_INVALID" };
    }

    if (error instanceof Error && error.message === "LICENSE_QUOTA_EXCEEDED") {
      return { ok: false, status: 403, error: "LICENSE_EXHAUSTED" };
    }
    if (error instanceof Error && error.message === "LICENSE_EXPIRED") {
      return { ok: false, status: 403, error: "LICENSE_INVALID" };
    }
    if (error instanceof Error && error.message === "LICENSE_NOT_FOUND") {
      return { ok: false, status: 403, error: "LICENSE_INVALID" };
    }

    return { ok: false, status: 500, error: "LICENSE_INVALID" };
  }
}
