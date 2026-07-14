/**
 * E04-P2 — Business Workflow Runtime verification
 * Workflow layer above E04 Business Agent Foundation
 * Lifecycle: READY -> RUNNING -> COMPLETED -> RESULT
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildBusinessAgentFoundation } from "../lib/business-agent/e04/core/business-agent.lifecycle";
import {
  E04_BUSINESS_AGENT_PLATFORM_ID,
  E04_BUSINESS_AGENT_VERSION,
} from "../lib/business-agent/e04/core/business-agent.constants";
import {
  E04_WORKFLOW_BASE,
  E04_WORKFLOW_RUNTIME_ID,
  E04_WORKFLOW_VERSION,
  WORKFLOW_INSTANCE_PHASES,
} from "../lib/business-agent/e04/workflow/workflow.constants";
import {
  advanceWorkflowPhase,
  canAdvanceWorkflowPhase,
  createReadyWorkflowState,
} from "../lib/business-agent/e04/workflow/workflow.lifecycle";
import {
  WORKFLOW_CATALOG,
  buildWorkflowRegistryManifest,
  getWorkflowById,
  listRequiredWorkflows,
} from "../lib/business-agent/e04/workflow/workflow.registry";
import {
  appendWorkflowTraceEvent,
  createWorkflowRuntimeTrace,
} from "../lib/business-agent/e04/workflow/workflow.trace";
import {
  createWorkflowInstance,
  executeWorkflowOrThrow,
} from "../lib/business-agent/e04/workflow/workflow.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E04_P1 = [
  "lib/business-agent/e04/core/business-agent.types.ts",
  "lib/business-agent/e04/core/business-agent.constants.ts",
  "lib/business-agent/e04/core/business-agent.lifecycle.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/capability/capability.types.ts",
  "lib/business-agent/e04/capability/capability.registry.ts",
  "lib/business-agent/e04/runtime/business-agent.context.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
  "lib/business-agent/e04/index.ts",
] as const;

const FROZEN_E03 = [
  "lib/agent-platform/e03/core/agent.types.ts",
  "lib/agent-platform/e03/core/agent.constants.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
  "lib/agent-platform/e03/runtime/agent.context.ts",
  "lib/agent-platform/e03/runtime/agent.executor.ts",
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
    "lib/business-agent/e04/workflow/workflow.types.ts",
    "lib/business-agent/e04/workflow/workflow.constants.ts",
    "lib/business-agent/e04/workflow/workflow.registry.ts",
    "lib/business-agent/e04/workflow/workflow.lifecycle.ts",
    "lib/business-agent/e04/workflow/workflow.executor.ts",
    "lib/business-agent/e04/workflow/workflow.trace.ts",
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
  const foundation = buildBusinessAgentFoundation();
  check(foundation.ready === true, "E04 P1 foundation still ready");
  check(
    foundation.platformId === E04_BUSINESS_AGENT_PLATFORM_ID,
    "E04 P1 platform id intact",
  );
  check(
    foundation.version === E04_BUSINESS_AGENT_VERSION,
    "E04 P1 version intact",
  );
  check(
    E04_WORKFLOW_BASE === "enterprise-e04-p1-business-agent-foundation-v1",
    "workflow base constant",
  );
  console.log("✓ E03 + E04 P1 unmodified / bases intact");
}

function testRegistryAndLifecycle() {
  check(WORKFLOW_INSTANCE_PHASES.length === 4, "phases");
  check(canAdvanceWorkflowPhase("READY", "RUNNING"), "READY→RUNNING");
  check(!canAdvanceWorkflowPhase("READY", "RESULT"), "skip blocked");

  check(WORKFLOW_CATALOG.length === 2, "workflow catalog");
  const manifest = buildWorkflowRegistryManifest();
  check(manifest.catalogComplete === true, "catalog complete");
  check(manifest.runtimeId === E04_WORKFLOW_RUNTIME_ID, "runtime id");
  check(manifest.version === E04_WORKFLOW_VERSION, "version");
  check(manifest.base === E04_WORKFLOW_BASE, "base");
  check(listRequiredWorkflows().length === 1, "required workflows");

  const tender = getWorkflowById("e04.workflow.tender-response");
  check(Boolean(tender), "tender workflow");
  check(tender!.steps.length === 6, "tender steps");

  let state = createReadyWorkflowState(tender!);
  state = advanceWorkflowPhase(state, "RUNNING");
  state = advanceWorkflowPhase(state, "COMPLETED");
  state = advanceWorkflowPhase(state, "RESULT");
  check(state.complete === true, "lifecycle complete");
  check(state.steps.every((s) => s.status === "pending"), "steps pending at start");

  console.log("✓ registry + lifecycle");
}

function testTrace() {
  const trace = createWorkflowRuntimeTrace({
    instanceId: "inst_x",
    workflowId: "e04.workflow.quick-intake",
    taskId: "task_x",
  });
  const next = appendWorkflowTraceEvent(trace, "ready", "boot");
  check(next.eventCount === 1, "trace event");
  check(next.readOnly === true, "trace readOnly");
  console.log("✓ workflow trace");
}

function testExecutor() {
  const workflow = getWorkflowById("e04.workflow.tender-response");
  check(Boolean(workflow), "tender workflow present");

  const instance = createWorkflowInstance({
    workflow: workflow!,
    input: { goal: "星河科技园健身中心招采响应" },
    metadata: { source: "verify-e04-p2" },
  });
  check(instance.state.phase === "READY", "instance ready");
  check(instance.state.steps.length === 6, "instance steps");

  const run = executeWorkflowOrThrow(workflow!, {
    input: {
      goal: "星河科技园健身中心招采响应",
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e04-p2" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.state.phase === "RESULT", "phase RESULT");
  check(run.state.complete === true, "state complete");
  check(run.state.steps.every((s) => s.status === "completed"), "all steps done");
  check(run.result.stepOutputs.length === 6, "step outputs");
  check(run.trace.eventCount >= 4, "trace events");
  check(run.result.traceId === run.trace.traceId, "traceId linked");

  const quick = getWorkflowById("e04.workflow.quick-intake");
  check(Boolean(quick), "quick workflow");
  const quickRun = executeWorkflowOrThrow(quick!, {
    input: { goal: "quick probe" },
  });
  check(quickRun.result.success === true, "quick success");
  check(quickRun.result.stepOutputs.length === 2, "quick steps");

  console.log("✓ workflow executor → business agent bridge");
}

function main() {
  console.log("E04-P2 — Business Workflow Runtime Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [...FROZEN_E04_P1, ...FROZEN_E03]) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testRegistryAndLifecycle();
  testTrace();
  testExecutor();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E04 P2 business workflow runtime");
}

main();
