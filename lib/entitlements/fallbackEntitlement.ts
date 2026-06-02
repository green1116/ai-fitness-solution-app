import type { EntitlementDebug } from "@/lib/entitlement";
import type { PlanEntitlementSnapshot } from "@/lib/entitlements/planEntitlement";

export type EntitlementLevel = "free" | "pro" | "enterprise";

/**
 * 数据库不可用时的降级快照（仅 dev / 显式开启时由 API 返回 200）。
 * 生产环境仍应返回 503，避免伪造权限。
 */
export function buildDegradedEntitlementFallback(
  planId: string,
  reason: string,
): {
  entitlement: PlanEntitlementSnapshot;
  debug: EntitlementDebug;
  degraded: true;
  fallbackLevel: EntitlementLevel;
} {
  const envLevel = String(
    process.env.DEV_ENTITLEMENT_FALLBACK_LEVEL ?? "enterprise",
  )
    .trim()
    .toLowerCase();

  const fallbackLevel: EntitlementLevel =
    envLevel === "enterprise" || envLevel === "pro" ? envLevel : "free";

  const rank =
    fallbackLevel === "enterprise" ? 2 : fallbackLevel === "pro" ? 1 : 0;

  const entitlement: PlanEntitlementSnapshot = {
    planId,
    effectiveLevel: fallbackLevel,
    planEnabled: true,
    proEnabled: rank >= 1,
    budgetEnabled: rank >= 1,
    enterpriseEnabled: rank >= 2,
    zipEnabled: rank >= 2,
  };

  const debug: EntitlementDebug = {
    planId,
    allOrders: [],
    paidOrders: [],
    orderWinner: null,
    licenseWinner: null,
    orderRank: 0,
    licenseRank: rank,
    finalRank: rank,
    finalLevel: fallbackLevel,
    winningSource: rank > 0 ? "license" : "none",
    licenseCandidates: [],
    priorityExplanation: `DEGRADED_DB_FALLBACK: ${reason}`,
    sourcesDisagree: false,
    policyVersion: "v1-max-order-license",
  };

  return {
    entitlement,
    debug,
    degraded: true,
    fallbackLevel,
  };
}

export function shouldUseEntitlementDbFallback(): boolean {
  if (process.env.ENTITLEMENT_DB_FALLBACK === "0") return false;
  if (process.env.ENTITLEMENT_DB_FALLBACK === "1") return true;
  return process.env.NODE_ENV !== "production";
}
