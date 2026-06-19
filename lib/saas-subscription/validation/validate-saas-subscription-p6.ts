import { SAAS_PLANS } from "@/lib/saas-foundation/subscription/plan-catalog";
import { validatePlanCatalog } from "@/lib/saas-foundation/subscription/subscription-validation";
import { hasFeature } from "../entitlement/feature-checker";
import {
  buildEntitlementsFromPlan,
  clearTenantPlanRegistry,
  resolveEntitlementsSync,
  setTenantPlanCode,
} from "../entitlement/entitlement-resolver";
import { isUnlimitedQuota } from "../shared/quota-utils";
import { resolveQuota } from "../quota/quota-resolver";
import { clearQuotaUsage } from "../quota/quota-usage-store";
import { clearSubscriptionCache } from "../cache/subscription-cache";

export interface SaasSubscriptionP6Validation {
  valid: boolean;
  planCatalogCount: number;
  summary: string;
}

export function validateSaasSubscriptionP6(): SaasSubscriptionP6Validation {
  const planValidation = validatePlanCatalog();
  const valid = planValidation.valid && SAAS_PLANS.length >= 5;
  return {
    valid,
    planCatalogCount: SAAS_PLANS.length,
    summary: `planCatalogValid=${planValidation.valid} valid=${valid}`,
  };
}

export function resetSubscriptionRuntimeState(): void {
  clearTenantPlanRegistry();
  clearSubscriptionCache();
  clearQuotaUsage();
}

export function trialFeatureChecks(): { hasQuote: boolean; hasApproval: boolean } {
  resetSubscriptionRuntimeState();
  const tenantId = "validation-trial-tenant";
  setTenantPlanCode(tenantId, "trial");
  const entitlements = resolveEntitlementsSync(tenantId);
  return {
    hasQuote: hasFeature(entitlements, "commercial.quote"),
    hasApproval: hasFeature(entitlements, "commercial.approval"),
  };
}

export function enterpriseUnlimitedChecks(): boolean {
  resetSubscriptionRuntimeState();
  const tenantId = "validation-enterprise-tenant";
  setTenantPlanCode(tenantId, "enterprise");
  const entitlements = buildEntitlementsFromPlan(tenantId, "enterprise");
  return Object.values(entitlements.quotas).every((quota) => isUnlimitedQuota(quota));
}

export function trialQuotaCheck(): boolean {
  resetSubscriptionRuntimeState();
  const tenantId = "validation-trial-quota";
  setTenantPlanCode(tenantId, "trial");
  const entitlements = resolveEntitlementsSync(tenantId);
  return resolveQuota(entitlements, "commercial.quote").allowed === true;
}
