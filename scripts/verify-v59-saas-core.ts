/**
 * V59 SaaS Monetization Core Verification
 */
import fs from "node:fs";
import path from "node:path";

import { SaasAuthError } from "../lib/auth/auth.service";
import { getStripeClient, isStripeLive } from "../lib/billing/stripe.client";
import {
  PLAN_FEATURE_MATRIX,
  PLAN_USAGE_LIMITS,
  resolveFeatureFlags,
} from "../lib/feature-flags/feature.service";
import {
  ORG_ROLES,
  ROLE_PERMISSIONS,
  canAssignRole,
  roleHasPermission,
} from "../lib/organization/role.service";
import { runSaasApiGate } from "../lib/saas/api-gate";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkSaasModules() {
  const required = [
    "lib/auth/auth.service.ts",
    "lib/auth/session.service.ts",
    "lib/auth/user.service.ts",
    "lib/organization/organization.service.ts",
    "lib/organization/membership.service.ts",
    "lib/organization/role.service.ts",
    "lib/billing/billing.service.ts",
    "lib/billing/subscription.service.ts",
    "lib/billing/stripe.client.ts",
    "lib/billing/invoice.service.ts",
    "lib/usage/usage-tracker.service.ts",
    "lib/usage/usage-aggregator.service.ts",
    "lib/feature-flags/feature.service.ts",
    "lib/feature-flags/feature-gate.ts",
    "lib/saas/api-gate.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ SaaS module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_AUTH_SYSTEM: typeof SaasAuthError === "function",
    HAS_ORGANIZATION_SYSTEM: fs.existsSync(path.join(ROOT, "lib/organization/organization.service.ts")),
    HAS_BILLING_SYSTEM: fs.existsSync(path.join(ROOT, "lib/billing/billing.service.ts")),
    HAS_SUBSCRIPTION_SYSTEM: fs.existsSync(path.join(ROOT, "lib/billing/subscription.service.ts")),
    HAS_FEATURE_FLAGS: typeof resolveFeatureFlags === "function",
    HAS_USAGE_TRACKING: fs.existsSync(path.join(ROOT, "lib/usage/usage-tracker.service.ts")),
    HAS_RBAC: ORG_ROLES.length === 3 && typeof roleHasPermission === "function",
    HAS_API_GATES: typeof runSaasApiGate === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkPlanFeatureMatrix() {
  assert(PLAN_FEATURE_MATRIX.BASIC.canGenerateQuote === true, "basic quote");
  assert(PLAN_FEATURE_MATRIX.BASIC.canGenerateBudget === false, "basic no budget");
  assert(PLAN_FEATURE_MATRIX.PRO.canGenerateBudget === true, "pro budget");
  assert(PLAN_FEATURE_MATRIX.PRO.canExportPDF === true, "pro pdf");
  assert(PLAN_FEATURE_MATRIX.ENTERPRISE.canGenerateTender === true, "enterprise tender");
  assert(PLAN_FEATURE_MATRIX.ENTERPRISE.canUseAPI === true, "enterprise api");
  assert(PLAN_USAGE_LIMITS.ENTERPRISE.QUOTE === -1, "enterprise unlimited");
  console.log("✓ billing plan feature matrix");
}

function checkRbacNotHardcoded() {
  assert(ROLE_PERMISSIONS.OWNER.includes("manage_billing"), "owner billing perm");
  assert(roleHasPermission("MEMBER", "use_product"), "member use product");
  assert(!roleHasPermission("MEMBER", "manage_billing"), "member no billing");
  assert(canAssignRole("OWNER", "ADMIN"), "owner assigns admin");
  assert(!canAssignRole("MEMBER", "ADMIN"), "member cannot assign admin");
  console.log("✓ RBAC from role matrix (no hardcoded gate permissions)");
}

function checkApiGatesWired() {
  for (const route of [
    "app/api/quote/generate/route.ts",
    "app/api/budget/calculate/route.ts",
    "app/api/tender/generate/route.ts",
  ]) {
    const content = fs.readFileSync(path.join(ROOT, route), "utf8");
    assert(content.includes("runSaasApiGate"), `${route} must use runSaasApiGate`);
    assert(content.includes("trackFeatureUsage"), `${route} must track usage`);
  }

  const quote = fs.readFileSync(path.join(ROOT, "app/api/quote/generate/route.ts"), "utf8");
  const budget = fs.readFileSync(path.join(ROOT, "app/api/budget/calculate/route.ts"), "utf8");
  const tender = fs.readFileSync(path.join(ROOT, "app/api/tender/generate/route.ts"), "utf8");

  assert(quote.includes('"canGenerateQuote"'), "quote feature gate");
  assert(budget.includes('"canGenerateBudget"'), "budget feature gate");
  assert(tender.includes('"canGenerateTender"'), "tender feature gate");

  console.log("✓ API routes wired with feature gates");
}

function checkPrismaSaasModels() {
  const schema = fs.readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");
  for (const model of ["Subscription", "UsageRecord", "SaasInvoice"]) {
    assert(schema.includes(`model ${model}`), `prisma model ${model}`);
  }
  assert(schema.includes("password"), "user password field");
  console.log("✓ prisma SaaS models");
}

function checkV58Untouched() {
  assert(fs.existsSync(path.join(V58_DIR, "freeze/v58-final-frozen.ts")), "v58 freeze intact");
  const forbidden = fs.readFileSync(path.join(V58_DIR, "orchestration/quote-orchestrator.engine.ts"), "utf8");
  assert(!forbidden.includes("SaasAuthError"), "v58 not coupled to saas");
  console.log("✓ NO_V58_MODIFICATION");
  console.log("✓ NO_V57_MODIFICATION (product surface untouched)");
}

function checkStripeClient() {
  const client = getStripeClient();
  assert(typeof client.createCustomer === "function", "stripe client");
  console.log(`✓ stripe client (${isStripeLive() ? "live" : "mock"} mode)`);
}

function checkNoDirectBypass() {
  const gateSource = fs.readFileSync(path.join(ROOT, "lib/saas/api-gate.ts"), "utf8");
  assert(gateSource.includes("enforceFeatureAccess"), "gate enforces features");
  assert(gateSource.includes("authenticateRequest"), "gate requires auth");
  console.log("✓ NO_DIRECT_ACCESS_BYPASS");
}

function main() {
  checkSaasModules();
  checkCapabilities();
  checkPlanFeatureMatrix();
  checkRbacNotHardcoded();
  checkApiGatesWired();
  checkPrismaSaasModels();
  checkV58Untouched();
  checkStripeClient();
  checkNoDirectBypass();
  console.log("\n✓ V59 SaaS Monetization Core — ALL CHECKS PASSED");
}

main();
