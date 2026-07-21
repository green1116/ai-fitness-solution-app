/**
 * E11-P1 — Cloud Runtime Foundation verification
 * Cloud runtime layer above E10 Autonomous Platform
 */
import fs from "node:fs";
import path from "node:path";

import {
  CLOUD_CONTEXT_STATUSES,
  CLOUD_HEALTH_LEVELS,
  CLOUD_LIFECYCLE_STAGES,
  CLOUD_MANAGER_STATUSES,
  CLOUD_RUNTIME_KINDS,
  CLOUD_RUNTIME_STATUSES,
  E11_CLOUD_RUNTIME_BASE,
  E11_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_CLOUD_RUNTIME_ID,
  E11_CLOUD_RUNTIME_VERSION,
  E11_P1_CLOUD_FREEZE_VERSION,
} from "../lib/cloud-runtime/e11/core/cloud.constants";
import {
  clearRuntimes,
  getRuntime,
  listRuntimes,
} from "../lib/cloud-runtime/e11/registry/cloud.registry";
import { clearContexts } from "../lib/cloud-runtime/e11/runtime/cloud.context";
import {
  buildCloudFoundation,
  canAdvanceCloudLifecycle,
  clearLifecycles,
  createRuntime,
  getCloudRuntimeInfo,
  getRuntimeLifecycle,
  registerCreatedRuntime,
  removeCreatedRuntime,
  startRuntime,
  stopRuntime,
} from "../lib/cloud-runtime/e11/runtime/cloud.lifecycle";
import { createCloudRuntimeManager } from "../lib/cloud-runtime/e11/runtime/cloud.runtime";
import {
  assertE11P1ReleaseGatePass,
  checkE11P1ReleaseGate,
} from "../lib/cloud-runtime/e11/verify/release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearContexts();
  clearLifecycles();
  clearRuntimes();
}

function checkModules() {
  const required = [
    "lib/cloud-runtime/e11/core/cloud.constants.ts",
    "lib/cloud-runtime/e11/core/cloud.foundation.ts",
    "lib/cloud-runtime/e11/types/cloud.types.ts",
    "lib/cloud-runtime/e11/registry/cloud.registry.ts",
    "lib/cloud-runtime/e11/runtime/cloud.lifecycle.ts",
    "lib/cloud-runtime/e11/runtime/cloud.context.ts",
    "lib/cloud-runtime/e11/runtime/cloud.health.ts",
    "lib/cloud-runtime/e11/runtime/cloud.runtime.ts",
    "lib/cloud-runtime/e11/verify/release.gate.ts",
    "lib/cloud-runtime/e11/verify/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E11_CLOUD_RUNTIME_ID === "enterprise-e11-cloud-runtime-foundation-v1",
    "cloud id",
  );
  check(E11_CLOUD_RUNTIME_VERSION === "e11-cloud-1", "cloud version");
  check(
    E11_CLOUD_RUNTIME_FREEZE_VERSION === "e11-cloud-freeze-1",
    "cloud freeze",
  );
  check(
    E11_CLOUD_RUNTIME_BASE ===
      "enterprise-e10-autonomous-platform-complete-v1",
    "cloud base",
  );
  check(
    E11_P1_CLOUD_FREEZE_VERSION ===
      "e11-p1-cloud-runtime-foundation-freeze-1",
    "p1 freeze",
  );
  check(CLOUD_RUNTIME_KINDS.length === 4, "kinds");
  check(CLOUD_RUNTIME_STATUSES.length === 4, "statuses");
  check(CLOUD_LIFECYCLE_STAGES.length === 6, "lifecycle stages");
  check(CLOUD_MANAGER_STATUSES.length === 4, "manager statuses");
  check(CLOUD_HEALTH_LEVELS.length === 4, "health levels");
  check(CLOUD_CONTEXT_STATUSES.length === 3, "context statuses");
  console.log("✓ version constants");
}

function testFoundationRegistryLifecycle() {
  cleanup();

  const info = getCloudRuntimeInfo();
  check(info.cloudId === E11_CLOUD_RUNTIME_ID, "info id");
  check(info.base === E11_CLOUD_RUNTIME_BASE, "info base");

  const foundation = buildCloudFoundation();
  check(foundation.ready === true, "foundation ready");

  check(
    canAdvanceCloudLifecycle("created", "registered"),
    "transition created→registered",
  );
  check(
    !canAdvanceCloudLifecycle("created", "started"),
    "reject created→started",
  );

  const created = createRuntime({
    id: "e11.verify.rt",
    name: "Verify Runtime",
    kind: "WORKER",
    region: "ap-east",
  });
  check(getRuntimeLifecycle(created.id)?.current === "created", "lc created");

  const registered = registerCreatedRuntime(created);
  check(registered.status === "REGISTERED", "registered");
  check(getRuntime(registered.id)?.id === registered.id, "registry get");
  check(listRuntimes().length === 1, "list 1");

  const started = startRuntime(registered.id);
  check(started.status === "ACTIVE", "started active");
  check(getRuntimeLifecycle(started.id)?.current === "started", "lc started");

  const stopped = stopRuntime(started.id);
  check(stopped.status === "STOPPED", "stopped");

  const removed = removeCreatedRuntime(stopped.id);
  check(removed === true, "removed");
  check(listRuntimes().length === 0, "registry empty");

  cleanup();
  console.log("✓ foundation / registry / lifecycle");
}

function testRuntimeStack() {
  cleanup();

  const manager = createCloudRuntimeManager({ managerId: "e11-p1-verify" });
  check(manager.initialize().status === "READY", "manager ready");
  check(manager.start().status === "RUNNING", "manager running");

  const created = manager.createRuntime({
    id: "e11.verify.mgr.rt",
    name: "Mgr Runtime",
    kind: "CORE",
  });
  manager.registerRuntime(created);
  manager.startRuntime(created.id);

  const ctx = manager.openContext({
    runtimeId: created.id,
    correlationId: "verify-1",
    attributes: { purpose: "test" },
  });
  check(ctx.status === "OPEN", "context open");
  const active = manager.activateContext(ctx.contextId);
  check(active.status === "ACTIVE", "context active");

  const health = manager.checkHealth(created.id);
  check(health.ok === true, "health ok");
  check(health.level === "HEALTHY", "health healthy");

  const snap = manager.snapshot();
  check(snap.cloudId === E11_CLOUD_RUNTIME_ID, "snap id");
  check(snap.base === E11_CLOUD_RUNTIME_BASE, "snap base");
  check(snap.activeCount === 1, "snap active");
  check(snap.contextCount === 1, "snap contexts");
  check(snap.health.ok === true, "snap health");

  manager.closeContext(ctx.contextId);
  check(manager.getContext(ctx.contextId)?.status === "CLOSED", "ctx closed");

  manager.stop();
  check(manager.status().status === "STOPPED", "manager stopped");
  cleanup();
  console.log("✓ context / health / runtime manager");
}

function testSignoff() {
  const gate = checkE11P1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE11P1ReleaseGatePass(gate);
  console.log("✓ release gate");
}

function main() {
  console.log("E11-P1 Cloud Runtime Foundation verify");
  checkModules();
  checkConstants();
  testFoundationRegistryLifecycle();
  testRuntimeStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
