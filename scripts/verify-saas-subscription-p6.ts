/**
 * V48 SaaS Subscription — Phase 6 verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  consumeQuota,
  enterpriseUnlimitedChecks,
  hasFeature,
  requireFeature,
  requireQuota,
  resolveEntitlements,
  resolveEntitlementsSync,
  resolveQuota,
  resetSubscriptionRuntimeState,
  SAAS_SUBSCRIPTION_P6_TAG,
  setTenantPlanCode,
  SUBSCRIPTION_ERROR_CODES,
  SaasSubscriptionError,
  trialFeatureChecks,
  trialQuotaCheck,
  validateSaasSubscriptionP6,
} from "../lib/saas-subscription";
import { buildOwnerContext } from "../lib/saas-rbac";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  resetSubscriptionRuntimeState();

  const validation = validateSaasSubscriptionP6();
  assert(validation.planCatalogCount >= 5, "plan catalog count");
  assert(validation.valid, `plan catalog validation: ${validation.summary}`);
  console.log("✓ plan catalog ok");

  const tenantId = "verify-p6-tenant";
  setTenantPlanCode(tenantId, "starter");
  const entitlements = await resolveEntitlements(tenantId);
  assert(entitlements.planCode === "starter", "resolveEntitlements planCode");
  assert(hasFeature(entitlements, "commercial.quote"), "feature checker quote");
  assert(resolveQuota(entitlements, "commercial.quote").allowed, "quota resolver allowed");
  console.log("✓ entitlement resolver ok");
  console.log("✓ feature checker ok");
  console.log("✓ quota resolver ok");

  resetSubscriptionRuntimeState();
  const trialFeatures = trialFeatureChecks();
  assert(trialFeatures.hasQuote, "trial has commercial.quote");
  assert(!trialFeatures.hasApproval, "trial lacks commercial.approval");
  console.log("✓ trial feature matrix ok");

  resetSubscriptionRuntimeState();
  assert(enterpriseUnlimitedChecks(), "enterprise unlimited quotas");
  console.log("✓ enterprise unlimited ok");

  resetSubscriptionRuntimeState();
  assert(trialQuotaCheck(), "trial quota check");
  const trialTenant = "verify-p6-trial-quota";
  setTenantPlanCode(trialTenant, "trial");
  const trialEntitlements = resolveEntitlementsSync(trialTenant);
  const before = resolveQuota(trialEntitlements, "commercial.quote");
  consumeQuota(trialTenant, "commercial.quote", 1);
  const after = resolveQuota(resolveEntitlementsSync(trialTenant), "commercial.quote");
  assert(before.remaining != null && after.remaining != null, "trial quota remaining tracked");
  assert(after.remaining === before.remaining! - 1, "consumeQuota decrements remaining");
  console.log("✓ consumeQuota ok");

  const ownerCtx = buildOwnerContext();
  setTenantPlanCode(ownerCtx.tenantId, "enterprise");
  requireFeature(ownerCtx, "commercial.quote");
  requireQuota(ownerCtx, "commercial.quote");
  console.log("✓ requireFeature ok");
  console.log("✓ requireQuota ok");

  resetSubscriptionRuntimeState();
  setTenantPlanCode(ownerCtx.tenantId, "trial");
  let featureDenied = false;
  try {
    requireFeature(ownerCtx, "commercial.approval");
  } catch (error) {
    featureDenied =
      error instanceof SaasSubscriptionError &&
      error.code === SUBSCRIPTION_ERROR_CODES.FEATURE_NOT_ENABLED;
  }
  assert(featureDenied, "requireFeature denies disabled feature");
  console.log("✓ requireFeature deny ok");

  const executorSource = readFileSync(
    join(process.cwd(), "lib", "saas-commercial-adapter", "bridge", "commercial-executor.ts"),
    "utf8",
  );
  assert(executorSource.includes('requireFeature(ctx, "commercial.quote")'), "executor requireFeature");
  assert(executorSource.includes('requireQuota(ctx, "commercial.quote")'), "executor requireQuota");
  assert(executorSource.includes("consumeQuota("), "executor consumeQuota");
  console.log("✓ executeCommercialQuote subscription integration ok");

  console.log(`tag=${SAAS_SUBSCRIPTION_P6_TAG}`);
  console.log("SAAS SUBSCRIPTION P6 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
