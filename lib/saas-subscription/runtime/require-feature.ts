import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import { hasFeature } from "../entitlement/feature-checker";
import { resolveEntitlementsSync } from "../entitlement/entitlement-resolver";
import { SUBSCRIPTION_ERROR_CODES, SaasSubscriptionError } from "../shared/subscription-errors";

export function requireFeature(ctx: TenantContext, feature: string): void {
  const entitlements = resolveEntitlementsSync(ctx.tenantId);
  if (!hasFeature(entitlements, feature)) {
    throw new SaasSubscriptionError(
      SUBSCRIPTION_ERROR_CODES.FEATURE_NOT_ENABLED,
      `Feature not enabled: ${feature}`,
    );
  }
}
