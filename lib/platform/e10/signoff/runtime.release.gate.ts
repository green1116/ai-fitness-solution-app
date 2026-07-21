/**
 * E10-P2 — Runtime Release Gate
 * Checks platform runtime modules → PASS / FAIL
 */

import {
  clearLifecycles,
  createModule,
  registerCreatedModule,
} from "../core/platform.lifecycle";
import { clearModules } from "../core/platform.registry";
import {
  E10_RUNTIME_BASE,
  E10_RUNTIME_ID,
  E10_RUNTIME_VERSION,
  RUNTIME_MANAGER_STATUSES,
  RUNTIME_SERVICE_KINDS,
} from "../runtime/runtime.constants";
import { createRuntimeManager } from "../runtime/runtime.manager";
import {
  clearServices,
  buildRuntimeRegistryManifest,
  getService,
  listServices,
} from "../runtime/runtime.registry";
import { canAdvanceServiceStatus } from "../runtime/runtime.service";
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

export const E10_P2_SIGNOFF_VERSION = "e10-p2-signoff-1" as const;
export const E10_P2_RUNTIME_FREEZE_VERSION =
  "e10-p2-platform-runtime-freeze-1" as const;

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
  clearServices();
  clearLifecycles();
  clearModules();
}

/** Probe P2 platform runtime via public APIs (no filesystem dependency). */
export function checkE10P2ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "RT-P2-CONSTANTS",
      "runtime",
      "Runtime version constants",
      E10_RUNTIME_ID === "enterprise-e10-platform-runtime-v1" &&
        E10_RUNTIME_VERSION === "e10-runtime-1" &&
        E10_RUNTIME_BASE ===
          "enterprise-e10-p1-platform-foundation-v1" &&
        RUNTIME_SERVICE_KINDS.length === 4 &&
        RUNTIME_MANAGER_STATUSES.length === 5,
      `id=${E10_RUNTIME_ID} base=${E10_RUNTIME_BASE}`,
    ),
  );

  // Registry + service lifecycle + monitor + manager
  try {
    cleanup();

    // Optional P1 module binding
    const created = createModule({
      id: "e10.p2.gate.module",
      name: "Gate Runtime Module",
      kind: "RUNTIME",
    });
    registerCreatedModule(created);

    const manager = createRuntimeManager({ runtimeId: "e10-p2-gate" });
    manager.initialize();
    manager.start();

    const registered = manager.registerService({
      id: "e10.p2.gate.service",
      name: "Gate Worker",
      kind: "WORKER",
      moduleId: created.id,
    });
    const started = manager.startService(registered.id);
    const health = manager.checkServiceHealth(registered.id);
    const metrics = manager.metrics();
    const snap = manager.status();
    const stopped = manager.stopService(registered.id);
    const manifest = buildRuntimeRegistryManifest();

    const ok =
      registered.status === "REGISTERED" &&
      started.status === "RUNNING" &&
      health.ok === true &&
      health.level === "HEALTHY" &&
      metrics.runningCount === 1 &&
      metrics.healthyCount === 1 &&
      snap.status === "RUNNING" &&
      snap.serviceCount === 1 &&
      stopped.status === "STOPPED" &&
      listServices().length === 1 &&
      !!getService(registered.id) &&
      canAdvanceServiceStatus("REGISTERED", "STARTING") &&
      manifest.runtimeId === E10_RUNTIME_ID &&
      manifest.base === E10_RUNTIME_BASE &&
      manifest.version === E10_RUNTIME_VERSION;

    checks.push(
      check(
        "RT-P2-MANAGER",
        "runtime",
        "Runtime manager / registry / monitor",
        ok,
        `status=${snap.status} health=${health.level} metrics.running=${metrics.runningCount}`,
      ),
    );

    // Degraded path
    const failedSvc = manager.registerService({
      id: "e10.p2.gate.fail",
      name: "Fail Service",
      kind: "ADAPTER",
    });
    manager.startService(failedSvc.id);
    const failed = manager.failService(failedSvc.id, "gate probe");
    const degraded = manager.status();
    const degradedOk =
      failed.status === "FAILED" && degraded.status === "DEGRADED";
    checks.push(
      check(
        "RT-P2-DEGRADED",
        "runtime",
        "Runtime degraded on service failure",
        degradedOk,
        `failed=${failed.status} manager=${degraded.status}`,
      ),
    );

    manager.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "RT-P2-MANAGER",
        "runtime",
        "Runtime manager / registry / monitor",
        false,
        error instanceof Error ? error.message : "runtime probe failed",
      ),
    );
  }

  // Compatibility: services without module binding
  try {
    cleanup();
    const manager = createRuntimeManager({ runtimeId: "e10-p2-compat" });
    manager.initialize();
    manager.start();
    const svc = manager.registerService({
      id: "e10.p2.compat.service",
      name: "Compat Service",
      kind: "CORE",
    });
    manager.startService(svc.id);
    const health = manager.checkHealth();
    manager.stop();
    const compatOk =
      svc.moduleId === undefined &&
      health.some((h) => h.serviceId === svc.id);
    checks.push(
      check(
        "RT-P2-COMPAT",
        "runtime",
        "Foundation-compatible unbound service",
        compatOk,
        `service=${svc.id} healthReports=${health.length}`,
      ),
    );
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "RT-P2-COMPAT",
        "runtime",
        "Foundation-compatible unbound service",
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
      `e10-p2-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE10P2ReleaseGatePass(
  gate: ReleaseGateResult = checkE10P2ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E10-P2 release gate failed: ${gate.summary}`);
  }
}
