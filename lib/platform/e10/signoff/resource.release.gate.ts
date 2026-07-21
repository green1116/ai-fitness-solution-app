/**
 * E10-P3 — Resource Release Gate
 * Checks platform resource manager modules → PASS / FAIL
 */

import {
  E10_RESOURCE_BASE,
  E10_RESOURCE_ID,
  E10_RESOURCE_VERSION,
  RESOURCE_MANAGER_STATUSES,
  RESOURCE_TYPES,
} from "../resource/resource.constants";
import {
  clearAllocations,
  listAllocations,
} from "../resource/resource.allocation";
import {
  createResourceManager,
  getResourceRegistryManifest,
} from "../resource/resource.manager";
import { clearPools, listPools } from "../resource/resource.pool";
import { clearQuotas, listQuotas } from "../resource/resource.quota";
import { clearServices } from "../runtime/runtime.registry";
import { createRuntimeManager } from "../runtime/runtime.manager";
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

export const E10_P3_SIGNOFF_VERSION = "e10-p3-signoff-1" as const;
export const E10_P3_RESOURCE_FREEZE_VERSION =
  "e10-p3-platform-resource-freeze-1" as const;

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
  clearAllocations();
  clearQuotas();
  clearPools();
  clearServices();
}

/** Probe P3 resource manager via public APIs (no filesystem dependency). */
export function checkE10P3ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "RS-P3-CONSTANTS",
      "resource",
      "Resource version constants",
      E10_RESOURCE_ID === "enterprise-e10-platform-resource-v1" &&
        E10_RESOURCE_VERSION === "e10-resource-1" &&
        E10_RESOURCE_BASE === "enterprise-e10-p2-platform-runtime-v1" &&
        RESOURCE_TYPES.length === 5 &&
        RESOURCE_MANAGER_STATUSES.length === 4,
      `id=${E10_RESOURCE_ID} base=${E10_RESOURCE_BASE}`,
    ),
  );

  // Core pool / quota / allocate / release / usage
  try {
    cleanup();
    const manager = createResourceManager({ managerId: "e10-p3-gate" });
    manager.initialize();
    manager.start();

    const pool = manager.createPool({
      id: "e10.p3.gate.pool",
      name: "Gate CPU Pool",
      type: "CPU",
      capacity: 100,
    });
    const quota = manager.createQuota({
      id: "e10.p3.gate.quota",
      ownerId: "owner.gate",
      type: "CPU",
      limit: 40,
    });
    const allocation = manager.allocate({
      id: "e10.p3.gate.alloc",
      poolId: pool.id,
      ownerId: "owner.gate",
      amount: 25,
      quotaId: quota.id,
    });
    const usage = manager.usage();
    const released = manager.release(allocation.id);
    const after = manager.usage();
    const manifest = getResourceRegistryManifest();
    const snap = manager.status();

    const ok =
      pool.status === "OPEN" &&
      pool.capacity === 100 &&
      allocation.status === "ACTIVE" &&
      allocation.amount === 25 &&
      usage.activeAllocationCount === 1 &&
      usage.totalReserved === 25 &&
      usage.totalAvailable === 75 &&
      released.status === "RELEASED" &&
      after.activeAllocationCount === 0 &&
      after.totalReserved === 0 &&
      snap.status === "RUNNING" &&
      snap.poolCount === 1 &&
      listPools().length === 1 &&
      listQuotas().length === 1 &&
      listAllocations().length === 1 &&
      manifest.resourceId === E10_RESOURCE_ID &&
      manifest.base === E10_RESOURCE_BASE;

    checks.push(
      check(
        "RS-P3-MANAGER",
        "resource",
        "Resource pool / quota / allocation",
        ok,
        `alloc=${allocation.status} reserved=${usage.totalReserved} released=${released.status}`,
      ),
    );

    // Denial paths
    const deniedQuota = manager.allocate({
      poolId: pool.id,
      ownerId: "owner.gate",
      amount: 50,
      quotaId: quota.id,
    });
    manager.setPoolStatus(pool.id, "CLOSED");
    const deniedPool = manager.allocate({
      poolId: pool.id,
      ownerId: "owner.gate",
      amount: 1,
      quotaId: quota.id,
    });
    const denyOk =
      deniedQuota.status === "DENIED" &&
      deniedQuota.reason === "quota exceeded" &&
      deniedPool.status === "DENIED";
    checks.push(
      check(
        "RS-P3-DENY",
        "resource",
        "Allocation denial (quota / pool)",
        denyOk,
        `quotaDeny=${deniedQuota.reason} poolDeny=${deniedPool.reason}`,
      ),
    );

    manager.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "RS-P3-MANAGER",
        "resource",
        "Resource pool / quota / allocation",
        false,
        error instanceof Error ? error.message : "resource probe failed",
      ),
    );
  }

  // P2 compatibility: optional serviceId binding
  try {
    cleanup();
    const runtime = createRuntimeManager({ runtimeId: "e10-p3-compat-rt" });
    runtime.initialize();
    runtime.start();
    const service = runtime.registerService({
      id: "e10.p3.compat.svc",
      name: "Compat Service",
      kind: "WORKER",
    });

    const manager = createResourceManager({ managerId: "e10-p3-compat" });
    manager.initialize();
    manager.start();
    const pool = manager.createPool({
      id: "e10.p3.compat.pool",
      name: "Compat Slot Pool",
      type: "SLOT",
      capacity: 10,
      serviceId: service.id,
    });
    const allocation = manager.allocate({
      poolId: pool.id,
      ownerId: "owner.compat",
      amount: 3,
    });
    const compatOk =
      pool.serviceId === service.id &&
      allocation.status === "ACTIVE" &&
      manager.availableInPool(pool.id) === 7;

    checks.push(
      check(
        "RS-P3-COMPAT",
        "resource",
        "Runtime-compatible service-bound pool",
        compatOk,
        `serviceId=${pool.serviceId} available=${manager.availableInPool(pool.id)}`,
      ),
    );

    manager.stop();
    runtime.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "RS-P3-COMPAT",
        "resource",
        "Runtime-compatible service-bound pool",
        false,
        error instanceof Error ? error.message : "compat probe failed",
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
      `e10-p3-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE10P3ReleaseGatePass(
  gate: ReleaseGateResult = checkE10P3ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E10-P3 release gate failed: ${gate.summary}`);
  }
}
