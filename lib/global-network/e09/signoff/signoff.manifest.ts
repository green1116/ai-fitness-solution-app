/**
 * E09-P1 — Freeze Manifest Builder (read-only)
 */

import {
  E09_GLOBAL_NETWORK_BASE,
  E09_GLOBAL_NETWORK_FREEZE_VERSION,
  E09_GLOBAL_NETWORK_PLATFORM_ID,
  E09_GLOBAL_NETWORK_VERSION,
} from "../core/global.constants";
import { buildGlobalNetworkFoundation } from "../core/global.lifecycle";
import {
  E09_P1_FREEZE_LOCK,
  E09_P1_PLATFORM_FREEZE_VERSION,
  E09_P1_SIGNOFF_VERSION,
  e09P1FreezeLockMatchesExpected,
  isE09P1FreezeLockIntact,
  type E09P1FreezeLock,
} from "./freeze.lock";
import {
  checkE09P1ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./release.gate";

export type E09P1FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  gatePass: boolean;
  state: "frozen" | "unfrozen" | "blocked";
};

export type E09P1FreezeManifest = {
  version: typeof E09_P1_PLATFORM_FREEZE_VERSION;
  signoff: typeof E09_P1_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E09_GLOBAL_NETWORK_BASE;
  platformId: typeof E09_GLOBAL_NETWORK_PLATFORM_ID;
  layerVersion: typeof E09_GLOBAL_NETWORK_VERSION;
  layerFreeze: typeof E09_GLOBAL_NETWORK_FREEZE_VERSION;
  lock: E09P1FreezeLock;
  versionLockOk: boolean;
  gate: ReleaseGateResult;
  freezeState: E09P1FreezeState;
  foundationReady: boolean;
  summary: string;
};

export function buildE09P1FreezeManifest(input?: {
  deploymentId?: string;
}): E09P1FreezeManifest {
  const deploymentId = input?.deploymentId ?? "e09-p1-freeze-default";
  const foundation = buildGlobalNetworkFoundation();
  const gate = checkE09P1ReleaseGate();
  const versionLockOk =
    isE09P1FreezeLockIntact() && e09P1FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";

  const frozen =
    versionLockOk && gatePass && foundation.ready === true;
  const freezeState: E09P1FreezeState = {
    frozen,
    versionLockOk,
    gatePass,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
  };

  return {
    version: E09_P1_PLATFORM_FREEZE_VERSION,
    signoff: E09_P1_SIGNOFF_VERSION,
    freezeId: `e09-p1-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E09_GLOBAL_NETWORK_BASE,
    platformId: E09_GLOBAL_NETWORK_PLATFORM_ID,
    layerVersion: E09_GLOBAL_NETWORK_VERSION,
    layerFreeze: E09_GLOBAL_NETWORK_FREEZE_VERSION,
    lock: { ...E09_P1_FREEZE_LOCK, components: [...E09_P1_FREEZE_LOCK.components] },
    versionLockOk,
    gate,
    freezeState,
    foundationReady: foundation.ready,
    summary: [
      `e09-p1-freeze frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `foundationReady=${foundation.ready}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

export function assertE09P1FreezePass(
  manifest: E09P1FreezeManifest = buildE09P1FreezeManifest(),
): asserts manifest is E09P1FreezeManifest & {
  freezeState: E09P1FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(`E09-P1 freeze not complete: ${manifest.summary}`);
  }
}
