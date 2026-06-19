import { resolveEntitlementsSync } from "../entitlement/entitlement-resolver";
import { SUBSCRIPTION_ERROR_CODES, SaasSubscriptionError } from "../shared/subscription-errors";
import type { ConsumeQuotaResult } from "../shared/subscription-types";
import { isUnlimitedQuota } from "../shared/quota-utils";
import { incrementQuotaUsage, getQuotaUsage } from "./quota-usage-store";

export function consumeQuota(tenantId: string, quotaKey: string, amount = 1): ConsumeQuotaResult {
  const entitlements = resolveEntitlementsSync(tenantId);
  const limit = entitlements.quotas[quotaKey];
  if (limit == null) {
    throw new SaasSubscriptionError(SUBSCRIPTION_ERROR_CODES.ENTITLEMENT_NOT_FOUND, `Quota not defined: ${quotaKey}`);
  }

  const current = getQuotaUsage(tenantId, quotaKey);
  const next = current + amount;

  if (!isUnlimitedQuota(limit) && next > limit) {
    throw new SaasSubscriptionError(SUBSCRIPTION_ERROR_CODES.QUOTA_EXCEEDED, `Quota exceeded: ${quotaKey}`);
  }

  incrementQuotaUsage(tenantId, quotaKey, amount);

  return {
    tenantId,
    quotaKey,
    used: next,
    remaining: isUnlimitedQuota(limit) ? null : Math.max(limit - next, 0),
  };
}

export { getQuotaUsage, clearQuotaUsage, resetTenantQuotaUsage } from "./quota-usage-store";
