/**
 * E10-P1 — Freeze Manifest Builder (read-only)
 */

import {
  E10_PLATFORM_BASE,
  E10_PLATFORM_FREEZE_VERSION,
  E10_PLATFORM_ID,
  E10_PLATFORM_VERSION,
} from "../core/platform.constants";
import { buildPlatformFoundation } from "../core/platform.lifecycle";
import {
  E10_P1_FREEZE_LOCK,
  E10_P1_PLATFORM_FREEZE_VERSION,
  E10_P1_SIGNOFF_VERSION,
  e10P1FreezeLockMatchesExpected,
  isE10P1FreezeLockIntact,
  type E10P1FreezeLock,
} from "./freeze.lock";
import {
  checkE10P1ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./release.gate";

export type E10P1FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  gatePass: boolean;
  state: "frozen" | "unfrozen" | "blocked";
};

export type E10P1FreezeManifest = {
  version: typeof E10_P1_PLATFORM_FREEZE_VERSION;
  signoff: typeof E10_P1_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E10_PLATFORM_BASE;
  platformId: typeof E10_PLATFORM_ID;
  layerVersion: typeof E10_PLATFORM_VERSION;
  layerFreeze: typeof E10_PLATFORM_FREEZE_VERSION;
  lock: E10P1FreezeLock;
  versionLockOk: boolean;
  gate: ReleaseGateResult;
  freezeState: E10P1FreezeState;
  foundationReady: boolean;
  summary: string;
};

export function buildE10P1FreezeManifest(input?: {
  deploymentId?: string;
}): E10P1FreezeManifest {
  const deploymentId = input?.deploymentId ?? "e10-p1-freeze-default";
  const foundation = buildPlatformFoundation();
  const gate = checkE10P1ReleaseGate();
  const versionLockOk =
    isE10P1FreezeLockIntact() && e10P1FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";

  const frozen =
    versionLockOk && gatePass && foundation.ready === true;
  const freezeState: E10P1FreezeState = {
    frozen,
    versionLockOk,
    gatePass,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
  };

  return {
    version: E10_P1_PLATFORM_FREEZE_VERSION,
    signoff: E10_P1_SIGNOFF_VERSION,
    freezeId: `e10-p1-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E10_PLATFORM_BASE,
    platformId: E10_PLATFORM_ID,
    layerVersion: E10_PLATFORM_VERSION,
    layerFreeze: E10_PLATFORM_FREEZE_VERSION,
    lock: {
      ...E10_P1_FREEZE_LOCK,
      components: [...E10_P1_FREEZE_LOCK.components],
    },
    versionLockOk,
    gate,
    freezeState,
    foundationReady: foundation.ready,
    summary: [
      `e10-p1-freeze frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `foundationReady=${foundation.ready}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

export function assertE10P1FreezePass(
  manifest: E10P1FreezeManifest = buildE10P1FreezeManifest(),
): asserts manifest is E10P1FreezeManifest & {
  freezeState: E10P1FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(`E10-P1 freeze not complete: ${manifest.summary}`);
  }
}
