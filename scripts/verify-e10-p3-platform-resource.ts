/**
 * E10-P3 — Platform Resource Manager verification
 * Resource layer above E10-P2 Platform Runtime
 */
import fs from "node:fs";
import path from "node:path";

import {
  E10_PLATFORM_ID,
} from "../lib/platform/e10/core/platform.constants";
import { buildPlatformFoundation } from "../lib/platform/e10/core/platform.lifecycle";
import {
  E10_RESOURCE_BASE,
  E10_RESOURCE_FREEZE_VERSION,
  E10_RESOURCE_ID,
  E10_RESOURCE_VERSION,
  ALLOCATION_STATUSES,
  RESOURCE_MANAGER_STATUSES,
  RESOURCE_POOL_STATUSES,
  RESOURCE_TYPES,
} from "../lib/platform/e10/resource/resource.constants";
import {
  clearAllocations,
} from "../lib/platform/e10/resource/resource.allocation";
import {
  createResourceManager,
  getResourceRegistryManifest,
} from "../lib/platform/e10/resource/resource.manager";
import { clearPools } from "../lib/platform/e10/resource/resource.pool";
import { clearQuotas } from "../lib/platform/e10/resource/resource.quota";
import {
  E10_RUNTIME_BASE,
  E10_RUNTIME_ID,
} from "../lib/platform/e10/runtime/runtime.constants";
import { createRuntimeManager } from "../lib/platform/e10/runtime/runtime.manager";
import { clearServices } from "../lib/platform/e10/runtime/runtime.registry";
import {
  assertE10P3ReleaseGatePass,
  checkE10P3ReleaseGate,
  E10_P3_RESOURCE_FREEZE_VERSION,
} from "../lib/platform/e10/signoff/resource.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearAllocations();
  clearQuotas();
  clearPools();
  clearServices();
}

function checkModules() {
  const required = [
    "lib/platform/e10/resource/resource.constants.ts",
    "lib/platform/e10/resource/resource.types.ts",
    "lib/platform/e10/resource/resource.pool.ts",
    "lib/platform/e10/resource/resource.quota.ts",
    "lib/platform/e10/resource/resource.allocation.ts",
    "lib/platform/e10/resource/resource.manager.ts",
    "lib/platform/e10/signoff/resource.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E10_RESOURCE_ID === "enterprise-e10-platform-resource-v1",
    "resource id",
  );
  check(E10_RESOURCE_VERSION === "e10-resource-1", "resource version");
  check(
    E10_RESOURCE_FREEZE_VERSION === "e10-resource-freeze-1",
    "resource freeze",
  );
  check(
    E10_RESOURCE_BASE === "enterprise-e10-p2-platform-runtime-v1",
    "resource base",
  );
  check(
    E10_P3_RESOURCE_FREEZE_VERSION ===
      "e10-p3-platform-resource-freeze-1",
    "p3 freeze version",
  );
  check(RESOURCE_TYPES.length === 5, "resource types");
  check(RESOURCE_POOL_STATUSES.length === 3, "pool statuses");
  check(ALLOCATION_STATUSES.length === 3, "allocation statuses");
  check(RESOURCE_MANAGER_STATUSES.length === 4, "manager statuses");
  console.log("✓ version constants");
}

function checkUpstreamCompatible() {
  cleanup();
  const foundation = buildPlatformFoundation();
  check(foundation.ready === true, "P1 foundation still ready");
  check(foundation.platformId === E10_PLATFORM_ID, "P1 platform id");
  check(
    E10_RUNTIME_ID === "enterprise-e10-platform-runtime-v1",
    "P2 runtime id intact",
  );
  check(
    E10_RUNTIME_BASE === "enterprise-e10-p1-platform-foundation-v1",
    "P2 base intact",
  );
  console.log("✓ P1/P2 compatibility");
}

function testResourceStack() {
  cleanup();

  const manager = createResourceManager({ managerId: "e10-p3-verify" });
  check(manager.initialize().status === "READY", "manager ready");
  check(manager.start().status === "RUNNING", "manager running");

  const pool = manager.createPool({
    id: "e10.verify.mem.pool",
    name: "Verify Memory",
    type: "MEMORY",
    capacity: 200,
  });
  check(pool.reserved === 0, "pool reserved 0");

  const quota = manager.createQuota({
    id: "e10.verify.quota",
    ownerId: "owner.verify",
    type: "MEMORY",
    limit: 80,
  });
  check(quota.used === 0, "quota used 0");

  const alloc = manager.allocate({
    id: "e10.verify.alloc",
    poolId: pool.id,
    ownerId: "owner.verify",
    amount: 50,
    quotaId: quota.id,
  });
  check(alloc.status === "ACTIVE", "allocation active");
  check(manager.availableInPool(pool.id) === 150, "available after alloc");
  check(manager.getQuota(quota.id)?.used === 50, "quota used 50");

  const usage = manager.usage();
  check(usage.totalCapacity === 200, "usage capacity");
  check(usage.totalReserved === 50, "usage reserved");
  check(usage.activeAllocationCount === 1, "usage active");

  const released = manager.release(alloc.id);
  check(released.status === "RELEASED", "released");
  check(manager.availableInPool(pool.id) === 200, "available restored");
  check(manager.getQuota(quota.id)?.used === 0, "quota restored");

  const denied = manager.allocate({
    poolId: pool.id,
    ownerId: "owner.verify",
    amount: 100,
    quotaId: quota.id,
  });
  check(denied.status === "DENIED", "quota deny");

  const manifest = getResourceRegistryManifest();
  check(manifest.base === E10_RESOURCE_BASE, "manifest base");
  check(manifest.poolCount === 1, "manifest pools");

  // Optional runtime binding
  const runtime = createRuntimeManager({ runtimeId: "e10-p3-verify-rt" });
  runtime.initialize();
  runtime.start();
  const svc = runtime.registerService({
    id: "e10.verify.res.svc",
    name: "Res Svc",
    kind: "CORE",
  });
  const bound = manager.createPool({
    id: "e10.verify.slot.pool",
    name: "Verify Slots",
    type: "SLOT",
    capacity: 5,
    serviceId: svc.id,
  });
  check(bound.serviceId === svc.id, "service-bound pool");

  manager.stop();
  check(manager.status().status === "STOPPED", "manager stopped");
  runtime.stop();

  cleanup();
  console.log("✓ pool / quota / allocation / usage / manager");
}

function testSignoff() {
  const gate = checkE10P3ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE10P3ReleaseGatePass(gate);
  console.log("✓ resource release gate");
}

function main() {
  console.log("E10-P3 Platform Resource Manager verify");
  checkModules();
  checkConstants();
  checkUpstreamCompatible();
  testResourceStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
