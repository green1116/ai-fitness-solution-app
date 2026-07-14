/**
 * E03-P3 — Tool Execution Runtime verification
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildAgentFoundation } from "../lib/agent-platform/e03/core/agent.lifecycle";
import {
  E03_AGENT_PLATFORM_ID,
  E03_AGENT_PLATFORM_VERSION,
} from "../lib/agent-platform/e03/core/agent.constants";
import { createAgentExecutionContext } from "../lib/agent-platform/e03/runtime/agent.context";
import { execute as executeAgent } from "../lib/agent-platform/e03/runtime/agent.executor";
import { getAgentByRole } from "../lib/agent-platform/e03/core/agent.registry";
import {
  buildToolRuntimeBootstrap,
  canAdvanceToolPhase,
  E03_TOOL_RUNTIME_BASE,
  E03_TOOL_RUNTIME_ID,
  E03_TOOL_RUNTIME_VERSION,
  evaluateToolPermission,
  getToolById,
  runTool,
  runToolOrThrow,
  TOOL_CATALOG,
  TOOL_EXECUTION_PHASES,
} from "../lib/agent-platform/e03/tool/tool.runtime";

const ROOT = path.resolve(__dirname, "..");

const FROZEN = [
  "lib/agent-platform/e03/core/agent.types.ts",
  "lib/agent-platform/e03/core/agent.constants.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
  "lib/agent-platform/e03/runtime/agent.context.ts",
  "lib/agent-platform/e03/runtime/agent.execution.ts",
  "lib/agent-platform/e03/runtime/agent.executor.ts",
  "lib/agent-platform/e03/runtime/agent.result.ts",
  "lib/agent-platform/e03/runtime/agent.trace.ts",
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
    "lib/agent-platform/e03/tool/tool.types.ts",
    "lib/agent-platform/e03/tool/tool.constants.ts",
    "lib/agent-platform/e03/tool/tool.contract.ts",
    "lib/agent-platform/e03/tool/tool.registry.ts",
    "lib/agent-platform/e03/tool/tool.permission.ts",
    "lib/agent-platform/e03/tool/tool.executor.ts",
    "lib/agent-platform/e03/tool/tool.result.ts",
    "lib/agent-platform/e03/tool/tool.trace.ts",
    "lib/agent-platform/e03/tool/tool.runtime.ts",
    "docs/E03-P3-TOOL-EXECUTION-RUNTIME.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozen(baseline: Record<string, string>) {
  for (const rel of FROZEN) {
    check(sha1(rel) === baseline[rel], `frozen modified: ${rel}`);
  }
  const foundation = buildAgentFoundation();
  check(foundation.ready === true, "P1 still ready");
  check(foundation.platformId === E03_AGENT_PLATFORM_ID, "P1 id intact");
  check(foundation.version === E03_AGENT_PLATFORM_VERSION, "P1 version intact");

  const worker = getAgentByRole("worker");
  check(Boolean(worker), "P2 worker present");
  const agentRun = executeAgent(
    worker!,
    createAgentExecutionContext({
      agentId: worker!.id,
      input: { goal: "p3-isolation-probe" },
    }),
  );
  check(agentRun.result.success === true, "P2 runtime still works");
  console.log("✓ frozen P1/P2 unmodified");
}

function testRegistryPermissionExecutor() {
  check(TOOL_EXECUTION_PHASES.length === 5, "phases");
  check(canAdvanceToolPhase("PENDING", "AUTHORIZED"), "PENDING→AUTHORIZED");
  check(!canAdvanceToolPhase("PENDING", "RESULT"), "skip blocked");

  const bootstrap = buildToolRuntimeBootstrap();
  check(bootstrap.ready === true, "bootstrap ready");
  check(bootstrap.identity.runtimeId === E03_TOOL_RUNTIME_ID, "runtime id");
  check(bootstrap.base === E03_TOOL_RUNTIME_BASE, "base kernel");
  check(TOOL_CATALOG.length >= 5, "catalog size");

  const echo = getToolById("e03.tool.echo");
  check(Boolean(echo), "echo tool");

  const denied = evaluateToolPermission(echo!, {
    agentId: "e03.agent.worker",
    role: "worker",
  });
  check(denied.allowed === true, "worker can echo");

  const coordTool = getToolById("e03.tool.coordinator.ping");
  const workerDenied = evaluateToolPermission(coordTool!, {
    agentId: "e03.agent.worker",
    role: "worker",
  });
  check(workerDenied.allowed === false, "worker denied coordinator ping");

  const ok = runToolOrThrow({
    toolId: "e03.tool.echo",
    caller: { agentId: "e03.agent.worker", role: "worker" },
    input: { message: "hello-e03-p3" },
  });
  check(ok.result.success === true, "echo success");
  check(ok.result.status === "result", "status result");
  check(ok.phase.phase === "RESULT", "phase RESULT");
  check(ok.phase.complete === true, "phase complete");
  check(ok.trace.eventCount >= 4, "trace events");
  check(ok.result.output.message === "hello-e03-p3", "echo output");

  const hash = runToolOrThrow({
    toolId: "e03.tool.hash",
    caller: { agentId: "e03.agent.tool", role: "tool" },
    input: { text: "fitness-pack" },
  });
  check(typeof hash.result.output.digest === "string", "hash digest");

  const blocked = runTool({
    toolId: "e03.tool.coordinator.ping",
    caller: { agentId: "e03.agent.worker", role: "worker" },
  });
  check(blocked.result.status === "denied", "permission denied path");
  check(blocked.result.success === false, "denied not success");

  const coord = runToolOrThrow({
    toolId: "e03.tool.coordinator.ping",
    caller: { agentId: "e03.agent.coordinator", role: "coordinator" },
  });
  check(coord.result.output.ok === true, "coordinator ping");

  const missing = runTool({
    toolId: "e03.tool.transform",
    caller: { agentId: "e03.agent.worker", role: "worker" },
    input: {},
  });
  check(missing.result.status === "failed", "missing input fails");

  console.log("✓ tool registry/permission/executor/runtime");
  console.log(ok.summary);
  console.log(`  version=${E03_TOOL_RUNTIME_VERSION}`);
}

function main() {
  console.log("E03-P3 — Tool Execution Runtime Verification\n");
  const baseline: Record<string, string> = {};
  for (const rel of FROZEN) baseline[rel] = sha1(rel);

  checkModules();
  checkFrozen(baseline);
  testRegistryPermissionExecutor();
  checkFrozen(baseline);

  console.log("\nPASS — E03 P3 tool execution runtime");
}

main();
