/**
 * E10-P8 — Governance Freeze Manifest Builder (read-only)
 */

import {
  E10_PLATFORM_ID,
} from "../core/platform.constants";
import { buildPlatformFoundation } from "../core/platform.lifecycle";
import {
  E10_OS_BASE,
  E10_OS_FREEZE_VERSION,
  E10_OS_ID,
  E10_OS_VERSION,
} from "../os/os.constants";
import { getOsRegistryManifest } from "../os/os.manager";
import {
  E10_P8_FREEZE_LOCK,
  E10_P8_GOVERNANCE_BASE,
  E10_P8_PLATFORM_FREEZE_VERSION,
  E10_P8_SIGNOFF_VERSION,
  e10P8FreezeLockMatchesExpected,
  isE10P8FreezeLockIntact,
  validateE10P8DependencyChain,
  type E10P8FreezeLock,
} from "./governance.freeze.lock";
import {
  checkE10P8ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  buildRollbackSnapshotIndex,
  type E10P8RollbackSnapshot,
} from "./rollback.snapshot.index";

export type E10P8FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  chainOk: boolean;
  gatePass: boolean;
  state: "frozen" | "unfrozen" | "blocked";
};

export type E10P8FreezeManifest = {
  version: typeof E10_P8_PLATFORM_FREEZE_VERSION;
  signoff: typeof E10_P8_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E10_P8_GOVERNANCE_BASE;
  platformId: typeof E10_PLATFORM_ID;
  osId: typeof E10_OS_ID;
  osVersion: typeof E10_OS_VERSION;
  osFreeze: typeof E10_OS_FREEZE_VERSION;
  osBase: typeof E10_OS_BASE;
  lock: E10P8FreezeLock;
  versionLockOk: boolean;
  chainOk: boolean;
  gate: ReleaseGateResult;
  rollbackSnapshot: E10P8RollbackSnapshot;
  freezeState: E10P8FreezeState;
  foundationReady: boolean;
  osReady: boolean;
  summary: string;
};

export function buildE10P8FreezeManifest(input?: {
  deploymentId?: string;
}): E10P8FreezeManifest {
  const deploymentId = input?.deploymentId ?? "e10-p8-freeze-default";
  const foundation = buildPlatformFoundation();
  const osManifest = getOsRegistryManifest();
  const gate = checkE10P8ReleaseGate();
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const chain = validateE10P8DependencyChain();
  const versionLockOk =
    isE10P8FreezeLockIntact() && e10P8FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";
  const chainOk = chain.ok;

  const foundationReady = foundation.ready === true;
  const osReady =
    osManifest.osId === E10_OS_ID &&
    osManifest.version === E10_OS_VERSION &&
    osManifest.base === E10_OS_BASE &&
    osManifest.freezeVersion === E10_OS_FREEZE_VERSION;

  const frozen =
    versionLockOk &&
    chainOk &&
    gatePass &&
    foundationReady &&
    osReady &&
    rollbackSnapshot.indexComplete;

  const freezeState: E10P8FreezeState = {
    frozen,
    versionLockOk,
    chainOk,
    gatePass,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
  };

  return {
    version: E10_P8_PLATFORM_FREEZE_VERSION,
    signoff: E10_P8_SIGNOFF_VERSION,
    freezeId: `e10-p8-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E10_P8_GOVERNANCE_BASE,
    platformId: E10_PLATFORM_ID,
    osId: E10_OS_ID,
    osVersion: E10_OS_VERSION,
    osFreeze: E10_OS_FREEZE_VERSION,
    osBase: E10_OS_BASE,
    lock: {
      ...E10_P8_FREEZE_LOCK,
      phases: {
        p1: { ...E10_P8_FREEZE_LOCK.phases.p1 },
        p2: { ...E10_P8_FREEZE_LOCK.phases.p2 },
        p3: { ...E10_P8_FREEZE_LOCK.phases.p3 },
        p4: { ...E10_P8_FREEZE_LOCK.phases.p4 },
        p5: { ...E10_P8_FREEZE_LOCK.phases.p5 },
        p6: { ...E10_P8_FREEZE_LOCK.phases.p6 },
        p7: { ...E10_P8_FREEZE_LOCK.phases.p7 },
      },
      components: [...E10_P8_FREEZE_LOCK.components],
    },
    versionLockOk,
    chainOk,
    gate,
    rollbackSnapshot,
    freezeState,
    foundationReady,
    osReady,
    summary: [
      `e10-p8-freeze frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `chain=${chainOk}`,
      `foundationReady=${foundationReady}`,
      `osReady=${osReady}`,
      `rollback=${rollbackSnapshot.entryCount}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

export function assertE10P8FreezePass(
  manifest: E10P8FreezeManifest = buildE10P8FreezeManifest(),
): asserts manifest is E10P8FreezeManifest & {
  freezeState: E10P8FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(`E10-P8 freeze not complete: ${manifest.summary}`);
  }
}
