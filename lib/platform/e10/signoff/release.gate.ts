/**
 * E10-P1 — Release Gate
 * Checks platform kernel modules and returns PASS / FAIL
 */

import {
  E10_PLATFORM_BASE,
  E10_PLATFORM_ID,
  E10_PLATFORM_VERSION,
  PLATFORM_LIFECYCLE_STAGES,
  PLATFORM_MODULE_KINDS,
} from "../core/platform.constants";
import {
  activateModule,
  buildPlatformFoundation,
  canAdvancePlatformLifecycle,
  clearLifecycles,
  createModule,
  getModuleLifecycle,
  getPlatformInfo,
  registerCreatedModule,
  removeCreatedModule,
  suspendModule,
} from "../core/platform.lifecycle";
import {
  clearModules,
  getModule,
  listModules,
} from "../core/platform.registry";
import { createPlatformRuntime } from "../core/platform.runtime";
import {
  E10_P1_COMPONENT_LOCK,
  E10_P1_FREEZE_LOCK,
  e10P1FreezeLockMatchesExpected,
  isE10P1FreezeLockIntact,
} from "./freeze.lock";

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
  clearLifecycles();
  clearModules();
}

/** Probe P1 platform kernel via public APIs (no filesystem dependency). */
export function checkE10P1ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PF-P1-LOCK",
      "signoff",
      "Freeze lock intact",
      isE10P1FreezeLockIntact() && e10P1FreezeLockMatchesExpected(),
      `version=${E10_P1_FREEZE_LOCK.version} base=${E10_P1_FREEZE_LOCK.base}`,
    ),
  );

  const requiredIds = ["core", "runtime", "signoff"];
  const lockedIds = E10_P1_COMPONENT_LOCK.map((c) => c.id);
  checks.push(
    check(
      "PF-P1-COMPONENTS",
      "signoff",
      "P1 component lock complete",
      requiredIds.every((id) =>
        lockedIds.includes(id as (typeof lockedIds)[number]),
      ),
      `components=${lockedIds.join(",")}`,
    ),
  );

  // Core foundation + registry + lifecycle
  try {
    cleanup();
    const info = getPlatformInfo();
    const foundation = buildPlatformFoundation();
    const created = createModule({
      id: "e10.p1.gate.core",
      name: "Gate Core Module",
      kind: "CORE",
    });
    const registered = registerCreatedModule(created);
    const activated = activateModule(registered.id);
    const suspended = suspendModule(registered.id);
    const reactivated = activateModule(registered.id);
    const lifecycle = getModuleLifecycle(registered.id);
    const listed = listModules({ kind: "CORE" });
    const removed = removeCreatedModule(registered.id);

    const coreOk =
      info.platformId === E10_PLATFORM_ID &&
      info.base === E10_PLATFORM_BASE &&
      foundation.ready === true &&
      foundation.platformId === E10_PLATFORM_ID &&
      foundation.version === E10_PLATFORM_VERSION &&
      foundation.base === E10_PLATFORM_BASE &&
      registered.status === "REGISTERED" &&
      activated.status === "ACTIVE" &&
      suspended.status === "SUSPENDED" &&
      reactivated.status === "ACTIVE" &&
      lifecycle?.current === "activated" &&
      listed.some((m) => m.id === registered.id) &&
      removed === true &&
      !getModule(registered.id) &&
      canAdvancePlatformLifecycle("created", "registered") &&
      PLATFORM_MODULE_KINDS.length === 4 &&
      PLATFORM_LIFECYCLE_STAGES.length === 5;

    checks.push(
      check(
        "PF-P1-CORE",
        "core",
        "Platform foundation core",
        coreOk,
        foundation.summary,
      ),
    );
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PF-P1-CORE",
        "core",
        "Platform foundation core",
        false,
        error instanceof Error ? error.message : "core probe failed",
      ),
    );
  }

  // Runtime stub
  try {
    cleanup();
    const runtime = createPlatformRuntime({ runtimeId: "e10-p1-gate" });
    const ready = runtime.initialize();
    const running = runtime.start();
    const snap = runtime.status();
    const stopped = runtime.stop();

    const runtimeOk =
      ready.status === "READY" &&
      running.status === "RUNNING" &&
      snap.status === "RUNNING" &&
      snap.platformId === E10_PLATFORM_ID &&
      snap.version === E10_PLATFORM_VERSION &&
      snap.moduleCount === 0 &&
      stopped.status === "STOPPED";

    checks.push(
      check(
        "PF-P1-RUNTIME",
        "runtime",
        "Platform runtime stub",
        runtimeOk,
        `status=${snap.status} modules=${snap.moduleCount}`,
      ),
    );
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PF-P1-RUNTIME",
        "runtime",
        "Platform runtime stub",
        false,
        error instanceof Error ? error.message : "runtime probe failed",
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
      `e10-p1-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE10P1ReleaseGatePass(
  gate: ReleaseGateResult = checkE10P1ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E10-P1 release gate failed: ${gate.summary}`);
  }
}
