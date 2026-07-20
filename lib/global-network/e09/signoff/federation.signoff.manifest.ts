/**
 * E09-P4 — Federation Freeze Manifest Builder (read-only)
 */

import {
  E09_FEDERATION_BASE,
  E09_FEDERATION_FREEZE_VERSION,
  E09_FEDERATION_ID,
  E09_FEDERATION_VERSION,
} from "../federation/federation.constants";
import { buildFederationRegistryManifest } from "../federation/federation.registry";
import {
  E09_P4_FREEZE_LOCK,
  E09_P4_PLATFORM_FREEZE_VERSION,
  E09_P4_SIGNOFF_VERSION,
  e09P4FreezeLockMatchesExpected,
  isE09P4FreezeLockIntact,
  type E09P4FreezeLock,
} from "./federation.freeze.lock";
import {
  checkE09P4ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./federation.release.gate";

export type E09P4FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  gatePass: boolean;
  state: "frozen" | "unfrozen" | "blocked";
};

export type E09P4FreezeManifest = {
  version: typeof E09_P4_PLATFORM_FREEZE_VERSION;
  signoff: typeof E09_P4_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E09_FEDERATION_BASE;
  federationId: typeof E09_FEDERATION_ID;
  layerVersion: typeof E09_FEDERATION_VERSION;
  layerFreeze: typeof E09_FEDERATION_FREEZE_VERSION;
  lock: E09P4FreezeLock;
  versionLockOk: boolean;
  gate: ReleaseGateResult;
  freezeState: E09P4FreezeState;
  foundationReady: boolean;
  summary: string;
};

export function buildE09P4FreezeManifest(input?: {
  deploymentId?: string;
}): E09P4FreezeManifest {
  const deploymentId = input?.deploymentId ?? "e09-p4-freeze-default";
  const registry = buildFederationRegistryManifest();
  const gate = checkE09P4ReleaseGate();
  const versionLockOk =
    isE09P4FreezeLockIntact() && e09P4FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";

  const foundationReady =
    registry.federationId === E09_FEDERATION_ID &&
    registry.version === E09_FEDERATION_VERSION &&
    registry.base === E09_FEDERATION_BASE &&
    registry.freezeVersion === E09_FEDERATION_FREEZE_VERSION;

  const frozen = versionLockOk && gatePass && foundationReady;
  const freezeState: E09P4FreezeState = {
    frozen,
    versionLockOk,
    gatePass,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
  };

  return {
    version: E09_P4_PLATFORM_FREEZE_VERSION,
    signoff: E09_P4_SIGNOFF_VERSION,
    freezeId: `e09-p4-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E09_FEDERATION_BASE,
    federationId: E09_FEDERATION_ID,
    layerVersion: E09_FEDERATION_VERSION,
    layerFreeze: E09_FEDERATION_FREEZE_VERSION,
    lock: {
      ...E09_P4_FREEZE_LOCK,
      components: [...E09_P4_FREEZE_LOCK.components],
    },
    versionLockOk,
    gate,
    freezeState,
    foundationReady,
    summary: [
      `e09-p4-freeze frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `foundationReady=${foundationReady}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

export function assertE09P4FreezePass(
  manifest: E09P4FreezeManifest = buildE09P4FreezeManifest(),
): asserts manifest is E09P4FreezeManifest & {
  freezeState: E09P4FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(`E09-P4 freeze not complete: ${manifest.summary}`);
  }
}
