/**
 * E09-P2 — Regional Freeze Manifest Builder (read-only)
 */

import {
  E09_REGIONAL_BASE,
  E09_REGIONAL_FREEZE_VERSION,
  E09_REGIONAL_ID,
  E09_REGIONAL_VERSION,
} from "../regional/regional.constants";
import { buildRegionalRegistryManifest } from "../regional/regional.registry";
import {
  E09_P2_FREEZE_LOCK,
  E09_P2_PLATFORM_FREEZE_VERSION,
  E09_P2_SIGNOFF_VERSION,
  e09P2FreezeLockMatchesExpected,
  isE09P2FreezeLockIntact,
  type E09P2FreezeLock,
} from "./regional.freeze.lock";
import {
  checkE09P2ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./regional.release.gate";

export type E09P2FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  gatePass: boolean;
  state: "frozen" | "unfrozen" | "blocked";
};

export type E09P2FreezeManifest = {
  version: typeof E09_P2_PLATFORM_FREEZE_VERSION;
  signoff: typeof E09_P2_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E09_REGIONAL_BASE;
  regionalId: typeof E09_REGIONAL_ID;
  layerVersion: typeof E09_REGIONAL_VERSION;
  layerFreeze: typeof E09_REGIONAL_FREEZE_VERSION;
  lock: E09P2FreezeLock;
  versionLockOk: boolean;
  gate: ReleaseGateResult;
  freezeState: E09P2FreezeState;
  foundationReady: boolean;
  summary: string;
};

export function buildE09P2FreezeManifest(input?: {
  deploymentId?: string;
}): E09P2FreezeManifest {
  const deploymentId = input?.deploymentId ?? "e09-p2-freeze-default";
  const registry = buildRegionalRegistryManifest();
  const gate = checkE09P2ReleaseGate();
  const versionLockOk =
    isE09P2FreezeLockIntact() && e09P2FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";

  const foundationReady =
    registry.regionalId === E09_REGIONAL_ID &&
    registry.version === E09_REGIONAL_VERSION &&
    registry.base === E09_REGIONAL_BASE &&
    registry.freezeVersion === E09_REGIONAL_FREEZE_VERSION;

  const frozen = versionLockOk && gatePass && foundationReady;
  const freezeState: E09P2FreezeState = {
    frozen,
    versionLockOk,
    gatePass,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
  };

  return {
    version: E09_P2_PLATFORM_FREEZE_VERSION,
    signoff: E09_P2_SIGNOFF_VERSION,
    freezeId: `e09-p2-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E09_REGIONAL_BASE,
    regionalId: E09_REGIONAL_ID,
    layerVersion: E09_REGIONAL_VERSION,
    layerFreeze: E09_REGIONAL_FREEZE_VERSION,
    lock: {
      ...E09_P2_FREEZE_LOCK,
      components: [...E09_P2_FREEZE_LOCK.components],
    },
    versionLockOk,
    gate,
    freezeState,
    foundationReady,
    summary: [
      `e09-p2-freeze frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `foundationReady=${foundationReady}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

export function assertE09P2FreezePass(
  manifest: E09P2FreezeManifest = buildE09P2FreezeManifest(),
): asserts manifest is E09P2FreezeManifest & {
  freezeState: E09P2FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(`E09-P2 freeze not complete: ${manifest.summary}`);
  }
}
