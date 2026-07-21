/**
 * E11-P2 — Execution Release Gate
 */

import { E11_CLOUD_RUNTIME_ID } from "../core/cloud.constants";
import { clearRuntimes, getRuntime } from "../registry/cloud.registry";
import { clearContexts, openContext } from "../runtime/cloud.context";
import {
  clearLifecycles,
  createRuntime,
  registerCreatedRuntime,
  startRuntime,
} from "../runtime/cloud.lifecycle";
import {
  E11_EXECUTION_BASE,
  E11_EXECUTION_ID,
  E11_EXECUTION_VERSION,
  EXECUTION_TASK_KINDS,
  EXECUTION_MANAGER_STATUSES,
} from "../execution/execution.constants";
import {
  createExecutionManager,
  getExecutionRegistryManifest,
} from "../execution/execution.manager";
import { clearExecutionQueue } from "../execution/execution.queue";
import { clearExecutionResults } from "../execution/execution.result";
import { clearExecutionTraces } from "../execution/execution.trace";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const E11_P2_SIGNOFF_VERSION = "e11-p2-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearExecutionTraces();
  clearExecutionResults();
  clearExecutionQueue();
  clearContexts();
  clearLifecycles();
  clearRuntimes();
}

export function checkE11P2ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "EX-P2-CONSTANTS",
      "execution",
      "Execution version constants",
      E11_EXECUTION_ID === "enterprise-e11-cloud-runtime-execution-v1" &&
        E11_EXECUTION_VERSION === "e11-execution-1" &&
        E11_EXECUTION_BASE ===
          "enterprise-e11-p1-cloud-runtime-foundation-v1" &&
        EXECUTION_TASK_KINDS.length === 4 &&
        EXECUTION_MANAGER_STATUSES.length === 4,
      `id=${E11_EXECUTION_ID} base=${E11_EXECUTION_BASE}`,
    ),
  );

  try {
    cleanup();
    const created = createRuntime({
      id: "e11.p2.gate.rt",
      name: "Gate RT",
      kind: "WORKER",
    });
    registerCreatedRuntime(created);
    startRuntime(created.id);
    const ctx = openContext({ runtimeId: created.id });

    const manager = createExecutionManager({ managerId: "e11-p2-gate" });
    manager.initialize();
    manager.start();

    const task = manager.createTask({
      id: "e11.p2.gate.task",
      name: "Gate Task",
      kind: "INVOKE",
      runtimeId: created.id,
      contextId: ctx.contextId,
      priority: "HIGH",
      payload: { n: 1 },
    });
    manager.queue(task.id);
    const bundle = manager.execute(task.id, {
      handler: (t) => ({ output: { ok: true, id: t.id } }),
    });
    const manifest = getExecutionRegistryManifest();

    const ok =
      bundle.task.status === "COMPLETED" &&
      bundle.result.status === "OK" &&
      bundle.trace.events.some((e) => e.type === "completed") &&
      (bundle.result.output as Record<string, unknown>).ok === true &&
      manifest.executionId === E11_EXECUTION_ID &&
      manifest.base === E11_EXECUTION_BASE &&
      E11_CLOUD_RUNTIME_ID === "enterprise-e11-cloud-runtime-foundation-v1";

    checks.push(
      check(
        "EX-P2-EXECUTE",
        "execution",
        "Queue / execute / result / trace",
        ok,
        `status=${bundle.task.status} result=${bundle.result.status} events=${bundle.trace.events.length}`,
      ),
    );

    manager.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "EX-P2-EXECUTE",
        "execution",
        "Queue / execute / result / trace",
        false,
        error instanceof Error ? error.message : "execute probe failed",
      ),
    );
  }

  // Failure path maintains runtime state transition
  try {
    cleanup();
    const created = createRuntime({
      id: "e11.p2.gate.fail.rt",
      name: "Fail RT",
      kind: "CORE",
    });
    registerCreatedRuntime(created);
    startRuntime(created.id);

    const manager = createExecutionManager({ managerId: "e11-p2-gate-fail" });
    manager.initialize();
    manager.start();
    const task = manager.createTask({
      name: "Fail Task",
      kind: "JOB",
      runtimeId: created.id,
    });
    const bundle = manager.execute(task.id, {
      handler: () => {
        throw new Error("forced fail");
      },
    });

    const runtime = getRuntime(created.id);
    const failOk =
      bundle.task.status === "FAILED" &&
      bundle.result.status === "ERROR" &&
      runtime?.status === "SUSPENDED";

    checks.push(
      check(
        "EX-P2-FAIL-STATE",
        "execution",
        "Failure maintains runtime state transition",
        failOk,
        `task=${bundle.task.status} runtime=${runtime?.status}`,
      ),
    );

    manager.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "EX-P2-FAIL-STATE",
        "execution",
        "Failure maintains runtime state transition",
        false,
        error instanceof Error ? error.message : "fail probe failed",
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
      `e11-p2-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE11P2ReleaseGatePass(
  gate: ReleaseGateResult = checkE11P2ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E11-P2 release gate failed: ${gate.summary}`);
  }
}
