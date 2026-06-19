import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { resolveEntitlementsSync } from "../entitlement/entitlement-resolver";
import { resolveQuota } from "../quota/quota-resolver";
import { SUBSCRIPTION_ERROR_CODES, SaasSubscriptionError } from "../shared/subscription-errors";
import type { QuotaCheckResult } from "../shared/subscription-types";

export function requireQuota(ctx: TenantContext, quotaKey: string): QuotaCheckResult {
  const entitlements = resolveEntitlementsSync(ctx.tenantId);
  const result = resolveQuota(entitlements, quotaKey);
  if (!result.allowed) {
    throw new SaasSubscriptionError(
      SUBSCRIPTION_ERROR_CODES.QUOTA_EXCEEDED,
      result.reason ?? `Quota exceeded: ${quotaKey}`,
    );
  }
  return result;
}
