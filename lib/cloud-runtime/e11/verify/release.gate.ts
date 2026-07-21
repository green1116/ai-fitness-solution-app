/**
 * E11-P1 — Cloud Runtime Release Gate
 * Checks cloud runtime foundation modules → PASS / FAIL
 */

import {
  CLOUD_LIFECYCLE_STAGES,
  CLOUD_MANAGER_STATUSES,
  CLOUD_RUNTIME_KINDS,
  E11_CLOUD_RUNTIME_BASE,
  E11_CLOUD_RUNTIME_ID,
  E11_CLOUD_RUNTIME_VERSION,
  E11_P1_CLOUD_FREEZE_VERSION,
} from "../core/cloud.constants";
import { clearRuntimes } from "../registry/cloud.registry";
import {
  clearContexts,
} from "../runtime/cloud.context";
import {
  buildCloudFoundation,
  clearLifecycles,
  getCloudRuntimeInfo,
} from "../runtime/cloud.lifecycle";
import { createCloudRuntimeManager } from "../runtime/cloud.runtime";

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

export const E11_P1_SIGNOFF_VERSION = "e11-p1-signoff-1" as const;

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
  clearContexts();
  clearLifecycles();
  clearRuntimes();
}

export function checkE11P1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CR-P1-CONSTANTS",
      "core",
      "Cloud runtime version constants",
      E11_CLOUD_RUNTIME_ID ===
        "enterprise-e11-cloud-runtime-foundation-v1" &&
        E11_CLOUD_RUNTIME_VERSION === "e11-cloud-1" &&
        E11_CLOUD_RUNTIME_BASE ===
          "enterprise-e10-autonomous-platform-complete-v1" &&
        E11_P1_CLOUD_FREEZE_VERSION ===
          "e11-p1-cloud-runtime-foundation-freeze-1" &&
        CLOUD_RUNTIME_KINDS.length === 4 &&
        CLOUD_LIFECYCLE_STAGES.length === 6 &&
        CLOUD_MANAGER_STATUSES.length === 4,
      `id=${E11_CLOUD_RUNTIME_ID} base=${E11_CLOUD_RUNTIME_BASE}`,
    ),
  );

  try {
    cleanup();
    const foundation = buildCloudFoundation();
    const info = getCloudRuntimeInfo();
    const ok =
      foundation.ready === true &&
      foundation.cloudId === E11_CLOUD_RUNTIME_ID &&
      foundation.base === E11_CLOUD_RUNTIME_BASE &&
      info.cloudId === E11_CLOUD_RUNTIME_ID;

    checks.push(
      check(
        "CR-P1-FOUNDATION",
        "core",
        "Cloud foundation ready",
        ok,
        foundation.summary,
      ),
    );
  } catch (error) {
    checks.push(
      check(
        "CR-P1-FOUNDATION",
        "core",
        "Cloud foundation ready",
        false,
        error instanceof Error ? error.message : "foundation probe failed",
      ),
    );
  }

  try {
    cleanup();
    const manager = createCloudRuntimeManager({ managerId: "e11-p1-gate" });
    manager.initialize();
    manager.start();

    const created = manager.createRuntime({
      id: "e11.p1.gate.rt",
      name: "Gate Runtime",
      kind: "CORE",
      region: "local",
    });
    const registered = manager.registerRuntime(created);
    const started = manager.startRuntime(registered.id);
    const ctx = manager.openContext({
      runtimeId: started.id,
      correlationId: "gate-corr-1",
    });
    manager.activateContext(ctx.contextId);
    const health = manager.checkHealth(started.id);
    const snap = manager.snapshot();
    manager.closeContext(ctx.contextId);
    manager.stopRuntime(started.id);
    manager.stop();

    const ok =
      registered.status === "REGISTERED" &&
      started.status === "ACTIVE" &&
      ctx.status === "OPEN" &&
      health.ok === true &&
      health.level === "HEALTHY" &&
      snap.runtimeCount === 1 &&
      snap.activeCount === 1 &&
      snap.cloudId === E11_CLOUD_RUNTIME_ID;

    checks.push(
      check(
        "CR-P1-STACK",
        "runtime",
        "Registry / lifecycle / context / health",
        ok,
        `health=${health.level} runtimes=${snap.runtimeCount}`,
      ),
    );
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "CR-P1-STACK",
        "runtime",
        "Registry / lifecycle / context / health",
        false,
        error instanceof Error ? error.message : "stack probe failed",
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
      `e11-p1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE11P1ReleaseGatePass(
  gate: ReleaseGateResult = checkE11P1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E11-P1 release gate failed: ${gate.summary}`);
  }
}
