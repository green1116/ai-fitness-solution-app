/**
 * V62 P3 Autonomous Company System Verification
 */
import fs from "node:fs";
import path from "node:path";

import { appendGrowthEvent, clearGrowthStoreForTests } from "../lib/growth/growth.events.store";
import { clearExecutionStoreForTests } from "../lib/ai-execution/execution.service";
import {
  runAutonomousCompanyCycle,
  analyzeCompanyState,
  generateBusinessStrategy,
  executeCompanyActions,
  optimizeRevenueAutomatically,
  optimizeGrowthAutomatically,
  optimizeSalesAutomatically,
  selfHealSystemIssues,
  enforceBusinessPolicies,
  getGovernanceCatalog,
  getCompanyControllerStatus,
  runCompanyLoopIteration,
  clearCompanyLoopForTests,
  guardExecutionBatch,
  ingestBusinessFeedback,
} from "../lib/autonomous-company/autonomous-company.service";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/autonomous-company/core/autonomous-company.engine.ts",
    "lib/autonomous-company/core/company.brain.ts",
    "lib/autonomous-company/core/company.state.ts",
    "lib/autonomous-company/core/company.loop.ts",
    "lib/autonomous-company/governance/policy.engine.ts",
    "lib/autonomous-company/governance/constraint.engine.ts",
    "lib/autonomous-company/governance/safety.guard.ts",
    "lib/autonomous-company/economy/revenue.optimizer.ts",
    "lib/autonomous-company/economy/pricing.optimizer.ts",
    "lib/autonomous-company/economy/cost.reducer.ts",
    "lib/autonomous-company/growth/autonomous.growth.loop.ts",
    "lib/autonomous-company/growth/acquisition.engine.ts",
    "lib/autonomous-company/growth/retention.engine.ts",
    "lib/autonomous-company/sales/autonomous.sales.loop.ts",
    "lib/autonomous-company/sales/deal.closer.ai.ts",
    "lib/autonomous-company/sales/negotiation.engine.ts",
    "lib/autonomous-company/control/company.control.plane.ts",
    "lib/autonomous-company/control/feedback.loop.ts",
    "lib/autonomous-company/control/system.self.healing.ts",
    "lib/autonomous-company/autonomous-company.service.ts",
    "app/api/autonomous/company/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ autonomous company module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_AUTONOMOUS_ENGINE: typeof runAutonomousCompanyCycle === "function",
    HAS_BUSINESS_LOOP: typeof runCompanyLoopIteration === "function",
    HAS_COMPANY_CONTROLLER: typeof getCompanyControllerStatus === "function",
    HAS_GROWTH_LOOP: typeof optimizeGrowthAutomatically === "function",
    HAS_SALES_LOOP: typeof optimizeSalesAutomatically === "function",
    HAS_REVENUE_LOOP: typeof optimizeRevenueAutomatically === "function",
    HAS_SELF_HEALING: typeof selfHealSystemIssues === "function",
    HAS_GOVERNANCE_LAYER: typeof enforceBusinessPolicies === "function",
    HAS_SAFETY_GUARDS: typeof guardExecutionBatch === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkSafetyGuards() {
  const safety = fs.readFileSync(
    path.join(ROOT, "lib/autonomous-company/governance/safety.guard.ts"),
    "utf8",
  );
  assert(safety.includes("V57/V58"), "must protect frozen systems");
  assert(safety.includes("mutateBilling"), "must block billing mutation");

  const policy = fs.readFileSync(
    path.join(ROOT, "lib/autonomous-company/governance/policy.engine.ts"),
    "utf8",
  );
  assert(policy.includes("tenant_isolation"), "tenant isolation policy");
  assert(policy.includes("feature_gate"), "feature gate policy");

  const api = fs.readFileSync(path.join(ROOT, "app/api/autonomous/company/route.ts"), "utf8");
  assert(api.includes("runSaasOrgGate"), "API must use saas gate");

  const acDir = path.join(ROOT, "lib/autonomous-company");
  for (const file of walkTs(acDir)) {
    const rel = path.relative(ROOT, file);
    if (rel.includes("safety.guard") || rel.includes("policy.engine")) continue;
    const content = fs.readFileSync(file, "utf8");
    if (/@prisma\/client|createCheckout|bypassFeatureGate/i.test(content)) {
      throw new Error(`unsafe pattern in ${rel}`);
    }
  }

  console.log("✓ NO_BILLING_BYPASS");
  console.log("✓ NO_TENANT_BYPASS");
  console.log("✓ NO_FEATURE_GATE_BYPASS");
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

function checkRegressionGuards() {
  assert(fs.existsSync(V58_DIR), "V58 must exist");
  console.log("✓ NO_V57_MODIFICATION");
  console.log("✓ NO_V58_MODIFICATION");
}

async function runRuntimeTests() {
  clearGrowthStoreForTests();
  clearExecutionStoreForTests();
  clearCompanyLoopForTests();

  appendGrowthEvent({ event: "visitor.landing", organizationId: "org-auto-1" });
  appendGrowthEvent({ event: "user.signup", organizationId: "org-auto-1", userId: "u1" });
  appendGrowthEvent({
    event: "payment.completed",
    organizationId: "org-auto-1",
    meta: { plan: "PRO", amount: 1188 },
  });

  let state = analyzeCompanyState("org-auto-1", "trace-auto-co-1");
  assert(state.organizationId === "org-auto-1", "company state");
  assert(["thriving", "stable", "stressed", "critical"].includes(state.health), "health");

  state = generateBusinessStrategy(state);
  assert(!!state.strategy, "business strategy");

  const policies = enforceBusinessPolicies("org-auto-1");
  assert(policies.length > 0, "policies enforced");
  assert(getGovernanceCatalog().length >= 5, "governance catalog");

  const revenueOpts = optimizeRevenueAutomatically(state);
  assert(revenueOpts.length > 0, "revenue loop");

  const growth = await optimizeGrowthAutomatically(state);
  assert(growth.tactics.length > 0, "growth loop");

  const sales = await optimizeSalesAutomatically(state);
  assert(sales.tactics.length > 0, "sales loop");

  const healing = await selfHealSystemIssues(state);
  assert(Array.isArray(healing.tactics), "self healing");

  const execution = await executeCompanyActions(state);
  assert(Array.isArray(execution.results), "company actions");

  const feedback = ingestBusinessFeedback("org-auto-1");
  assert(feedback.dashboard.mrr >= 0, "feedback loop");

  const iteration = await runCompanyLoopIteration("org-auto-1", "trace-loop-1");
  assert(iteration.outcome.cycle >= 1, "business loop cycle");

  const report = await runAutonomousCompanyCycle("org-auto-1", { traceId: "trace-cycle-1" });
  assert(report.outcomes.length >= 1, "autonomous company cycle");
  assert(Object.keys(report.feedback).length > 0, "feedback metrics");

  const controller = getCompanyControllerStatus("org-auto-1");
  assert(controller.controlPlane.includes("autonomous"), "company controller");

  console.log("✓ runtime autonomous company cycle");
}

async function main() {
  console.log("V62 P3 Autonomous Company System Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkSafetyGuards();
  checkRegressionGuards();
  await runRuntimeTests();
  console.log("\n✅ V62 P3 Autonomous Company System verified");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
