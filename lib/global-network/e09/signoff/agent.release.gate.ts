/**
 * E09-P6 — Agent Release Gate
 * Checks agent foundation, coordinator, runtime → PASS / FAIL
 */

import {
  E09_AGENT_BASE,
  E09_AGENT_ID,
  E09_AGENT_VERSION,
  AGENT_ROLES,
  AGENT_STATUSES,
  AGENT_TASK_KINDS,
} from "../agent/agent.constants";
import {
  clearCoordinatorState,
  coordinateAgents,
  dispatchTask,
  executeTask,
} from "../agent/agent.coordinator";
import {
  buildAgentRegistryManifest,
  clearAgents,
  getAgent,
  listAgents,
  registerAgent,
  removeAgent,
} from "../agent/agent.registry";
import { createAgentRuntime } from "../agent/agent.runtime";
import {
  E09_P6_COMPONENT_LOCK,
  E09_P6_FREEZE_LOCK,
  e09P6FreezeLockMatchesExpected,
  isE09P6FreezeLockIntact,
} from "./agent.freeze.lock";
import type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
} from "./release.gate";

export type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
};

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanupAgentGateState(): void {
  clearCoordinatorState();
  clearAgents();
}

/** Probe P6 agent modules via public APIs (no filesystem dependency). */
export function checkE09P6ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  // Lock
  checks.push(
    check(
      "AG-P6-LOCK",
      "signoff",
      "Freeze lock intact",
      isE09P6FreezeLockIntact() && e09P6FreezeLockMatchesExpected(),
      `version=${E09_P6_FREEZE_LOCK.version} base=${E09_P6_FREEZE_LOCK.base}`,
    ),
  );

  // Component catalog completeness
  const requiredIds = ["foundation", "coordinator", "runtime", "signoff"];
  const lockedIds = E09_P6_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "AG-P6-COMPONENTS",
      "signoff",
      "P6 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ),
      `components=${lockedIds.join(",")}`,
    ),
  );

  // Agent foundation (registry)
  try {
    cleanupAgentGateState();
    const agent = registerAgent({
      id: "e09.p6.gate.agent",
      name: "Gate Worker",
      role: "WORKER",
      status: "IDLE",
      trustLevel: 70,
      capabilities: ["exec"],
    });
    const fetched = getAgent(agent.id);
    const listed = listAgents({ role: "WORKER", status: "IDLE" });
    const manifest = buildAgentRegistryManifest();
    const removed = removeAgent(agent.id);
    const foundationOk =
      fetched?.id === agent.id &&
      fetched.trustLevel === 70 &&
      listed.some((a) => a.id === agent.id) &&
      removed === true &&
      manifest.agentId === E09_AGENT_ID &&
      manifest.version === E09_AGENT_VERSION &&
      manifest.base === E09_AGENT_BASE &&
      AGENT_ROLES.length === 4 &&
      AGENT_STATUSES.length === 4 &&
      AGENT_TASK_KINDS.length === 4;
    checks.push(
      check(
        "AG-P6-FOUNDATION",
        "foundation",
        "Agent foundation registry",
        foundationOk,
        `agent=${agent.id} base=${manifest.base}`,
      ),
    );
    cleanupAgentGateState();
  } catch (error) {
    checks.push(
      check(
        "AG-P6-FOUNDATION",
        "foundation",
        "Agent foundation registry",
        false,
        error instanceof Error ? error.message : "foundation probe failed",
      ),
    );
  }

  // Agent coordinator
  try {
    cleanupAgentGateState();
    registerAgent({
      id: "e09.p6.gate.coord.lead",
      name: "Gate Lead",
      role: "COORDINATOR",
      trustLevel: 90,
      capabilities: ["plan"],
    });
    registerAgent({
      id: "e09.p6.gate.coord.worker",
      name: "Gate Worker",
      role: "WORKER",
      trustLevel: 65,
      capabilities: ["exec"],
    });
    const plan = coordinateAgents(
      ["e09.p6.gate.coord.lead", "e09.p6.gate.coord.worker"],
      { strategy: "LEAD_FOLLOW" },
    );
    const task = dispatchTask({
      id: "e09.p6.gate.task",
      kind: "EXECUTE",
      title: "Gate execute",
      agentIds: ["e09.p6.gate.coord.lead", "e09.p6.gate.coord.worker"],
    });
    const done = executeTask(task.id);
    const lead = getAgent("e09.p6.gate.coord.lead");
    const worker = getAgent("e09.p6.gate.coord.worker");
    const coordinatorOk =
      plan.leadAgentId === "e09.p6.gate.coord.lead" &&
      plan.agentIds.length === 2 &&
      task.status === "DISPATCHED" &&
      done.status === "COMPLETED" &&
      lead?.status === "ACTIVE" &&
      worker?.status === "IDLE";
    checks.push(
      check(
        "AG-P6-COORDINATOR",
        "coordinator",
        "Agent coordinator",
        coordinatorOk,
        `lead=${plan.leadAgentId} task=${done.status}`,
      ),
    );
    cleanupAgentGateState();
  } catch (error) {
    checks.push(
      check(
        "AG-P6-COORDINATOR",
        "coordinator",
        "Agent coordinator",
        false,
        error instanceof Error ? error.message : "coordinator probe failed",
      ),
    );
  }

  // Agent runtime
  try {
    cleanupAgentGateState();
    const runtime = createAgentRuntime({ runtimeId: "e09-p6-gate" });
    runtime.initialize();
    runtime.start();
    runtime.registerAgent({
      id: "e09.p6.gate.runtime.a",
      name: "Runtime Coord",
      role: "COORDINATOR",
      trustLevel: 88,
    });
    runtime.registerAgent({
      id: "e09.p6.gate.runtime.b",
      name: "Runtime Worker",
      role: "WORKER",
      trustLevel: 72,
    });
    const plan = runtime.coordinateAgents(
      ["e09.p6.gate.runtime.a", "e09.p6.gate.runtime.b"],
      { strategy: "PARALLEL" },
    );
    const task = runtime.dispatchTask({
      id: "e09.p6.gate.runtime.task",
      kind: "ANALYZE",
      title: "Runtime analyze",
      agentIds: ["e09.p6.gate.runtime.a", "e09.p6.gate.runtime.b"],
    });
    const done = runtime.executeTask(task.id);
    const snap = runtime.status();
    runtime.stop();

    const runtimeOk =
      plan.strategy === "PARALLEL" &&
      done.status === "COMPLETED" &&
      snap.status === "RUNNING" &&
      snap.agentCount === 2 &&
      snap.taskCount === 1 &&
      snap.completedTaskCount === 1 &&
      snap.planCount === 1;
    checks.push(
      check(
        "AG-P6-RUNTIME",
        "runtime",
        "Agent runtime",
        runtimeOk,
        `status=${snap.status} agents=${snap.agentCount} completed=${snap.completedTaskCount}`,
      ),
    );
    cleanupAgentGateState();
  } catch (error) {
    checks.push(
      check(
        "AG-P6-RUNTIME",
        "runtime",
        "Agent runtime",
        false,
        error instanceof Error ? error.message : "runtime probe failed",
      ),
    );
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `e09-p6-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE09P6ReleaseGatePass(
  gate: ReleaseGateResult = checkE09P6ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E09-P6 release gate failed: ${gate.summary}`);
  }
}
