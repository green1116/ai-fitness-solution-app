/**
 * E09-P5 — Economy Freeze Manifest Builder (read-only)
 */

import {
  E09_ECONOMY_BASE,
  E09_ECONOMY_FREEZE_VERSION,
  E09_ECONOMY_ID,
  E09_ECONOMY_VERSION,
} from "../economy/economy.constants";
import { buildEconomyRegistryManifest } from "../economy/economy.registry";
import {
  E09_P5_FREEZE_LOCK,
  E09_P5_PLATFORM_FREEZE_VERSION,
  E09_P5_SIGNOFF_VERSION,
  e09P5FreezeLockMatchesExpected,
  isE09P5FreezeLockIntact,
  type E09P5FreezeLock,
} from "./economy.freeze.lock";
import {
  checkE09P5ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./economy.release.gate";

export type E09P5FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  gatePass: boolean;
  state: "frozen" | "unfrozen" | "blocked";
};

export type E09P5FreezeManifest = {
  version: typeof E09_P5_PLATFORM_FREEZE_VERSION;
  signoff: typeof E09_P5_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E09_ECONOMY_BASE;
  economyId: typeof E09_ECONOMY_ID;
  layerVersion: typeof E09_ECONOMY_VERSION;
  layerFreeze: typeof E09_ECONOMY_FREEZE_VERSION;
  lock: E09P5FreezeLock;
  versionLockOk: boolean;
  gate: ReleaseGateResult;
  freezeState: E09P5FreezeState;
  foundationReady: boolean;
  summary: string;
};

export function buildE09P5FreezeManifest(input?: {
  deploymentId?: string;
}): E09P5FreezeManifest {
  const deploymentId = input?.deploymentId ?? "e09-p5-freeze-default";
  const registry = buildEconomyRegistryManifest();
  const gate = checkE09P5ReleaseGate();
  const versionLockOk =
    isE09P5FreezeLockIntact() && e09P5FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";

  const foundationReady =
    registry.economyId === E09_ECONOMY_ID &&
    registry.version === E09_ECONOMY_VERSION &&
    registry.base === E09_ECONOMY_BASE &&
    registry.freezeVersion === E09_ECONOMY_FREEZE_VERSION;

  const frozen = versionLockOk && gatePass && foundationReady;
  const freezeState: E09P5FreezeState = {
    frozen,
    versionLockOk,
    gatePass,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
  };

  return {
    version: E09_P5_PLATFORM_FREEZE_VERSION,
    signoff: E09_P5_SIGNOFF_VERSION,
    freezeId: `e09-p5-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E09_ECONOMY_BASE,
    economyId: E09_ECONOMY_ID,
    layerVersion: E09_ECONOMY_VERSION,
    layerFreeze: E09_ECONOMY_FREEZE_VERSION,
    lock: {
      ...E09_P5_FREEZE_LOCK,
      components: [...E09_P5_FREEZE_LOCK.components],
    },
    versionLockOk,
    gate,
    freezeState,
    foundationReady,
    summary: [
      `e09-p5-freeze frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `foundationReady=${foundationReady}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

export function assertE09P5FreezePass(
  manifest: E09P5FreezeManifest = buildE09P5FreezeManifest(),
): asserts manifest is E09P5FreezeManifest & {
  freezeState: E09P5FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(`E09-P5 freeze not complete: ${manifest.summary}`);
  }
}
