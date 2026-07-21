/**
 * E10-P7 — Enterprise Platform OS verification
 * OS orchestration layer above E10-P6 Platform Marketplace
 */
import fs from "node:fs";
import path from "node:path";

import { E10_PLATFORM_ID } from "../lib/platform/e10/core/platform.constants";
import { buildPlatformFoundation } from "../lib/platform/e10/core/platform.lifecycle";
import { E10_EVENT_ID } from "../lib/platform/e10/event/event.constants";
import { clearEventBus } from "../lib/platform/e10/event/event.bus";
import { clearListeners } from "../lib/platform/e10/event/event.listener";
import { clearEventTypes } from "../lib/platform/e10/event/event.registry";
import { E10_GATEWAY_ID } from "../lib/platform/e10/gateway/gateway.constants";
import { clearMiddlewares } from "../lib/platform/e10/gateway/gateway.middleware";
import { clearRoutes } from "../lib/platform/e10/gateway/gateway.route";
import {
  E10_MARKETPLACE_BASE,
  E10_MARKETPLACE_ID,
} from "../lib/platform/e10/marketplace/marketplace.constants";
import { clearCatalog } from "../lib/platform/e10/marketplace/marketplace.catalog";
import { clearPackages } from "../lib/platform/e10/marketplace/marketplace.package";
import { clearPlugins } from "../lib/platform/e10/marketplace/marketplace.plugin";
import {
  E10_OS_BASE,
  E10_OS_FREEZE_VERSION,
  E10_OS_ID,
  E10_OS_VERSION,
  OS_BOOT_ORDER,
  OS_COMPONENT_KINDS,
  OS_COMPONENT_STATUSES,
  OS_HEALTH_LEVELS,
  OS_KERNEL_STATUSES,
  OS_MANAGER_STATUSES,
} from "../lib/platform/e10/os/os.constants";
import { resetKernel } from "../lib/platform/e10/os/os.kernel";
import {
  createOsManager,
  getOsRegistryManifest,
} from "../lib/platform/e10/os/os.manager";
import { clearComponents } from "../lib/platform/e10/os/os.registry";
import { E10_RESOURCE_ID } from "../lib/platform/e10/resource/resource.constants";
import { clearAllocations } from "../lib/platform/e10/resource/resource.allocation";
import { clearPools } from "../lib/platform/e10/resource/resource.pool";
import { clearQuotas } from "../lib/platform/e10/resource/resource.quota";
import { E10_RUNTIME_ID } from "../lib/platform/e10/runtime/runtime.constants";
import { clearServices } from "../lib/platform/e10/runtime/runtime.registry";
import {
  assertE10P7ReleaseGatePass,
  checkE10P7ReleaseGate,
  E10_P7_OS_FREEZE_VERSION,
} from "../lib/platform/e10/signoff/os.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearCatalog();
  clearPlugins();
  clearPackages();
  clearRoutes();
  clearMiddlewares();
  clearEventBus();
  clearListeners();
  clearEventTypes();
  clearAllocations();
  clearQuotas();
  clearPools();
  clearServices();
  clearComponents();
  resetKernel();
}

