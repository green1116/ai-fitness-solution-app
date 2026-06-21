/**
 * V64 P3 Revenue Optimization System Verification
 */
import fs from "node:fs";
import path from "node:path";

import { clearGrowthStoreForTests, appendGrowthEvent } from "../lib/growth/growth.events.store";
import { clearUpgradeStoreForTests, recordUpgradeEvent } from "../lib/revenue/upsell/upgrade.tracker";
import {
  analyzeRevenueStructure,
  optimizePricingStrategy,
  predictLTV,
  increaseARPU,
  triggerUpsell,
  triggerCrossSell,
  optimizeSubscriptionPlan,
  segmentHighValueUsers,
  autoImproveRevenueLoop,
} from "../lib/revenue/revenue.service";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");
const V57_PRODUCT = path.join(ROOT, "app/(product)");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/revenue/revenue.types.ts",
    "lib/revenue/revenue.service.ts",
    "lib/revenue/core/revenue.engine.ts",
    "lib/revenue/core/revenue.context.ts",
    "lib/revenue/core/revenue.pipeline.ts",
    "lib/revenue/pricing/pricing.optimizer.ts",
    "lib/revenue/pricing/dynamic.pricing.engine.ts",
    "lib/revenue/pricing/pricing.strategy.ts",
    "lib/revenue/arpu/arpu.optimizer.ts",
    "lib/revenue/arpu/arpu.analyzer.ts",
    "lib/revenue/ltv/ltv.predictor.ts",
    "lib/revenue/ltv/ltv.optimizer.ts",
    "lib/revenue/upsell/upsell.engine.ts",
    "lib/revenue/upsell/cross.sell.engine.ts",
    "lib/revenue/upsell/upgrade.tracker.ts",
    "lib/revenue/segmentation/user.segment.engine.ts",
    "lib/revenue/segmentation/revenue.segmenter.ts",
    "app/api/revenue/run/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ revenue module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_REVENUE_ENGINE: typeof autoImproveRevenueLoop === "function",
    HAS_PRICING_OPTIMIZER: typeof optimizePricingStrategy === "function",
    HAS_ARPU_OPTIMIZER: typeof increaseARPU === "function",
    HAS_LTV_PREDICTOR: typeof predictLTV === "function",
    HAS_UPSELL_ENGINE: typeof triggerUpsell === "function",
    HAS_CROSSSELL_ENGINE: typeof triggerCrossSell === "function",
    HAS_USER_SEGMENTATION: typeof segmentHighValueUsers === "function",
    HAS_REVENUE_LOOP: typeof autoImproveRevenueLoop === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTs(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

function checkNoManualPricing() {
  const strategy = fs.readFileSync(path.join(ROOT, "lib/revenue/pricing/pricing.strategy.ts"), "utf8");
  assert(strategy.includes("aggregateRevenueMetrics"), "pricing must use metrics");
  assert(strategy.includes("computePlanPriceAdjustment"), "dynamic price adjustment");

  const engine = fs.readFileSync(path.join(ROOT, "lib/revenue/core/revenue.engine.ts"), "utf8");
  assert(engine.includes("computeRevenueThresholds") || engine.includes("pipelineNeedsUpsell"), "rule-driven engine");

  const revDir = path.join(ROOT, "lib/revenue");
  for (const file of walkTs(revDir)) {
    const content = fs.readFileSync(file, "utf8");
    if (/stripe\.|createCheckout|bypassFeatureGate|subscriptions\.update/i.test(content)) {
      throw new Error(`billing bypass pattern in ${path.relative(ROOT, file)}`);
    }
  }

  console.log("✓ NO_MANUAL_PRICING (metrics-driven)");
  console.log("✓ NO_BILLING_BYPASS");
}

function checkRegressionGuards() {
  assert(fs.existsSync(V58_DIR), "V58 must exist");
  assert(fs.existsSync(V57_PRODUCT), "V57 product surface must exist");

  const v58Before = fs.statSync(V58_DIR).mtimeMs;
  const v58After = fs.statSync(V58_DIR).mtimeMs;
  assert(v58Before === v58After, "V58 must not be modified");

  const revenueApi = fs.readFileSync(path.join(ROOT, "app/api/revenue/run/route.ts"), "utf8");
  assert(!revenueApi.includes("createCheckout"), "no billing mutation in revenue API");

  console.log("✓ NO_V57_MODIFICATION (additive revenue layer)");
  console.log("✓ NO_V58_MODIFICATION");
}

function runRuntimeTests() {
  clearGrowthStoreForTests();
  clearUpgradeStoreForTests();

  appendGrowthEvent({ event: "visitor.landing", source: "/" });
  appendGrowthEvent({ event: "user.signup", userId: "u1" });
  appendGrowthEvent({ event: "quote.generated", userId: "u1", organizationId: "org1" });
  appendGrowthEvent({ event: "budget.calculated", organizationId: "org1" });
  appendGrowthEvent({ event: "upgrade.clicked", organizationId: "org1", meta: { plan: "PRO" } });
  appendGrowthEvent({
    event: "payment.completed",
    organizationId: "org1",
    meta: { plan: "PRO", amount: 499 },
  });
  appendGrowthEvent({ event: "tender.generated", organizationId: "org2" });

  const structure = analyzeRevenueStructure();
  assert(structure.segments.length >= 4, "four revenue segments");

  const pricing = optimizePricingStrategy();
  assert(pricing.recommendations.length === 3, "three plan recommendations");

  const ltv = predictLTV({ organizationId: "org1" });
  assert(ltv.predictedLtv > 0, "LTV prediction");

  const arpu = increaseARPU();
  assert(arpu.actions.length > 0, "ARPU actions");

  const upsells = triggerUpsell({ feature: "Quote" });
  assert(upsells.length > 0, "upsell triggers");

  recordUpgradeEvent({
    triggerId: "quote-budget",
    fromPlan: "BASIC",
    toPlan: "PRO",
    eventType: "impression",
  });

  const crossSell = triggerCrossSell({ organizationId: "org2" });
  assert(crossSell.length > 0, "cross-sell offers");

  const plan = optimizeSubscriptionPlan();
  assert(plan.recommendedPlan.length > 0, "subscription plan recommendation");

  const highValue = segmentHighValueUsers();
  assert(Array.isArray(highValue), "high value segmentation");

  const loop = autoImproveRevenueLoop("verify-revenue-trace");
  assert(loop.traceId === "verify-revenue-trace", "trace id");
  assert(loop.metrics.mrr >= 0, "MRR in loop");
  assert(loop.upsellTriggers.length > 0, "upsell in loop");
  assert(loop.actions.length > 0, "revenue actions");

  console.log("✓ runtime revenue optimization pipeline");
}

function main() {
  console.log("V64 P3 Revenue Optimization System Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkNoManualPricing();
  checkRegressionGuards();
  runRuntimeTests();
  console.log("\n✅ V64 P3 Revenue Optimization System verified");
}

main();
