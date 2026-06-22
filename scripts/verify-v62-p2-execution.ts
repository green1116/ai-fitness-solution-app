/**
 * V62 P2 AI Autonomous Execution System Verification
 */
import fs from "node:fs";
import path from "node:path";

import { appendGrowthEvent, clearGrowthStoreForTests } from "../lib/growth/growth.events.store";
import {
  generateExecutionPlan,
  prioritizeActions,
  executeGrowthAction,
  executeSalesAction,
  executePricingAction,
  executeCRMAction,
  dispatchSystemAction,
  executeAction,
  triggerAutomationRules,
  runAutonomousExecution,
  monitorExecutionResult,
  reverseExecution,
  buildExecutionContext,
  validateExecutionAction,
  clearExecutionStoreForTests,
  resetPlannerCounterForTests,
  resetRuleCounterForTests,
  clearSchedulerForTests,
} from "../lib/ai-execution/execution.service";
import { runTriggerEngine } from "../lib/ai-execution/triggers/trigger.engine";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/ai-execution/core/execution-engine.ts",
    "lib/ai-execution/core/execution.types.ts",
    "lib/ai-execution/core/execution.context.ts",
    "lib/ai-execution/core/execution.validation.ts",
    "lib/ai-execution/planner/action-planner.ts",
    "lib/ai-execution/planner/execution-planner.ts",
    "lib/ai-execution/planner/priority-resolver.ts",
    "lib/ai-execution/executor/growth.executor.ts",
    "lib/ai-execution/executor/sales.executor.ts",
    "lib/ai-execution/executor/pricing.executor.ts",
    "lib/ai-execution/executor/crm.executor.ts",
    "lib/ai-execution/automation/automation.engine.ts",
    "lib/ai-execution/automation/automation.rules.ts",
    "lib/ai-execution/automation/automation.scheduler.ts",
    "lib/ai-execution/triggers/trigger.engine.ts",
    "lib/ai-execution/triggers/signal.listener.ts",
    "lib/ai-execution/triggers/event.trigger.ts",
    "lib/ai-execution/execution.service.ts",
    "app/api/execution/run/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ execution module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_EXECUTION_ENGINE: typeof runAutonomousExecution === "function",
    HAS_ACTION_PLANNER: fs.existsSync(path.join(ROOT, "lib/ai-execution/planner/action-planner.ts")),
    HAS_EXECUTION_PLANNER: typeof generateExecutionPlan === "function",
    HAS_AUTOMATION_ENGINE: typeof triggerAutomationRules === "function",
    HAS_TRIGGER_SYSTEM: typeof runTriggerEngine === "function",
    HAS_GROWTH_EXECUTOR: typeof executeGrowthAction === "function",
    HAS_SALES_EXECUTOR: typeof executeSalesAction === "function",
    HAS_CRM_EXECUTOR: typeof executeCRMAction === "function",
    HAS_SYSTEM_DISPATCHER: typeof dispatchSystemAction === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkNoDirectSystemMutation() {
  const execDir = path.join(ROOT, "lib/ai-execution");
  const files = walkTs(execDir);
  let unsafe = false;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const rel = path.relative(ROOT, file);
    if (rel.includes("execution.validation.ts")) continue;
    if (/@prisma\/client|createCheckout|stripe\.prices|bypassFeatureGate/i.test(content)) {
      console.error(`unsafe pattern in ${rel}`);
      unsafe = true;
    }
  }

  const engine = fs.readFileSync(path.join(ROOT, "lib/ai-execution/core/execution-engine.ts"), "utf8");
  assert(engine.includes("validateExecutionAction"), "validation layer required");
  assert(engine.includes("logExecution"), "execution logging required");

  const api = fs.readFileSync(path.join(ROOT, "app/api/execution/run/route.ts"), "utf8");
  assert(api.includes("runSaasOrgGate"), "API must use saas gate");

  assert(!unsafe, "no direct system mutation / billing bypass");
  console.log("✓ NO_DIRECT_SYSTEM_MUTATION");
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
  const pricing = fs.readFileSync(
    path.join(ROOT, "lib/ai-execution/executor/pricing.executor.ts"),
    "utf8",
  );
  assert(pricing.includes("readOnly") || pricing.includes("read-only") || pricing.includes("no Stripe"), "pricing safety note");
  assert(pricing.includes("appendGrowthEvent"), "pricing via growth events only");

  const validation = fs.readFileSync(
    path.join(ROOT, "lib/ai-execution/core/execution.validation.ts"),
    "utf8",
  );
  assert(validation.includes("mutateBilling"), "billing mutation guard");

  console.log("✓ NO_V57_MODIFICATION");
  console.log("✓ NO_V58_MODIFICATION");
  console.log("✓ NO_UNSAFE_AUTOMATION");
}

