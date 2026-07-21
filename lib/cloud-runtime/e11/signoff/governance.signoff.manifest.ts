/**
 * E11-P8 — Governance Freeze Manifest Builder (read-only)
 */

import {
  E11_CONTROL_PLANE_BASE,
  E11_CONTROL_PLANE_FREEZE_VERSION,
  E11_CONTROL_PLANE_ID,
  E11_CONTROL_PLANE_VERSION,
} from "../control-plane/control-plane.constants";
import { getControlPlaneRegistryManifest } from "../control-plane/control-plane.manager";
import {
  E11_CLOUD_RUNTIME_ID,
} from "../core/cloud.constants";
import { buildCloudFoundation } from "../runtime/cloud.lifecycle";
import {
  E11_P8_FREEZE_LOCK,
  E11_P8_GOVERNANCE_BASE,
  E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_P8_SIGNOFF_VERSION,
  e11P8FreezeLockMatchesExpected,
  isE11P8FreezeLockIntact,
  validateE11P8DependencyChain,
  type E11P8FreezeLock,
} from "./governance.freeze.lock";
import {
  checkE11P8ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  buildRollbackSnapshotIndex,
  type E11P8RollbackSnapshot,
} from "./rollback.snapshot.index";

export type E11P8FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  chainOk: boolean;
  gatePass: boolean;
  state: "frozen" | "unfrozen" | "blocked";
};

export type E11P8FreezeManifest = {
  version: typeof E11_P8_CLOUD_RUNTIME_FREEZE_VERSION;
  signoff: typeof E11_P8_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E11_P8_GOVERNANCE_BASE;
  cloudRuntimeId: typeof E11_CLOUD_RUNTIME_ID;
  controlPlaneId: typeof E11_CONTROL_PLANE_ID;
  controlPlaneVersion: typeof E11_CONTROL_PLANE_VERSION;
  controlPlaneFreeze: typeof E11_CONTROL_PLANE_FREEZE_VERSION;
  controlPlaneBase: typeof E11_CONTROL_PLANE_BASE;
  lock: E11P8FreezeLock;
  versionLockOk: boolean;
  chainOk: boolean;
  gate: ReleaseGateResult;
  rollbackSnapshot: E11P8RollbackSnapshot;
  freezeState: E11P8FreezeState;
  foundationReady: boolean;
  controlPlaneReady: boolean;
  summary: string;
};

export function buildE11P8FreezeManifest(input?: {
  deploymentId?: string;
}): E11P8FreezeManifest {
  const deploymentId = input?.deploymentId ?? "e11-p8-freeze-default";
  const foundation = buildCloudFoundation();
  const controlPlaneManifest = getControlPlaneRegistryManifest();
  const gate = checkE11P8ReleaseGate();
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const chain = validateE11P8DependencyChain();
  const versionLockOk =
    isE11P8FreezeLockIntact() && e11P8FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";
  const chainOk = chain.ok;

  const foundationReady = foundation.ready === true;
  const controlPlaneReady =
    controlPlaneManifest.planeId === E11_CONTROL_PLANE_ID &&
    controlPlaneManifest.version === E11_CONTROL_PLANE_VERSION &&
    controlPlaneManifest.base === E11_CONTROL_PLANE_BASE &&
    controlPlaneManifest.freezeVersion === E11_CONTROL_PLANE_FREEZE_VERSION;

  const frozen =
    versionLockOk &&
    chainOk &&
    gatePass &&
    foundationReady &&
    controlPlaneReady &&
    rollbackSnapshot.indexComplete;

  const freezeState: E11P8FreezeState = {
    frozen,
    versionLockOk,
    chainOk,
    gatePass,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
  };

  return {
    version: E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
    signoff: E11_P8_SIGNOFF_VERSION,
    freezeId: `e11-p8-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E11_P8_GOVERNANCE_BASE,
    cloudRuntimeId: E11_CLOUD_RUNTIME_ID,
    controlPlaneId: E11_CONTROL_PLANE_ID,
    controlPlaneVersion: E11_CONTROL_PLANE_VERSION,
    controlPlaneFreeze: E11_CONTROL_PLANE_FREEZE_VERSION,
    controlPlaneBase: E11_CONTROL_PLANE_BASE,
    lock: {
      ...E11_P8_FREEZE_LOCK,
      phases: {
        p1: { ...E11_P8_FREEZE_LOCK.phases.p1 },
        p2: { ...E11_P8_FREEZE_LOCK.phases.p2 },
        p3: { ...E11_P8_FREEZE_LOCK.phases.p3 },
        p4: { ...E11_P8_FREEZE_LOCK.phases.p4 },
        p5: { ...E11_P8_FREEZE_LOCK.phases.p5 },
        p6: { ...E11_P8_FREEZE_LOCK.phases.p6 },
        p7: { ...E11_P8_FREEZE_LOCK.phases.p7 },
      },
      components: [...E11_P8_FREEZE_LOCK.components],
    },
    versionLockOk,
    chainOk,
    gate,
    rollbackSnapshot,
    freezeState,
    foundationReady,
    controlPlaneReady,
    summary: [
      `e11-p8-freeze frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `chain=${chainOk}`,
      `foundationReady=${foundationReady}`,
      `controlPlaneReady=${controlPlaneReady}`,
      `rollback=${rollbackSnapshot.entryCount}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

export function assertE11P8FreezePass(
  manifest: E11P8FreezeManifest = buildE11P8FreezeManifest(),
): asserts manifest is E11P8FreezeManifest & {
  freezeState: E11P8FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(`E11-P8 freeze not complete: ${manifest.summary}`);
  }
}
