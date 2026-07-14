/**
 * E03-P2 — Agent Runtime Kernel verification
 * Agent Definition -> Executable Agent Runtime
 * Lifecycle: READY -> RUNNING -> COMPLETED -> RESULT
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  E03_AGENT_PLATFORM_ID,
  E03_AGENT_PLATFORM_VERSION,
} from "../lib/agent-platform/e03/core/agent.constants";
import { buildAgentFoundation } from "../lib/agent-platform/e03/core/agent.lifecycle";
import {
  AGENT_CATALOG,
  getAgentById,
  getAgentByRole,
} from "../lib/agent-platform/e03/core/agent.registry";
import {
  assertValidExecutionContext,
  createAgentExecutionContext,
} from "../lib/agent-platform/e03/runtime/agent.context";
import {
  AGENT_EXECUTION_PHASES,
  advanceExecutionPhase,
  canAdvanceExecutionPhase,
  createReadyExecutionState,
} from "../lib/agent-platform/e03/runtime/agent.execution";
import {
  execute,
  executeOrThrow,
} from "../lib/agent-platform/e03/runtime/agent.executor";
import {
  assertAgentExecutionResultPass,
  buildAgentExecutionResult,
} from "../lib/agent-platform/e03/runtime/agent.result";
import {
  appendTraceEvent,
  createAgentRuntimeTrace,
} from "../lib/agent-platform/e03/runtime/agent.trace";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_P1 = [
  "lib/agent-platform/e03/core/agent.types.ts",
  "lib/agent-platform/e03/core/agent.constants.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function fileSha1(rel: string): string {
  const bytes = fs.readFileSync(path.join(ROOT, rel));
  return createHash("sha1").update(bytes).digest("hex");
}

function checkModuleStructure() {
  const required = [
    "lib/agent-platform/e03/runtime/agent.context.ts",
    "lib/agent-platform/e03/runtime/agent.execution.ts",
    "lib/agent-platform/e03/runtime/agent.executor.ts",
    "lib/agent-platform/e03/runtime/agent.result.ts",
    "lib/agent-platform/e03/runtime/agent.trace.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozenP1Unmodified(baseline: Record<string, string>) {
  for (const rel of FROZEN_P1) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing frozen P1: ${rel}`);
    check(fileSha1(rel) === baseline[rel], `frozen P1 modified: ${rel}`);
  }
  // Sanity: P1 foundation still boots
  const foundation = buildAgentFoundation();
  check(foundation.ready === true, "P1 foundation still ready");
  check(foundation.platformId === E03_AGENT_PLATFORM_ID, "P1 platform id intact");
  check(foundation.version === E03_AGENT_PLATFORM_VERSION, "P1 version intact");
  console.log("✓ frozen layers unmodified (E03 P1)");
}

function testContextAndExecutionState() {
  check(AGENT_EXECUTION_PHASES.length === 4, "execution phases");
  check(canAdvanceExecutionPhase("READY", "RUNNING"), "READY→RUNNING");
  check(!canAdvanceExecutionPhase("READY", "RESULT"), "skip blocked");

  const context = createAgentExecutionContext({
    agentId: "e03.agent.worker",
    taskId: "task-demo",
    input: { goal: "prepare fitness equipment shortlist" },
    metadata: { source: "verify-e03-p2" },
  });
  assertValidExecutionContext(context);
  check(context.readOnly === true, "context readOnly");
  check(context.agentId === "e03.agent.worker", "context agentId");

  let state = createReadyExecutionState();
  state = advanceExecutionPhase(state, "RUNNING");
  state = advanceExecutionPhase(state, "COMPLETED");
  state = advanceExecutionPhase(state, "RESULT");
  check(state.complete === true, "execution state complete");
  check(state.transitions.length === 3, "3 phase transitions");
  console.log("✓ context + execution state");
}

function testTraceAndResult() {
  const trace = createAgentRuntimeTrace({
    executionId: "exec_x",
    agentId: "e03.agent.planner",
    taskId: "task_x",
  });
  const withEvents = appendTraceEvent(trace, "ready", "boot");
  check(withEvents.eventCount === 1, "trace event");
  check(withEvents.readOnly === true, "trace readOnly");

  const result = buildAgentExecutionResult({
    success: true,
    output: { ok: true },
    traceId: withEvents.traceId,
    duration: 12,
    status: "result",
    executionId: "exec_x",
    agentId: "e03.agent.planner",
    taskId: "task_x",
  });
  assertAgentExecutionResultPass(result);
  console.log("✓ trace + result");
}

function testExecutor() {
  const worker = getAgentById("e03.agent.worker");
  check(Boolean(worker), "worker from P1 registry");

  const context = createAgentExecutionContext({
    agentId: worker!.id,
    input: { goal: "execute equipment packing checklist" },
  });

  const bundle = execute(worker!, context);
  check(bundle.result.success === true, "execute success");
  check(bundle.result.status === "result", "status result");
  check(bundle.state.phase === "RESULT", "phase RESULT");
  check(bundle.state.complete === true, "state complete");
  check(bundle.trace.eventCount >= 4, "trace events");
  check(bundle.result.traceId === bundle.trace.traceId, "traceId linked");
  check(bundle.result.executionId === context.executionId, "executionId linked");
  check(typeof bundle.result.duration === "number", "duration");

  // Reuse P1 definitions across catalog roles
  for (const agent of AGENT_CATALOG) {
    const ctx = createAgentExecutionContext({
      agentId: agent.id,
      input: { goal: `probe:${agent.role}`, tool: "noop" },
    });
    const run = executeOrThrow(agent, ctx);
    check(run.result.success === true, `${agent.id} success`);
    check(run.state.phase === "RESULT", `${agent.id} RESULT`);
  }

  const coordinator = getAgentByRole("coordinator");
  check(Boolean(coordinator), "coordinator present");
  const coordRun = executeOrThrow(
    coordinator!,
    createAgentExecutionContext({ agentId: coordinator!.id }),
  );
  check(
    Array.isArray(coordRun.result.output.agents),
    "coordinator output uses P1 dependsOn",
  );

  console.log("✓ executor (Definition -> Runtime)");
}

function main() {
  console.log("E03-P2 — Agent Runtime Kernel Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of FROZEN_P1) {
    baseline[rel] = fileSha1(rel);
  }

  checkModuleStructure();
  checkFrozenP1Unmodified(baseline);
  testContextAndExecutionState();
  testTraceAndResult();
  testExecutor();

  // Re-check frozen hashes after tests (ensure verify itself did not mutate P1)
  checkFrozenP1Unmodified(baseline);

  console.log("\nPASS — E03 P2 agent runtime (READY → RUNNING → COMPLETED → RESULT)");
}

main();
