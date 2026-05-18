import { prisma } from "@/lib/prisma";
import { tierRank } from "@/lib/license/tierCoverage";

/** 与 LicenseKey.planLevel / 支付履约写入一致，由 planLevel 派生权限位 */
export type PlanEntitlementSnapshot = {
  planId: string;
  effectiveLevel: "free" | "pro" | "enterprise";
  /** plan 文档对所有档位开放（含 free），始终 true，用于和路由 entitlement.planEnabled 对齐 */
  planEnabled: true;
  proEnabled: boolean;
  budgetEnabled: boolean;
  enterpriseEnabled: boolean;
  zipEnabled: boolean;
};

export type PlanBindingRow = {
  licenseId: string;
  planId: string | null;
  planLevel: string;
  expiresAt: string | null;
};

function levelFromRank(bestRank: number): "free" | "pro" | "enterprise" {
  if (bestRank >= 2) return "enterprise";
  if (bestRank >= 1) return "pro";
  return "free";
}

function flagsFromRank(bestRank: number): Omit<PlanEntitlementSnapshot, "planId" | "effectiveLevel"> {
  return {
    planEnabled: true,
    proEnabled: bestRank >= 1,
    budgetEnabled: bestRank >= 1,
    enterpriseEnabled: bestRank >= 2,
    zipEnabled: bestRank >= 2,
  };
}

/** planEnabled 永远开放（free 也可下载 plan）；budgetEnabled / zipEnabled 派生自 planLevel */
export type EntitlementFlags = {
  planEnabled: true;
  budgetEnabled: boolean;
  zipEnabled: boolean;
};

export function entitlementFlagsFromSnapshot(
  snapshot: PlanEntitlementSnapshot,
): EntitlementFlags {
  return {
    planEnabled: true,
    budgetEnabled: snapshot.budgetEnabled,
    zipEnabled: snapshot.zipEnabled,
  };
}

/** 由 license.planLevel 直接派生 snapshot（用于未登录但持有 license-key 的兜底） */
export function snapshotFromPlanLevel(
  planLevel: string,
  planId: string,
): PlanEntitlementSnapshot {
  const rank = tierRank(planLevel);
  return {
    planId,
    effectiveLevel: levelFromRank(rank),
    ...flagsFromRank(rank),
  };
}

/**
 * 当前用户对某 planId 的授权快照（与 GET /api/me/entitlements 同源：LicenseBinding + LicenseKey）。
 * 支付 webhook 履约后写入的 planLevel 会体现在 bindings 中；只读 DB，不自行推断档位。
 */
export async function getPlanEntitlementSnapshot(
  userId: string,
  planId: string,
): Promise<PlanEntitlementSnapshot> {
  const { snapshot } = await getPlanEntitlementsDetail(userId, planId);
  return snapshot;
}

/** 来自 LicenseBinding 的最优 license（覆盖 minLevel、未过期、配额可用），用于 consume */
export type PickedBindingLicense = {
  id: string;
  planId: string | null;
  planLevel: string;
  maxDownloads: number;
  usedCount: number;
  requireLogin: boolean;
  expiresAt: Date | null;
};

/**
 * 为指定用户挑一条最匹配的 binding license：
 * - 满足 planId（license.planId 为空则视为通配）
 * - planLevel rank ≥ minRank
 * - 未过期
 * - 配额未耗尽
 * 命中多条时取 planLevel 最高的一条。
 */
export async function pickBestBindingLicense(params: {
  userId: string;
  planId: string;
  minRank: number;
}): Promise<PickedBindingLicense | null> {
  const rows = await prisma.licenseBinding.findMany({
    where: { userId: params.userId },
    include: { license: true },
  });

  let best: PickedBindingLicense | null = null;
  let bestRank = -1;

  for (const r of rows) {
    const lic = r.license;
    if (lic.expiresAt && lic.expiresAt.getTime() <= Date.now()) continue;
    if (lic.planId && lic.planId !== params.planId) continue;
    const rk = tierRank(lic.planLevel);
    if (rk < params.minRank) continue;
    const quotaLimited = lic.maxDownloads > 0;
    if (quotaLimited && lic.usedCount >= lic.maxDownloads) continue;

    if (rk > bestRank) {
      bestRank = rk;
      best = {
        id: lic.id,
        planId: lic.planId,
        planLevel: lic.planLevel,
        maxDownloads: lic.maxDownloads,
        usedCount: lic.usedCount,
        requireLogin: lic.requireLogin,
        expiresAt: lic.expiresAt,
      };
    }
  }

  return best;
}

/** 单次查询：快照 + 与 planId 匹配的 binding 列表（供 /api/me/entitlements） */
export async function getPlanEntitlementsDetail(
  userId: string,
  planId: string,
): Promise<{ snapshot: PlanEntitlementSnapshot; bindings: PlanBindingRow[] }> {
  const rows = await prisma.licenseBinding.findMany({
    where: { userId },
    include: { license: true },
  });

  let bestRank = 0;
  const bindings: PlanBindingRow[] = [];

  for (const r of rows) {
    const lic = r.license;
    if (lic.expiresAt && lic.expiresAt.getTime() < Date.now()) continue;
    if (lic.planId && lic.planId !== planId) continue;

    bindings.push({
      licenseId: lic.id,
      planId: lic.planId,
      planLevel: lic.planLevel,
      expiresAt: lic.expiresAt ? lic.expiresAt.toISOString() : null,
    });
    bestRank = Math.max(bestRank, tierRank(lic.planLevel));
  }

  const effectiveLevel = levelFromRank(bestRank);
  const snapshot: PlanEntitlementSnapshot = {
    planId,
    effectiveLevel,
    ...flagsFromRank(bestRank),
  };

  return { snapshot, bindings };
}
