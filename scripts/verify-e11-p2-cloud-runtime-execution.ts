/**
 * E11-P2 — Cloud Runtime Execution Layer verification
 */
import fs from "node:fs";
import path from "node:path";

import { E11_CLOUD_RUNTIME_ID } from "../lib/cloud-runtime/e11/core/cloud.constants";
import { clearRuntimes, getRuntime } from "../lib/cloud-runtime/e11/registry/cloud.registry";
import {
  activateContext,
  clearContexts,
  openContext,
} from "../lib/cloud-runtime/e11/runtime/cloud.context";
import {
  clearLifecycles,
  createRuntime,
  registerCreatedRuntime,
  startRuntime,
} from "../lib/cloud-runtime/e11/runtime/cloud.lifecycle";
import {
  E11_EXECUTION_BASE,
  E11_EXECUTION_FREEZE_VERSION,
  E11_EXECUTION_ID,
  E11_EXECUTION_VERSION,
  E11_P2_EXECUTION_FREEZE_VERSION,
  EXECUTION_PRIORITIES,
  EXECUTION_RESULT_STATUSES,
  EXECUTION_TASK_KINDS,
  EXECUTION_TASK_STATUSES,
  EXECUTION_TRACE_EVENTS,
} from "../lib/cloud-runtime/e11/execution/execution.constants";
import {
  createExecutionManager,
  getExecutionRegistryManifest,
} from "../lib/cloud-runtime/e11/execution/execution.manager";
import { clearExecutionQueue } from "../lib/cloud-runtime/e11/execution/execution.queue";
import { clearExecutionResults } from "../lib/cloud-runtime/e11/execution/execution.result";
import { clearExecutionTraces } from "../lib/cloud-runtime/e11/execution/execution.trace";
import {
  assertE11P2ReleaseGatePass,
  checkE11P2ReleaseGate,
} from "../lib/cloud-runtime/e11/verify/execution.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearExecutionTraces();
  clearExecutionResults();
  clearExecutionQueue();
  clearContexts();
  clearLifecycles();
  clearRuntimes();
}

function checkModules() {
  const required = [
    "lib/cloud-runtime/e11/execution/execution.constants.ts",
    "lib/cloud-runtime/e11/execution/execution.types.ts",
    "lib/cloud-runtime/e11/execution/execution.queue.ts",
    "lib/cloud-runtime/e11/execution/execution.result.ts",
    "lib/cloud-runtime/e11/execution/execution.trace.ts",
    "lib/cloud-runtime/e11/execution/execution.executor.ts",
    "lib/cloud-runtime/e11/execution/execution.manager.ts",
    "lib/cloud-runtime/e11/verify/execution.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E11_EXECUTION_ID === "enterprise-e11-cloud-runtime-execution-v1",
    "execution id",
  );
  check(E11_EXECUTION_VERSION === "e11-execution-1", "execution version");
  check(
    E11_EXECUTION_FREEZE_VERSION === "e11-execution-freeze-1",
    "execution freeze",
  );
  check(
    E11_EXECUTION_BASE === "enterprise-e11-p1-cloud-runtime-foundation-v1",
    "execution base",
  );
  check(
    E11_P2_EXECUTION_FREEZE_VERSION ===
      "e11-p2-cloud-runtime-execution-freeze-1",
    "p2 freeze",
  );
  check(EXECUTION_TASK_KINDS.length === 4, "task kinds");
  check(EXECUTION_TASK_STATUSES.length === 6, "task statuses");
  check(EXECUTION_RESULT_STATUSES.length === 3, "result statuses");
  check(EXECUTION_TRACE_EVENTS.length === 7, "trace events");
  check(EXECUTION_PRIORITIES.length === 4, "priorities");
  check(
    E11_CLOUD_RUNTIME_ID === "enterprise-e11-cloud-runtime-foundation-v1",
    "p1 id intact",
  );
  console.log("✓ version constants");
}

