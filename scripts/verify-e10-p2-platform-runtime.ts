/**
 * E10-P2 — Platform Runtime verification
 * Runtime layer above E10-P1 Platform Foundation
 */
import fs from "node:fs";
import path from "node:path";

import {
  E10_PLATFORM_BASE,
  E10_PLATFORM_ID,
} from "../lib/platform/e10/core/platform.constants";
import {
  buildPlatformFoundation,
  clearLifecycles,
  createModule,
  registerCreatedModule,
} from "../lib/platform/e10/core/platform.lifecycle";
import { clearModules } from "../lib/platform/e10/core/platform.registry";
import {
  E10_RUNTIME_BASE,
  E10_RUNTIME_FREEZE_VERSION,
  E10_RUNTIME_ID,
  E10_RUNTIME_VERSION,
  RUNTIME_HEALTH_LEVELS,
  RUNTIME_MANAGER_STATUSES,
  RUNTIME_SERVICE_KINDS,
  RUNTIME_SERVICE_STATUSES,
} from "../lib/platform/e10/runtime/runtime.constants";
import { createRuntimeManager } from "../lib/platform/e10/runtime/runtime.manager";
import {
  buildRuntimeRegistryManifest,
  clearServices,
  getService,
  listServices,
} from "../lib/platform/e10/runtime/runtime.registry";
import { canAdvanceServiceStatus } from "../lib/platform/e10/runtime/runtime.service";
import {
  assertE10P2ReleaseGatePass,
  checkE10P2ReleaseGate,
  E10_P2_RUNTIME_FREEZE_VERSION,
} from "../lib/platform/e10/signoff/runtime.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearServices();
  clearLifecycles();
  clearModules();
}

function checkModules() {
  const required = [
    "lib/platform/e10/runtime/runtime.constants.ts",
    "lib/platform/e10/runtime/runtime.types.ts",
    "lib/platform/e10/runtime/runtime.service.ts",
    "lib/platform/e10/runtime/runtime.registry.ts",
    "lib/platform/e10/runtime/runtime.monitor.ts",
    "lib/platform/e10/runtime/runtime.manager.ts",
    "lib/platform/e10/signoff/runtime.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E10_RUNTIME_ID === "enterprise-e10-platform-runtime-v1",
    "runtime id",
  );
  check(E10_RUNTIME_VERSION === "e10-runtime-1", "runtime version");
  check(
    E10_RUNTIME_FREEZE_VERSION === "e10-runtime-freeze-1",
    "runtime freeze",
  );
  check(
    E10_RUNTIME_BASE === "enterprise-e10-p1-platform-foundation-v1",
    "runtime base",
  );
  check(
    E10_P2_RUNTIME_FREEZE_VERSION ===
      "e10-p2-platform-runtime-freeze-1",
    "p2 freeze version",
  );
  check(RUNTIME_SERVICE_KINDS.length === 4, "service kinds");
  check(RUNTIME_SERVICE_STATUSES.length === 7, "service statuses");
  check(RUNTIME_MANAGER_STATUSES.length === 5, "manager statuses");
  check(RUNTIME_HEALTH_LEVELS.length === 4, "health levels");
  console.log("✓ version constants");
}

function checkFoundationCompatible() {
  cleanup();
  const foundation = buildPlatformFoundation();
  check(foundation.ready === true, "P1 foundation still ready");
  check(foundation.platformId === E10_PLATFORM_ID, "P1 platform id");
  check(
    E10_PLATFORM_BASE ===
      "enterprise-e09-global-autonomous-enterprise-network-freeze-v1",
    "P1 base intact",
  );
  console.log("✓ platform foundation compatible");
}

function testRuntimeStack() {
  cleanup();

  const module = createModule({
    id: "e10.verify.rt.module",
    name: "Verify RT Module",
    kind: "RUNTIME",
  });
  registerCreatedModule(module);

  const manager = createRuntimeManager({ runtimeId: "e10-p2-verify" });
  check(manager.initialize().status === "READY", "manager ready");
  check(manager.start().status === "RUNNING", "manager running");

  const svc = manager.registerService({
    id: "e10.verify.rt.svc",
    name: "Verify Worker",
    kind: "WORKER",
    moduleId: module.id,
  });
  check(svc.status === "REGISTERED", "service registered");
  check(
    canAdvanceServiceStatus("REGISTERED", "STARTING"),
    "can start transition",
  );

  const started = manager.startService(svc.id);
  check(started.status === "RUNNING", "service running");
  check(!!getService(svc.id), "service in registry");

  const health = manager.checkServiceHealth(svc.id);
  check(health.ok === true, "service healthy");
  check(health.level === "HEALTHY", "health level");

  const metrics = manager.metrics();
  check(metrics.serviceCount === 1, "metrics serviceCount");
  check(metrics.runningCount === 1, "metrics runningCount");
  check(metrics.healthyCount === 1, "metrics healthyCount");

  const stopped = manager.stopService(svc.id);
  check(stopped.status === "STOPPED", "service stopped");

  const failTarget = manager.registerService({
    id: "e10.verify.rt.fail",
    name: "Fail Me",
    kind: "MONITOR",
  });
  manager.startService(failTarget.id);
  const failed = manager.failService(failTarget.id, "verify fail");
  check(failed.status === "FAILED", "service failed");
  check(manager.status().status === "DEGRADED", "manager degraded");

  const manifest = buildRuntimeRegistryManifest();
  check(manifest.base === E10_RUNTIME_BASE, "registry manifest base");
  check(listServices().length === 2, "two services listed");

  manager.stop();
  check(manager.status().status === "STOPPED", "manager stopped");

  cleanup();
  console.log("✓ runtime registry / lifecycle / monitor / manager");
}

function testSignoff() {
  const gate = checkE10P2ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE10P2ReleaseGatePass(gate);
  console.log("✓ runtime release gate");
}

function main() {
  console.log("E10-P2 Platform Runtime verify");
  checkModules();
  checkConstants();
  checkFoundationCompatible();
  testRuntimeStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
