/**
 * E10-P7 — OS Release Gate
 * Checks enterprise platform OS modules → PASS / FAIL
 */

import { clearEventBus } from "../event/event.bus";
import { clearListeners } from "../event/event.listener";
import { clearEventTypes } from "../event/event.registry";
import { clearMiddlewares } from "../gateway/gateway.middleware";
import { clearRoutes } from "../gateway/gateway.route";
import { clearCatalog } from "../marketplace/marketplace.catalog";
import { clearPackages } from "../marketplace/marketplace.package";
import { clearPlugins } from "../marketplace/marketplace.plugin";
import {
  E10_OS_BASE,
  E10_OS_ID,
  E10_OS_VERSION,
  OS_BOOT_ORDER,
  OS_COMPONENT_KINDS,
  OS_MANAGER_STATUSES,
} from "../os/os.constants";
import {
  createOsManager,
  getOsRegistryManifest,
} from "../os/os.manager";
import { clearComponents } from "../os/os.registry";
import { resetKernel } from "../os/os.kernel";
import { clearAllocations } from "../resource/resource.allocation";
import { clearPools } from "../resource/resource.pool";
import { clearQuotas } from "../resource/resource.quota";
import { clearServices } from "../runtime/runtime.registry";
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

export const E10_P7_SIGNOFF_VERSION = "e10-p7-signoff-1" as const;
export const E10_P7_OS_FREEZE_VERSION =
  "e10-p7-platform-os-freeze-1" as const;

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

export function checkE10P7ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OS-P7-CONSTANTS",
      "os",
      "OS version constants",
      E10_OS_ID === "enterprise-e10-platform-os-v1" &&
        E10_OS_VERSION === "e10-os-1" &&
        E10_OS_BASE === "enterprise-e10-p6-platform-marketplace-v1" &&
        OS_COMPONENT_KINDS.length === 6 &&
        OS_BOOT_ORDER.length === 6 &&
        OS_MANAGER_STATUSES.length === 4,
      `id=${E10_OS_ID} base=${E10_OS_BASE}`,
    ),
  );

  try {
    cleanup();
    const manager = createOsManager({ managerId: "e10-p7-gate" });
    manager.initialize();
    manager.start();

    const boot = manager.boot();
    const health = manager.health();
    const snap = manager.snapshot();
    const manifest = getOsRegistryManifest();
    const handles = manager.getHandles();

    const bootOk =
      boot.failed.length === 0 &&
      boot.started.length === 6 &&
      boot.kernelStatus === "RUNNING" &&
      health.ok === true &&
      health.level === "HEALTHY" &&
      health.healthyCount === 6 &&
      snap.components.length === 6 &&
      snap.bootOrder[0] === "FOUNDATION" &&
      snap.bootOrder[5] === "MARKETPLACE" &&
      Boolean(handles.runtime) &&
      Boolean(handles.resource) &&
      Boolean(handles.event) &&
      Boolean(handles.gateway) &&
      Boolean(handles.marketplace) &&
      manifest.osId === E10_OS_ID &&
      manifest.base === E10_OS_BASE;

    checks.push(
      check(
        "OS-P7-BOOT",
        "os",
        "Kernel boot + P1–P6 coordination",
        bootOk,
        `started=${boot.started.length} health=${health.level} kernel=${boot.kernelStatus}`,
      ),
    );

    const shutdown = manager.shutdown();
    const afterHealth = manager.health();
    const shutOk =
      shutdown.failed.length === 0 &&
      shutdown.stopped.length === 6 &&
      shutdown.kernelStatus === "STOPPED" &&
      afterHealth.healthyCount === 0;

    checks.push(
      check(
        "OS-P7-SHUTDOWN",
        "os",
        "Ordered shutdown + health",
        shutOk,
        `stopped=${shutdown.stopped.length} kernel=${shutdown.kernelStatus}`,
      ),
    );

    manager.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "OS-P7-BOOT",
        "os",
        "Kernel boot + P1–P6 coordination",
        false,
        error instanceof Error ? error.message : "os probe failed",
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
      `e10-p7-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE10P7ReleaseGatePass(
  gate: ReleaseGateResult = checkE10P7ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E10-P7 release gate failed: ${gate.summary}`);
  }
}