function checkModules() {
  const required = [
    "lib/platform/e10/os/os.constants.ts",
    "lib/platform/e10/os/os.types.ts",
    "lib/platform/e10/os/os.kernel.ts",
    "lib/platform/e10/os/os.registry.ts",
    "lib/platform/e10/os/os.orchestrator.ts",
    "lib/platform/e10/os/os.health.ts",
    "lib/platform/e10/os/os.manager.ts",
    "lib/platform/e10/signoff/os.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(E10_OS_ID === "enterprise-e10-platform-os-v1", "os id");
  check(E10_OS_VERSION === "e10-os-1", "os version");
  check(E10_OS_FREEZE_VERSION === "e10-os-freeze-1", "os freeze");
  check(
    E10_OS_BASE === "enterprise-e10-p6-platform-marketplace-v1",
    "os base",
  );
  check(
    E10_P7_OS_FREEZE_VERSION === "e10-p7-platform-os-freeze-1",
    "p7 freeze version",
  );
  check(OS_COMPONENT_KINDS.length === 6, "component kinds");
  check(OS_BOOT_ORDER.length === 6, "boot order");
  check(OS_BOOT_ORDER[0] === "FOUNDATION", "boot first");
  check(OS_BOOT_ORDER[5] === "MARKETPLACE", "boot last");
  check(OS_COMPONENT_STATUSES.length === 6, "component statuses");
  check(OS_KERNEL_STATUSES.length === 6, "kernel statuses");
  check(OS_MANAGER_STATUSES.length === 4, "manager statuses");
  check(OS_HEALTH_LEVELS.length === 4, "health levels");
  console.log("✓ version constants");
}

function checkUpstreamCompatible() {
  cleanup();
  const foundation = buildPlatformFoundation();
  check(foundation.ready === true, "P1 foundation still ready");
  check(foundation.platformId === E10_PLATFORM_ID, "P1 platform id");
  check(E10_RUNTIME_ID === "enterprise-e10-platform-runtime-v1", "P2");
  check(E10_RESOURCE_ID === "enterprise-e10-platform-resource-v1", "P3");
  check(E10_EVENT_ID === "enterprise-e10-platform-event-v1", "P4");
  check(E10_GATEWAY_ID === "enterprise-e10-platform-gateway-v1", "P5");
  check(
    E10_MARKETPLACE_ID === "enterprise-e10-platform-marketplace-v1",
    "P6",
  );
  check(
    E10_MARKETPLACE_BASE === "enterprise-e10-p5-platform-gateway-v1",
    "P6 base intact",
  );
  console.log("✓ P1–P6 compatibility");
}

function testOsStack() {
  cleanup();

  const manager = createOsManager({ managerId: "e10-p7-verify" });
  check(manager.initialize().status === "READY", "manager ready");
  check(manager.listComponents().length === 6, "default 6 components");
  check(manager.start().status === "RUNNING", "manager running");

  const boot = manager.boot();
  check(boot.failed.length === 0, "boot no failures");
  check(boot.started.length === 6, "boot started 6");
  check(boot.kernelStatus === "RUNNING", "kernel running");
  check(boot.order[0] === "FOUNDATION", "order foundation first");

  const health = manager.health();
  check(health.ok === true, "health ok");
  check(health.level === "HEALTHY", "health healthy");
  check(health.healthyCount === 6, "6 healthy");

  const snap = manager.snapshot();
  check(snap.osId === E10_OS_ID, "snapshot os id");
  check(snap.base === E10_OS_BASE, "snapshot base");
  check(snap.kernelStatus === "RUNNING", "snapshot kernel");
  check(snap.components.every((c) => c.status === "RUNNING"), "all running");

  const handles = manager.getHandles();
  check(handles.runtime?.status().status === "RUNNING", "runtime handle");
  check(handles.resource?.status().status === "RUNNING", "resource handle");
  check(handles.event?.status().status === "RUNNING", "event handle");
  check(handles.gateway?.status().status === "RUNNING", "gateway handle");
  check(
    handles.marketplace?.status().status === "RUNNING",
    "marketplace handle",
  );

  const manifest = getOsRegistryManifest();
  check(manifest.componentCount === 6, "manifest count");
  check(manifest.base === E10_OS_BASE, "manifest base");

  const shutdown = manager.shutdown();
  check(shutdown.failed.length === 0, "shutdown ok");
  check(shutdown.stopped.length === 6, "stopped 6");
  check(shutdown.order[0] === "MARKETPLACE", "shutdown marketplace first");
  check(shutdown.kernelStatus === "STOPPED", "kernel stopped");

  manager.stop();
  check(manager.status().status === "STOPPED", "manager stopped");
  cleanup();
  console.log("✓ registry / kernel / orchestrator / health / snapshot");
}

function testSignoff() {
  const gate = checkE10P7ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE10P7ReleaseGatePass(gate);
  console.log("✓ os release gate");
}

function main() {
  console.log("E10-P7 Enterprise Platform OS verify");
  checkModules();
  checkConstants();
  checkUpstreamCompatible();
  testOsStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
