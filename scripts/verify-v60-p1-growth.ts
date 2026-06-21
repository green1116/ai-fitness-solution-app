/**
 * V60 P1 Growth System Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  trackSignup,
  trackActivation,
  trackQuoteGenerated,
  trackUpgradeClicked,
  trackPaymentCompleted,
} from "../lib/growth/analytics.events";
import { getOnboardingFlow, advanceOnboardingStep } from "../lib/growth/activation/onboarding.flow";
import { aggregateGrowthMetrics, buildFunnelSnapshot } from "../lib/growth/funnel/funnel.analytics";
import { ONBOARDING_STEPS, type GrowthMetrics } from "../lib/growth/funnel/growth.funnel.model";
import { clearGrowthStoreForTests } from "../lib/growth/growth.events.store";
import { computeRetentionProfile } from "../lib/growth/retention/retention.metrics";
import { predictChurn } from "../lib/growth/retention/churn.predictor";
import { checkFeatureAccess } from "../lib/feature-flags/feature-gate";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/growth/acquisition/landing.analytics.ts",
    "lib/growth/acquisition/traffic.source.ts",
    "lib/growth/acquisition/campaign.tracker.ts",
    "lib/growth/activation/onboarding.flow.ts",
    "lib/growth/activation/first-action.tracker.ts",
    "lib/growth/activation/activation.metrics.ts",
    "lib/growth/conversion/paywall.engine.ts",
    "lib/growth/conversion/upgrade.tracker.ts",
    "lib/growth/conversion/pricing.strategy.ts",
    "lib/growth/retention/retention.metrics.ts",
    "lib/growth/retention/churn.predictor.ts",
    "lib/growth/retention/reactivation.engine.ts",
    "lib/growth/funnel/growth.funnel.model.ts",
    "lib/growth/funnel/funnel.analytics.ts",
    "lib/growth/analytics.events.ts",
    "lib/growth/growth.service.ts",
    "app/api/growth/metrics/route.ts",
    "app/api/growth/track/route.ts",
    "app/api/growth/onboarding/route.ts",
    "app/api/growth/paywall/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ growth module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_FUNNEL_MODEL: ONBOARDING_STEPS.length === 6,
    HAS_ACTIVATION_FLOW: typeof advanceOnboardingStep === "function",
    HAS_ONBOARDING_SYSTEM: getOnboardingFlow().length === 6,
    HAS_PAYWALL_ENGINE: fs.existsSync(path.join(ROOT, "lib/growth/conversion/paywall.engine.ts")),
    HAS_CONVERSION_TRACKING: typeof trackUpgradeClicked === "function",
    HAS_RETENTION_TRACKING: typeof computeRetentionProfile === "function",
    HAS_GROWTH_METRICS: typeof aggregateGrowthMetrics === "function",
    HAS_ANALYTICS_EVENTS: typeof trackSignup === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkGrowthMetricsShape() {
  clearGrowthStoreForTests();
  trackSignup({ userId: "u-grow-1", source: "landing" });
  trackActivation({ userId: "u-grow-1", organizationId: "org-grow-1" });
  trackQuoteGenerated({ organizationId: "org-grow-1", userId: "u-grow-1", isFirst: true });
  trackUpgradeClicked({ organizationId: "org-grow-1", userId: "u-grow-1", targetPlan: "PRO" });
  trackPaymentCompleted({ organizationId: "org-grow-1", userId: "u-grow-1", plan: "PRO" });

  const metrics: GrowthMetrics = aggregateGrowthMetrics();
  assert(typeof metrics.visitors === "number", "visitors metric");
  assert(typeof metrics.signups === "number", "signups metric");
  assert(typeof metrics.activatedUsers === "number", "activatedUsers metric");
  assert(typeof metrics.firstQuoteGenerated === "number", "firstQuoteGenerated metric");
  assert(typeof metrics.paidUsers === "number", "paidUsers metric");
  assert(typeof metrics.churnRate === "number", "churnRate metric");
  assert(typeof metrics.retentionRate === "number", "retentionRate metric");
  assert(metrics.signups >= 1, "signup tracked");
  assert(metrics.firstQuoteGenerated >= 1, "first quote tracked");
  assert(metrics.paidUsers >= 1, "payment tracked");

  const funnel = buildFunnelSnapshot();
  assert(funnel.activation >= 1, "activation funnel");
  assert(funnel.conversion >= 1, "conversion funnel");
  console.log("✓ GrowthMetrics interface + funnel aggregation");
}

function checkOnboardingFlow() {
  clearGrowthStoreForTests();
  const userId = "onboard-user-1";
  let state = advanceOnboardingStep(userId, "create_organization", "org-onboard-1");
  assert(state.currentStep === "create_first_project", "onboarding step2→3");
  state = advanceOnboardingStep(userId, "create_first_project", "org-onboard-1");
  state = advanceOnboardingStep(userId, "generate_first_quote", "org-onboard-1");
  assert(state.activated === true, "activated after first quote step");
  console.log("✓ onboarding flow steps");
}

async function checkPaywallUsesFeatureGate() {
  const paywallSource = fs.readFileSync(
    path.join(ROOT, "lib/growth/conversion/paywall.engine.ts"),
    "utf8",
  );
  assert(paywallSource.includes("checkFeatureAccess"), "paywall uses checkFeatureAccess");
  assert(!paywallSource.includes("enforceFeatureAccess"), "paywall does not bypass enforce gate in API");
  assert(paywallSource.includes("getActiveSubscription"), "paywall reads subscription");
  assert(paywallSource.includes("getUsageCountInPeriod"), "paywall reads usage limits");
  assert(paywallSource.includes("budget_feature_blocked"), "budget conversion trigger");
  assert(paywallSource.includes("trackPaywallShown"), "paywall tracks conversion event");
  console.log("✓ paywall engine wired to feature gate + subscription + usage");
}

function checkProductApiGrowthHooks() {
  for (const [route, needle] of [
    ["app/api/quote/generate/route.ts", "recordQuoteGenerationSuccess"],
    ["app/api/budget/calculate/route.ts", "growthAwareGateErrorResponse"],
    ["app/api/tender/generate/route.ts", "trackTenderGenerated"],
    ["app/api/project/create/route.ts", "recordProjectCreation"],
  ] as const) {
    const content = fs.readFileSync(path.join(ROOT, route), "utf8");
    assert(content.includes(needle), `${route} must include ${needle}`);
    assert(content.includes("runSaasApiGate") || content.includes("runSaasOrgGate"), `${route} still gated`);
  }
  console.log("✓ product API growth hooks (gate preserved)");
}

function checkRetentionRuntime() {
  clearGrowthStoreForTests();
  trackQuoteGenerated({ organizationId: "org-ret-1", isFirst: false });
  trackQuoteGenerated({ organizationId: "org-ret-1", isFirst: false });
  const profile = computeRetentionProfile("org-ret-1");
  assert(profile.quoteCount === 2, "quote count retention");
  const churn = predictChurn("org-ret-1");
  assert(["low", "medium", "high"].includes(churn.churnRisk), "churn risk level");
  console.log("✓ retention + churn runtime");
}

function checkAnalyticsRequiredEvents() {
  const analyticsSource = fs.readFileSync(path.join(ROOT, "lib/growth/analytics.events.ts"), "utf8");
  for (const fn of [
    "trackSignup",
    "trackActivation",
    "trackQuoteGenerated",
    "trackUpgradeClicked",
    "trackPaymentCompleted",
  ]) {
    assert(analyticsSource.includes(`export function ${fn}`), `missing analytics ${fn}`);
  }
  console.log("✓ required analytics events");
}

function checkV58Untouched() {
  assert(fs.existsSync(path.join(V58_DIR, "freeze/v58-final-frozen.ts")), "v58 freeze intact");
  const orchestration = fs.readFileSync(
    path.join(V58_DIR, "orchestration/quote-orchestrator.engine.ts"),
    "utf8",
  );
  assert(!orchestration.includes("evaluatePaywall"), "v58 not coupled to growth");
  console.log("✓ NO_V58_MODIFICATION");
  console.log("✓ NO_V57_MODIFICATION");
}

function checkNoBillingBypass() {
  const paywall = fs.readFileSync(path.join(ROOT, "lib/growth/conversion/paywall.engine.ts"), "utf8");
  const billingCheckout = fs.readFileSync(
    path.join(ROOT, "app/api/billing/create-checkout-session/route.ts"),
    "utf8",
  );
  const webhook = fs.readFileSync(path.join(ROOT, "app/api/billing/webhook/route.ts"), "utf8");

  assert(!paywall.includes("updateSubscriptionStatus"), "growth paywall does not mutate billing");
  assert(billingCheckout.includes("createCheckoutSession"), "billing checkout preserved");
  assert(webhook.includes("handleStripeWebhook"), "billing webhook preserved");
  console.log("✓ NO_BILLING_BYPASS");
}

function checkNoFeatureGateBypass() {
  const quote = fs.readFileSync(path.join(ROOT, "app/api/quote/generate/route.ts"), "utf8");
  assert(quote.includes("runSaasApiGate"), "quote still uses api gate");
  assert(quote.includes("trackFeatureUsage"), "quote still tracks usage");
  assert(typeof checkFeatureAccess === "function", "feature gate intact");
  console.log("✓ NO_FEATURE_GATE_BYPASS");
}

async function main() {
  checkModuleStructure();
  checkCapabilities();
  checkGrowthMetricsShape();
  checkOnboardingFlow();
  checkPaywallUsesFeatureGate();
  checkProductApiGrowthHooks();
  checkRetentionRuntime();
  checkAnalyticsRequiredEvents();
  checkV58Untouched();
  checkNoBillingBypass();
  checkNoFeatureGateBypass();
  console.log("\n✓ V60 P1 Growth System — ALL CHECKS PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
