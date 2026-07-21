/**
 * E12-P8 — Immutable Productization Governance Freeze Manifest (read-only)
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  E12_P8_FREEZE_LOCK,
  E12_P8_GOVERNANCE_BASE,
  E12_P8_PRODUCTIZATION_FREEZE_VERSION,
  E12_P8_SIGNOFF_VERSION,
  E12_PRODUCTIZATION_COMPLETE_ID,
  e12P8FreezeLockMatchesExpected,
  isE12P8FreezeLockIntact,
  validateE12P8DependencyChain,
  type E12P8FreezeLock,
} from "./governance.freeze.lock";
import {
  checkE12P8ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  buildRollbackSnapshotIndex,
  type E12P8RollbackSnapshot,
} from "./rollback.snapshot.index";

export type E12P8FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  chainOk: boolean;
  gatePass: boolean;
  platformOk: boolean;
  state: "frozen" | "unfrozen" | "blocked";
  readOnly: true;
};

export type E12ImmutableManifest = {
  version: typeof E12_P8_PRODUCTIZATION_FREEZE_VERSION;
  signoff: typeof E12_P8_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E12_P8_GOVERNANCE_BASE;
  completeId: typeof E12_PRODUCTIZATION_COMPLETE_ID;
  platformBaseline: "enterprise-platform-v1-complete";
  lock: E12P8FreezeLock;
  versionLockOk: boolean;
  chainOk: boolean;
  gate: ReleaseGateResult;
  rollbackSnapshot: E12P8RollbackSnapshot;
  freezeState: E12P8FreezeState;
  platformOk: boolean;
  summary: string;
  readOnly: true;
};

export function buildE12ImmutableManifest(input?: {
  deploymentId?: string;
}): E12ImmutableManifest {
  const deploymentId = input?.deploymentId ?? "e12-p8-governance-default";
  const platform = buildPlatformV1Manifest();
  const gate = checkE12P8ReleaseGate();
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const chain = validateE12P8DependencyChain();
  const versionLockOk =
    isE12P8FreezeLockIntact() && e12P8FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";
  const chainOk = chain.ok;
  const platformOk = platform.aligned === true;

  const frozen =
    versionLockOk &&
    chainOk &&
    gatePass &&
    platformOk &&
    rollbackSnapshot.indexComplete;

  const freezeState: E12P8FreezeState = {
    frozen,
    versionLockOk,
    chainOk,
    gatePass,
    platformOk,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
    readOnly: true,
  };

  return {
    version: E12_P8_PRODUCTIZATION_FREEZE_VERSION,
    signoff: E12_P8_SIGNOFF_VERSION,
    freezeId: `e12-productization-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E12_P8_GOVERNANCE_BASE,
    completeId: E12_PRODUCTIZATION_COMPLETE_ID,
    platformBaseline: "enterprise-platform-v1-complete",
    lock: {
      ...E12_P8_FREEZE_LOCK,
      phases: { ...E12_P8_FREEZE_LOCK.phases },
      components: [...E12_P8_FREEZE_LOCK.components],
    },
    versionLockOk,
    chainOk,
    gate,
    rollbackSnapshot,
    freezeState,
    platformOk,
    summary: [
      `e12-productization-governance frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `chain=${chainOk}`,
      `platform=${platformOk}`,
      `rollback=${rollbackSnapshot.entryCount}`,
      `state=${freezeState.state}`,
      `complete=${E12_PRODUCTIZATION_COMPLETE_ID}`,
    ].join(" "),
    readOnly: true,
  };
}

export function assertE12ImmutableManifestFrozen(
  manifest: E12ImmutableManifest = buildE12ImmutableManifest(),
): asserts manifest is E12ImmutableManifest & {
  freezeState: E12P8FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(
      `E12 productization governance freeze not complete: ${manifest.summary}`,
    );
  }
}