function testExecutionStack() {
  cleanup();

  const created = createRuntime({
    id: "e11.verify.exec.rt",
    name: "Exec RT",
    kind: "WORKER",
    region: "local",
  });
  registerCreatedRuntime(created);
  startRuntime(created.id);
  const ctx = openContext({
    runtimeId: created.id,
    correlationId: "exec-verify",
  });
  activateContext(ctx.contextId);

  const manager = createExecutionManager({ managerId: "e11-p2-verify" });
  check(manager.initialize().status === "READY", "manager ready");
  check(manager.start().status === "RUNNING", "manager running");

  const task = manager.createTask({
    id: "e11.verify.task.1",
    name: "Verify Invoke",
    kind: "INVOKE",
    runtimeId: created.id,
    contextId: ctx.contextId,
    priority: "HIGH",
    payload: { value: 42 },
  });
  check(task.status === "PENDING", "task pending");

  const queued = manager.queue(task.id);
  check(queued.status === "QUEUED", "task queued");
  check(manager.peekQueue().length === 1, "queue depth 1");

  const bundle = manager.executeNext({
    handler: (t) => ({ output: { doubled: (t.payload.value as number) * 2 } }),
  });
  check(Boolean(bundle), "bundle exists");
  check(bundle!.task.status === "COMPLETED", "completed");
  check(bundle!.result.status === "OK", "result ok");
  check(
    (bundle!.result.output as Record<string, unknown>).doubled === 84,
    "output",
  );
  check(
    bundle!.trace.events.some((e) => e.type === "started"),
    "trace started",
  );
  check(
    bundle!.trace.events.some((e) => e.type === "completed"),
    "trace completed",
  );

  check(getRuntime(created.id)?.status === "ACTIVE", "runtime still active");

  // Priority queue: CRITICAL before LOW
  const low = manager.createTask({
    name: "Low",
    kind: "JOB",
    runtimeId: created.id,
    priority: "LOW",
  });
  const crit = manager.createTask({
    name: "Crit",
    kind: "JOB",
    runtimeId: created.id,
    priority: "CRITICAL",
  });
  manager.queue(low.id);
  manager.queue(crit.id);
  const next = manager.executeNext();
  check(next?.task.id === crit.id, "critical first");

  const manifest = getExecutionRegistryManifest();
  check(manifest.base === E11_EXECUTION_BASE, "manifest base");
  check(manifest.executionId === E11_EXECUTION_ID, "manifest id");

  manager.stop();
  cleanup();
  console.log("✓ task / queue / executor / result / trace");
}

function testFailureState() {
  cleanup();
  const created = createRuntime({
    id: "e11.verify.fail.rt",
    name: "Fail RT",
    kind: "CORE",
  });
  registerCreatedRuntime(created);
  startRuntime(created.id);

  const manager = createExecutionManager({ managerId: "e11-p2-fail" });
  manager.initialize();
  manager.start();
  const task = manager.createTask({
    name: "Boom",
    kind: "PROBE",
    runtimeId: created.id,
  });
  const bundle = manager.execute(task.id, {
    handler: () => {
      throw new Error("boom");
    },
  });
  check(bundle.task.status === "FAILED", "task failed");
  check(bundle.result.status === "ERROR", "result error");
  check(getRuntime(created.id)?.status === "SUSPENDED", "runtime suspended");
  check(
    bundle.trace.events.some((e) => e.type === "failed"),
    "trace failed",
  );
  manager.stop();
  cleanup();
  console.log("✓ failure runtime state transition");
}

function testSignoff() {
  const gate = checkE11P2ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE11P2ReleaseGatePass(gate);
  console.log("✓ execution release gate");
}

function main() {
  console.log("E11-P2 Cloud Runtime Execution Layer verify");
  checkModules();
  checkConstants();
  testExecutionStack();
  testFailureState();
  testSignoff();
  console.log("ALL PASS");
}

main();
