import type { TenantEntitlements } from "../shared/subscription-types";
import type { QuotaCheckResult } from "../shared/subscription-types";
import { isUnlimitedQuota } from "../shared/quota-utils";
import { getQuotaUsage } from "./quota-usage-store";

export function resolveQuota(entitlements: TenantEntitlements, key: string): QuotaCheckResult {
  const limit = entitlements.quotas[key];
  if (limit == null) {
    return { allowed: false, reason: `Quota not defined: ${key}` };
  }

  if (isUnlimitedQuota(limit)) {
    return { allowed: true, remaining: null };
  }

  const used = getQuotaUsage(entitlements.tenantId, key);
  const remaining = Math.max(limit - used, 0);
  return {
    allowed: remaining > 0,
    remaining,
    reason: remaining > 0 ? undefined : `Quota exceeded: ${key}`,
  };
}

export function getQuotaLimit(entitlements: TenantEntitlements, key: string): number | undefined {
  return entitlements.quotas[key];
}
