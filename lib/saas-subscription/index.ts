export * from "./shared/subscription-types";
export * from "./shared/subscription-errors";
export * from "./shared/quota-utils";
export {
  resolveEntitlements,
  resolveEntitlementsSync,
  buildEntitlementsFromPlan,
  setTenantPlanCode,
  getTenantPlanCode,
  clearTenantPlanRegistry,
  setTenantGrantOverride,
} from "./entitlement/entitlement-resolver";
export { hasFeature } from "./entitlement/feature-checker";
export { resolveQuota, getQuotaLimit } from "./quota/quota-resolver";
export { consumeQuota, getQuotaUsage, clearQuotaUsage, resetTenantQuotaUsage } from "./quota/quota-consumer";
export { requireFeature } from "./runtime/require-feature";
export { requireQuota } from "./runtime/require-quota";
export {
  getTenantEntitlementsFromCache,
  setTenantEntitlementsCache,
  deleteTenantEntitlementsCache,
  clearSubscriptionCache,
  getSubscriptionCacheSize,
} from "./cache/subscription-cache";
export {
  validateSaasSubscriptionP6,
  resetSubscriptionRuntimeState,
  trialFeatureChecks,
  enterpriseUnlimitedChecks,
  trialQuotaCheck,
} from "./validation/validate-saas-subscription-p6";

export const SAAS_SUBSCRIPTION_META = {
  version: "v48-saas-subscription-p6",
  tag: "v48-saas-subscription-p6",
} as const;
