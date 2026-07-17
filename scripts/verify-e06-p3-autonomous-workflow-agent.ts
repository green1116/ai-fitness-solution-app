/**
 * E06-P3 — Autonomous Workflow Agent verification
 * Workflow layer above E06 Business Action Runtime
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildOperationFoundation,
  E06_OPERATION_PLATFORM_ID,
} from "../lib/autonomous/e06";
import {
  E06_ACTION_BASE,
  E06_ACTION_RUNTIME_ID,
} from "../lib/autonomous/e06/action/action.constants";
import { buildActionRegistryManifest } from "../lib/autonomous/e06/action/action.registry";
import {
  E06_WORKFLOW_AGENT_ID,
  E06_WORKFLOW_BASE,
  E06_WORKFLOW_VERSION,
  WORKFLOW_GOAL_KINDS,
  WORKFLOW_INSTANCE_PHASES,
  WORKFLOW_TRACE_EVENT_KINDS,
} from "../lib/autonomous/e06/workflow/workflow.constants";
import {
  buildWorkflowRegistryManifest,
  getWorkflowByGoalKind,
  getWorkflowById,
  WORKFLOW_CATALOG,
} from "../lib/autonomous/e06/workflow/workflow.registry";
import { planWorkflow } from "../lib/autonomous/e06/workflow/workflow.planner";
import {
  executeWorkflowAgent,
  executeWorkflowAgentOrThrow,
} from "../lib/autonomous/e06/workflow/workflow.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E06_P1_P2 = [
  "lib/autonomous/e06/core/operation.types.ts",
  "lib/autonomous/e06/core/operation.constants.ts",
  "lib/autonomous/e06/core/operation.lifecycle.ts",
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.context.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/autonomous/e06/policy/operation.policy.ts",
  "lib/autonomous/e06/policy/operation.policy.registry.ts",
  "lib/autonomous/e06/index.ts",
  "lib/autonomous/e06/action/action.types.ts",
  "lib/autonomous/e06/action/action.constants.ts",
  "lib/autonomous/e06/action/action.registry.ts",
  "lib/autonomous/e06/action/action.executor.ts",
  "lib/autonomous/e06/action/action.result.ts",
  "lib/autonomous/e06/action/action.trace.ts",
] as const;

const FROZEN_UPSTREAM = [
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/intelligence/e05/index.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function sha1(rel: string): string {
  return createHash("sha1")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex");
}

function checkModules() {
  const required = [
    "lib/autonomous/e06/workflow/workflow.types.ts",
    "lib/autonomous/e06/workflow/workflow.constants.ts",
    "lib/autonomous/e06/workflow/workflow.registry.ts",
    "lib/autonomous/e06/workflow/workflow.planner.ts",
    "lib/autonomous/e06/workflow/workflow.executor.ts",
    "lib/autonomous/e06/workflow/workflow.trace.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozen(
  label: string,
  files: readonly string[],
  baseline: Record<string, string>,
) {
  for (const rel of files) {
    check(sha1(rel) === baseline[rel], `${label} modified: ${rel}`);
  }
}

function checkBasesIntact() {
  const foundation = buildOperationFoundation();
  check(foundation.ready === true, "E06-P1 foundation still ready");
  check(
    foundation.platformId === E06_OPERATION_PLATFORM_ID,
    "E06-P1 platform id intact",
  );

  const actions = buildActionRegistryManifest();
  check(actions.catalogComplete === true, "E06-P2 actions still complete");
  check(actions.runtimeId === E06_ACTION_RUNTIME_ID, "E06-P2 runtime id");
  check(
    E06_ACTION_BASE === "enterprise-e06-p1-autonomous-operation-foundation-v1",
    "E06-P2 base constant",
  );
  check(
    E06_WORKFLOW_BASE === "enterprise-e06-p2-business-action-runtime-v1",
    "E06-P3 base constant",
  );
  console.log("✓ upstream + E06-P1/P2 unmodified / bases intact");
}

function testRegistryAndPlanner() {
  check(WORKFLOW_GOAL_KINDS.length === 3, "goal kinds");
  check(WORKFLOW_INSTANCE_PHASES.length === 4, "instance phases");
  check(WORKFLOW_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(WORKFLOW_CATALOG.length === 3, "workflows");

  const manifest = buildWorkflowRegistryManifest();
  check(manifest.catalogComplete === true, "workflow catalog complete");
  check(manifest.agentId === E06_WORKFLOW_AGENT_ID, "agent id");
  check(manifest.version === E06_WORKFLOW_VERSION, "version");
  check(manifest.base === E06_WORKFLOW_BASE, "base e06-p2");
  check(manifest.goalKinds.length === 3, "goal kinds covered");

  check(
    getWorkflowByGoalKind("respond")?.id === "e06.workflow.enterprise-response",
    "by goal kind",
  );

  const respond = getWorkflowById("e06.workflow.enterprise-response");
  check(Boolean(respond), "respond workflow");
  const plan = planWorkflow(respond!);
  check(plan.stepCount === 4, "respond plan steps");
  check(plan.steps[0].actionKind === "notify", "first step notify");
  check(plan.steps[3].actionKind === "orchestrate", "last step orchestrate");
  check(
    plan.steps.every((s, i) => s.order === i + 1),
    "step order",
  );
  check(plan.narrative.includes("4 steps"), "narrative");
  console.log("✓ workflow registry + planner");
  console.log(plan.narrative);
}

function testExecutor() {
  const respond = getWorkflowById("e06.workflow.enterprise-response");

  const run = executeWorkflowAgentOrThrow(respond!, {
    input: {
      goal: "星河科技园健身中心企业响应工作流",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e06-p3" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.completedSteps === 4, "all steps completed");
  check(run.result.effects.length === 4, "effects collected");
  check(
    run.result.effects.includes("opportunity-signal-notified"),
    "notify effect",
  );
  check(
    run.result.effects.includes("synthesis-orchestrated"),
    "orchestrate effect",
  );
  check(
    run.result.stepResults.every((s) => s.success && s.status === "result"),
    "step results",
  );
  check(run.trace.eventCount >= 10, "trace events recorded");
  check(
    run.trace.events.some((e) => e.kind === "plan"),
    "plan trace event",
  );
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const workflow of WORKFLOW_CATALOG) {
    const bundle = executeWorkflowAgentOrThrow(workflow, {
      input: { goal: `probe:${workflow.goalKind}`, ready: true, riskScore: 10 },
    });
    check(bundle.result.success === true, `${workflow.id} success`);
    check(
      bundle.result.completedSteps === workflow.actionIds.length,
      `${workflow.id} steps`,
    );
  }

  const blocked = executeWorkflowAgent(respond!, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(blocked.result.completedSteps === 0, "no steps completed");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  console.log("✓ workflow executor → E06 action sequence bridge");
}

function main() {
  console.log("E06-P3 — Autonomous Workflow Agent Verification\n");

  const frozen = [...FROZEN_E06_P1_P2, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E06-P1/P2", FROZEN_E06_P1_P2, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndPlanner();
  testExecutor();
  checkFrozen("E06-P1/P2", FROZEN_E06_P1_P2, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E06 P3 autonomous workflow agent");
}

main();
