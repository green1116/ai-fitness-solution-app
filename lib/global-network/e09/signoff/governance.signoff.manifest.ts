/**
 * E09-P8 — Governance Freeze Manifest Builder (read-only)
 */

import {
  E09_CIVILIZATION_BASE,
  E09_CIVILIZATION_FREEZE_VERSION,
  E09_CIVILIZATION_ID,
  E09_CIVILIZATION_VERSION,
} from "../civilization/civilization.constants";
import { buildCivilizationRegistryManifest } from "../civilization/civilization.registry";
import {
  E09_GLOBAL_NETWORK_PLATFORM_ID,
} from "../core/global.constants";
import {
  E09_P8_FREEZE_LOCK,
  E09_P8_GOVERNANCE_BASE,
  E09_P8_PLATFORM_FREEZE_VERSION,
  E09_P8_SIGNOFF_VERSION,
  e09P8FreezeLockMatchesExpected,
  isE09P8FreezeLockIntact,
  type E09P8FreezeLock,
} from "./governance.freeze.lock";
import {
  checkE09P8ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./governance.release.gate";

export type E09P8FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  gatePass: boolean;
  state: "frozen" | "unfrozen" | "blocked";
};

export type E09P8FreezeManifest = {
  version: typeof E09_P8_PLATFORM_FREEZE_VERSION;
  signoff: typeof E09_P8_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E09_P8_GOVERNANCE_BASE;
  platformId: typeof E09_GLOBAL_NETWORK_PLATFORM_ID;
  civilizationId: typeof E09_CIVILIZATION_ID;
  civilizationVersion: typeof E09_CIVILIZATION_VERSION;
  civilizationFreeze: typeof E09_CIVILIZATION_FREEZE_VERSION;
  civilizationBase: typeof E09_CIVILIZATION_BASE;
  lock: E09P8FreezeLock;
  versionLockOk: boolean;
  gate: ReleaseGateResult;
  freezeState: E09P8FreezeState;
  foundationReady: boolean;
  summary: string;
};

export function buildE09P8FreezeManifest(input?: {
  deploymentId?: string;
}): E09P8FreezeManifest {
  const deploymentId = input?.deploymentId ?? "e09-p8-freeze-default";
  const registry = buildCivilizationRegistryManifest();
  const gate = checkE09P8ReleaseGate();
  const versionLockOk =
    isE09P8FreezeLockIntact() && e09P8FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";

  const foundationReady =
    registry.civilizationId === E09_CIVILIZATION_ID &&
    registry.version === E09_CIVILIZATION_VERSION &&
    registry.base === E09_CIVILIZATION_BASE &&
    registry.freezeVersion === E09_CIVILIZATION_FREEZE_VERSION;

  const frozen = versionLockOk && gatePass && foundationReady;
  const freezeState: E09P8FreezeState = {
    frozen,
    versionLockOk,
    gatePass,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
  };

  return {
    version: E09_P8_PLATFORM_FREEZE_VERSION,
    signoff: E09_P8_SIGNOFF_VERSION,
    freezeId: `e09-p8-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E09_P8_GOVERNANCE_BASE,
    platformId: E09_GLOBAL_NETWORK_PLATFORM_ID,
    civilizationId: E09_CIVILIZATION_ID,
    civilizationVersion: E09_CIVILIZATION_VERSION,
    civilizationFreeze: E09_CIVILIZATION_FREEZE_VERSION,
    civilizationBase: E09_CIVILIZATION_BASE,
    lock: {
      ...E09_P8_FREEZE_LOCK,
      phases: {
        p1: { ...E09_P8_FREEZE_LOCK.phases.p1 },
        p2: { ...E09_P8_FREEZE_LOCK.phases.p2 },
        p3: { ...E09_P8_FREEZE_LOCK.phases.p3 },
        p4: { ...E09_P8_FREEZE_LOCK.phases.p4 },
        p5: { ...E09_P8_FREEZE_LOCK.phases.p5 },
        p6: { ...E09_P8_FREEZE_LOCK.phases.p6 },
        p7: { ...E09_P8_FREEZE_LOCK.phases.p7 },
      },
      components: [...E09_P8_FREEZE_LOCK.components],
    },
    versionLockOk,
    gate,
    freezeState,
    foundationReady,
    summary: [
      `e09-p8-freeze frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `foundationReady=${foundationReady}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

export function assertE09P8FreezePass(
  manifest: E09P8FreezeManifest = buildE09P8FreezeManifest(),
): asserts manifest is E09P8FreezeManifest & {
  freezeState: E09P8FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(`E09-P8 freeze not complete: ${manifest.summary}`);
  }
}