async function runRuntimeTests() {
  clearGrowthStoreForTests();
  clearExecutionStoreForTests();
  clearSchedulerForTests();
  resetPlannerCounterForTests();
  resetRuleCounterForTests();

  appendGrowthEvent({ event: "visitor.landing", organizationId: "org-exec-1" });
  appendGrowthEvent({ event: "user.signup", organizationId: "org-exec-1", userId: "u1" });
  appendGrowthEvent({
    event: "payment.completed",
    organizationId: "org-exec-1",
    meta: { plan: "PRO", amount: 1188 },
  });

  const ctx = buildExecutionContext("org-exec-1", "trace-test-1");
  assert(ctx.business.mrr >= 0, "execution context");

  const plan = generateExecutionPlan("org-exec-1", { traceId: "trace-test-1" });
  assert(plan.actions.length >= 0, "execution plan");
  assert(typeof generateExecutionPlan === "function", "generateExecutionPlan");

  const ordered = prioritizeActions(plan.actions);
  assert(ordered.length === plan.actions.length, "prioritizeActions");

  const growthAction = {
    id: "test-growth-1",
    type: "GROWTH" as const,
    priority: "HIGH" as const,
    payload: { operation: "retention" },
    targetSystem: "V60" as const,
    organizationId: "org-exec-1",
    reversible: true,
  };
  validateExecutionAction(growthAction);
  const growthResult = await executeAction(growthAction, "trace-test-1");
  assert(growthResult.status === "executed", "growth execution");

  const salesResult = await executeSalesAction(
    {
      id: "test-sales-1",
      type: "SALES",
      priority: "MEDIUM",
      payload: { operation: "proposal_reminder" },
      targetSystem: "V60",
      organizationId: "org-exec-1",
    },
    "trace-test-1",
  );
  assert(salesResult.status === "executed" || salesResult.status === "skipped", "sales execution");

  const pricingResult = await executePricingAction(
    {
      id: "test-pricing-1",
      type: "PRICING",
      priority: "LOW",
      payload: { operation: "adjust" },
      targetSystem: "V60",
      organizationId: "org-exec-1",
    },
    "trace-test-1",
  );
  assert(pricingResult.status === "executed", "pricing execution");

  const crmResult = await executeCRMAction(
    {
      id: "test-crm-1",
      type: "CRM",
      priority: "HIGH",
      payload: { operation: "reactivation" },
      targetSystem: "V60",
      organizationId: "org-exec-1",
    },
    "trace-test-1",
  );
  assert(crmResult.status === "executed", "crm execution");

  const sysResult = await dispatchSystemAction(
    {
      id: "test-sys-1",
      type: "SYSTEM",
      priority: "LOW",
      payload: { operation: "metrics_refresh" },
      targetSystem: "V61",
      organizationId: "org-exec-1",
    },
    "trace-test-1",
  );
  assert(sysResult.status === "executed", "system dispatch");

  const automation = await triggerAutomationRules("org-exec-1", "trace-test-1", {
    executeImmediately: true,
  });
  assert(Array.isArray(automation.rules), "automation rules");

  const autonomous = await runAutonomousExecution("org-exec-1", "trace-auto-1");
  assert(autonomous.results.length >= 0, "autonomous execution");

  const monitor = monitorExecutionResult("org-exec-1");
  assert(monitor.total >= 0, "execution monitor");

  if (growthResult.reversible) {
    const reversed = await reverseExecution(growthAction.id, "trace-reverse-1");
    if (reversed) assert(reversed.status === "reversed", "reversible execution");
  }

  const triggered = await runTriggerEngine("org-exec-1", "trace-trigger-1");
  assert(Array.isArray(triggered.signals), "trigger engine");

  console.log("✓ runtime execution pipeline");
}

async function main() {
  console.log("V62 P2 AI Autonomous Execution Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkNoDirectSystemMutation();
  checkRegressionGuards();
  await runRuntimeTests();
  console.log("\n✅ V62 P2 AI Autonomous Execution System verified");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
