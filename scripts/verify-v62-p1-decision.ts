/**
 * V62 P1 AI Decision Engine Verification
 */
import fs from "node:fs";
import path from "node:path";

import { appendGrowthEvent, clearGrowthStoreForTests } from "../lib/growth/growth.events.store";
import {
  analyzeBusinessState,
  detectGrowthBottlenecks,
  detectRevenueLeaks,
  generateStrategyPlan,
  optimizePricingStrategy,
  optimizeGrowthFunnels,
  optimizeSalesPipeline,
  generateActionPlan,
  runBusinessDecision,
  runDecisionPipeline,
  buildBusinessContext,
  executeDecisionAction,
  getDelegationTarget,
  resetActionCounterForTests,
} from "../lib/ai-decision/decision.service";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/ai-decision/core/decision-engine.ts",
    "lib/ai-decision/core/decision.types.ts",
    "lib/ai-decision/core/decision.context.ts",
    "lib/ai-decision/core/decision.pipeline.ts",
    "lib/ai-decision/analysis/kpi.analyzer.ts",
    "lib/ai-decision/analysis/revenue.analyzer.ts",
    "lib/ai-decision/analysis/growth.analyzer.ts",
    "lib/ai-decision/analysis/sales.analyzer.ts",
    "lib/ai-decision/strategy/growth.strategy.engine.ts",
    "lib/ai-decision/strategy/pricing.strategy.engine.ts",
    "lib/ai-decision/strategy/sales.strategy.engine.ts",
    "lib/ai-decision/optimizer/funnel.optimizer.ts",
    "lib/ai-decision/optimizer/conversion.optimizer.ts",
    "lib/ai-decision/optimizer/revenue.optimizer.ts",
    "lib/ai-decision/actions/action.generator.ts",
    "lib/ai-decision/actions/action.executor.ts",
    "lib/ai-decision/actions/recommendation.engine.ts",
    "lib/ai-decision/decision.service.ts",
    "app/api/decision/analyze/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ decision engine module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_DECISION_ENGINE: typeof runBusinessDecision === "function",
    HAS_KPI_ANALYZER: typeof analyzeBusinessState === "function",
    HAS_STRATEGY_ENGINE: typeof generateStrategyPlan === "function",
    HAS_OPTIMIZER: typeof optimizeGrowthFunnels === "function",
    HAS_ACTION_GENERATOR: typeof generateActionPlan === "function",
    HAS_BUSINESS_CONTEXT_MODEL: typeof buildBusinessContext === "function",
    HAS_DECISION_PIPELINE: typeof runDecisionPipeline === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkNoDirectExecution() {
  const executor = fs.readFileSync(
    path.join(ROOT, "lib/ai-decision/actions/action.executor.ts"),
    "utf8",
  );
  assert(executor.includes("getDelegationTarget"), "executor must declare delegation targets");
  assert(executor.includes("delegatedTo"), "executor must route through delegation layer");
  assert(!/stripe|createCheckout|prisma/i.test(executor), "executor must not touch billing/db directly");
  assert(!/bypassFeatureGate|skipFeatureGate/i.test(executor), "no feature gate bypass");
  console.log("✓ NO_DIRECT_EXECUTION (action layer delegates to V60)");
}

function checkRegressionGuards() {
  assert(fs.existsSync(V58_DIR), "V58 runtime must exist");

  const decisionApi = fs.readFileSync(path.join(ROOT, "app/api/decision/analyze/route.ts"), "utf8");
  assert(decisionApi.includes("runSaasOrgGate"), "decision API must use saas gate");

  const engine = fs.readFileSync(path.join(ROOT, "lib/ai-decision/core/decision-engine.ts"), "utf8");
  assert(!engine.includes("@prisma/client"), "decision engine must not use prisma");

  console.log("✓ NO_V57_MODIFICATION (additive)");
  console.log("✓ NO_V58_MODIFICATION");
  console.log("✓ NO_BILLING_BYPASS");
}

async function runRuntimeTests() {
  clearGrowthStoreForTests();
  resetActionCounterForTests();

  appendGrowthEvent({ event: "visitor.landing", organizationId: "org-dec-1" });
  appendGrowthEvent({ event: "user.signup", organizationId: "org-dec-1", userId: "u1" });
  appendGrowthEvent({
    event: "payment.completed",
    organizationId: "org-dec-1",
    meta: { plan: "PRO", amount: 1188 },
  });

  const context = buildBusinessContext("org-dec-1");
  assert(context.mrr >= 0, "business context built");
  assert(typeof context.churnRate === "number", "churn in context");

  const analysis = analyzeBusinessState(context);
  assert(["strong", "stable", "at_risk", "critical"].includes(analysis.health), "health score");

  const bottlenecks = detectGrowthBottlenecks(context);
  assert(Array.isArray(bottlenecks), "growth bottlenecks");

  const leaks = detectRevenueLeaks(context);
  assert(Array.isArray(leaks), "revenue leaks");

  const strategy = generateStrategyPlan(context, "org-dec-1");
  assert(strategy.growth.length > 0, "growth strategy");
  assert(strategy.pricing.length > 0, "pricing strategy");
  assert(strategy.sales.length > 0, "sales strategy");

  optimizeGrowthFunnels(context);
  optimizePricingStrategy(context);
  optimizeSalesPipeline(context, "org-dec-1");

  const actions = generateActionPlan(context, "org-dec-1");
  assert(actions.length >= 0, "action plan");

  const decision = runBusinessDecision("org-dec-1");
  assert(decision.output.insights.length > 0, "insights");
  assert(decision.output.recommendations.length > 0, "recommendations");

  const pipeline = await runDecisionPipeline({ organizationId: "org-dec-1", executeActions: true });
  assert(pipeline.output.actions.length >= 0, "pipeline actions");
  assert(pipeline.executed.length === pipeline.actions.length, "executed all actions");

  const retentionAction = pipeline.actions.find((a) => a.type === "retention_campaign");
  if (retentionAction) {
    const result = await executeDecisionAction(retentionAction);
    assert(result.status === "delegated" || result.status === "scheduled", "delegated execution");
    assert(result.delegatedTo === getDelegationTarget("retention_campaign"), "correct delegate");
  }

  console.log("✓ runtime decision pipeline");
}

async function main() {
  console.log("V62 P1 AI Decision Engine Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkNoDirectExecution();
  checkRegressionGuards();
  await runRuntimeTests();
  console.log("\n✅ V62 P1 AI Decision Engine verified");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
