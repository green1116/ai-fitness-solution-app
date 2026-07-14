/**
 * E04-P3 — Business Process Orchestration verification
 * Process layer above E04 Workflow Runtime
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
  E04_WORKFLOW_RUNTIME_ID,
  E04_WORKFLOW_VERSION,
} from "../lib/business-agent/e04/workflow/workflow.constants";
import { buildWorkflowRegistryManifest } from "../lib/business-agent/e04/workflow/workflow.registry";
import {
  E04_PROCESS_BASE,
  E04_PROCESS_ORCHESTRATION_ID,
  E04_PROCESS_VERSION,
  PROCESS_INSTANCE_PHASES,
} from "../lib/business-agent/e04/process/process.constants";
import {
  buildProcessEdges,
  buildProcessGraph,
  isProcessGraphAcyclic,
  resolveProcessExecutionOrder,
} from "../lib/business-agent/e04/process/process.graph";
import {
  advanceProcessPhase,
  canAdvanceProcessPhase,
  createReadyProcessState,
} from "../lib/business-agent/e04/process/process.lifecycle";
import {
  PROCESS_CATALOG,
  buildProcessRegistryManifest,
  getProcessById,
  listRequiredProcesses,
} from "../lib/business-agent/e04/process/process.registry";
import {
  createProcessInstance,
  executeProcessOrThrow,
} from "../lib/business-agent/e04/process/process.executor";

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

const FROZEN_E04_P2 = [
  "lib/business-agent/e04/workflow/workflow.types.ts",
  "lib/business-agent/e04/workflow/workflow.constants.ts",
  "lib/business-agent/e04/workflow/workflow.registry.ts",
  "lib/business-agent/e04/workflow/workflow.lifecycle.ts",
  "lib/business-agent/e04/workflow/workflow.executor.ts",
  "lib/business-agent/e04/workflow/workflow.trace.ts",
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
    "lib/business-agent/e04/process/process.types.ts",
    "lib/business-agent/e04/process/process.constants.ts",
    "lib/business-agent/e04/process/process.registry.ts",
    "lib/business-agent/e04/process/process.lifecycle.ts",
    "lib/business-agent/e04/process/process.executor.ts",
    "lib/business-agent/e04/process/process.graph.ts",
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

  const workflows = buildWorkflowRegistryManifest();
  check(workflows.catalogComplete === true, "E04 P2 workflow intact");
  check(workflows.runtimeId === E04_WORKFLOW_RUNTIME_ID, "workflow runtime id");
  check(workflows.version === E04_WORKFLOW_VERSION, "workflow version");

  check(
    E04_PROCESS_BASE === "enterprise-e04-p2-business-workflow-runtime-v1",
    "process base constant",
  );
  console.log("✓ E03 + E04 P1/P2 unmodified / bases intact");
}

function testRegistryLifecycleGraph() {
  check(PROCESS_INSTANCE_PHASES.length === 4, "phases");
  check(canAdvanceProcessPhase("READY", "RUNNING"), "READY→RUNNING");
  check(!canAdvanceProcessPhase("READY", "RESULT"), "skip blocked");

  check(PROCESS_CATALOG.length === 2, "process catalog");
  const manifest = buildProcessRegistryManifest();
  check(manifest.catalogComplete === true, "catalog complete");
  check(manifest.orchestrationId === E04_PROCESS_ORCHESTRATION_ID, "id");
  check(manifest.version === E04_PROCESS_VERSION, "version");
  check(manifest.base === E04_PROCESS_BASE, "base");
  check(listRequiredProcesses().length === 1, "required processes");

  const enterprise = getProcessById("e04.process.enterprise-response");
  check(Boolean(enterprise), "enterprise process");
  check(enterprise!.nodes.length === 2, "enterprise nodes");

  const edges = buildProcessEdges(enterprise!.nodes);
  check(edges.length === 1, "one edge");
  check(isProcessGraphAcyclic(enterprise!.nodes, edges), "acyclic");
  check(
    resolveProcessExecutionOrder(enterprise!.nodes).join(",") ===
      "node.intake,node.response",
    "execution order",
  );

  const graph = buildProcessGraph(enterprise!);
  check(graph.acyclic === true, "graph acyclic");
  check(graph.order.length === 2, "graph order");

  let state = createReadyProcessState(enterprise!);
  state = advanceProcessPhase(state, "RUNNING");
  state = advanceProcessPhase(state, "COMPLETED");
  state = advanceProcessPhase(state, "RESULT");
  check(state.complete === true, "lifecycle complete");

  console.log("✓ registry + lifecycle + graph");
}

function testExecutor() {
  const process = getProcessById("e04.process.enterprise-response");
  check(Boolean(process), "enterprise process present");

  const instance = createProcessInstance({
    process: process!,
    input: { goal: "星河科技园健身中心招采响应" },
    metadata: { source: "verify-e04-p3" },
  });
  check(instance.state.phase === "READY", "instance ready");
  check(instance.state.nodes.length === 2, "instance nodes");

  const run = executeProcessOrThrow(process!, {
    input: {
      goal: "星河科技园健身中心招采响应",
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e04-p3" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.state.phase === "RESULT", "phase RESULT");
  check(run.state.complete === true, "state complete");
  check(run.state.nodes.every((n) => n.status === "completed"), "all nodes done");
  check(run.result.nodeOutputs.length === 2, "node outputs");
  check(run.graphOrder.join(",") === "node.intake,node.response", "order");
  check(
    run.result.nodeOutputs[0]!.workflowId === "e04.workflow.quick-intake",
    "first workflow",
  );
  check(
    run.result.nodeOutputs[1]!.workflowId === "e04.workflow.tender-response",
    "second workflow",
  );

  const intakeOnly = getProcessById("e04.process.intake-only");
  check(Boolean(intakeOnly), "intake-only process");
  const single = executeProcessOrThrow(intakeOnly!, {
    input: { goal: "intake probe" },
  });
  check(single.result.success === true, "intake-only success");
  check(single.result.nodeOutputs.length === 1, "single node");

  console.log("✓ process executor → workflow executor bridge");
}

function main() {
  console.log("E04-P3 — Business Process Orchestration Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [...FROZEN_E04_P1, ...FROZEN_E04_P2, ...FROZEN_E03]) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E04 P2", FROZEN_E04_P2, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testRegistryLifecycleGraph();
  testExecutor();
  checkFrozen("E04 P1", FROZEN_E04_P1, baseline);
  checkFrozen("E04 P2", FROZEN_E04_P2, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E04 P3 business process orchestration");
}

main();
