/**
 * Post-Launch P8 — Immutable Operations Governance Freeze Manifest (read-only)
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../launch/signoff/governance.freeze.lock";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_GOVERNANCE_COMPLETE_ID,
  OPERATIONS_P8_FREEZE_LOCK,
  OPERATIONS_P8_GOVERNANCE_BASE,
  OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION,
  OPERATIONS_P8_SIGNOFF_VERSION,
  isOperationsP8FreezeLockIntact,
  operationsP8FreezeLockMatchesExpected,
  validateOperationsP8DependencyChain,
  type OperationsP8FreezeLock,
} from "./governance.freeze.lock";
import {
  checkOperationsP8ReleaseGate,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  buildOperationsRollbackSnapshotIndex,
  type OperationsP8RollbackSnapshot,
} from "./rollback.snapshot.index";

export type OperationsP8FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  chainOk: boolean;
  gatePass: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  state: "frozen" | "unfrozen" | "blocked";
  readOnly: true;
};

export type OperationsImmutableManifest = {
  version: typeof OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION;
  signoff: typeof OPERATIONS_P8_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof OPERATIONS_P8_GOVERNANCE_BASE;
  completeId: typeof OPERATIONS_GOVERNANCE_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_OPERATIONS_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  lock: OperationsP8FreezeLock;
  versionLockOk: boolean;
  chainOk: boolean;
  gate: ReleaseGateResult;
  rollbackSnapshot: OperationsP8RollbackSnapshot;
  freezeState: OperationsP8FreezeState;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  summary: string;
  readOnly: true;
};

export function buildOperationsImmutableManifest(input?: {
  deploymentId?: string;
}): OperationsImmutableManifest {
  const deploymentId = input?.deploymentId ?? "operations-p8-governance-default";
  const platform = buildPlatformV1Manifest();
  const gate = checkOperationsP8ReleaseGate();
  const rollbackSnapshot = buildOperationsRollbackSnapshotIndex();
  const chain = validateOperationsP8DependencyChain();
  const versionLockOk =
    isOperationsP8FreezeLockIntact() &&
    operationsP8FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";
  const chainOk = chain.ok;
  const launchOk =
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
    OPERATIONS_P8_FREEZE_LOCK.launchBaseline === ENTERPRISE_LAUNCH_COMPLETE_ID;
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1" &&
    OPERATIONS_P8_FREEZE_LOCK.e12Baseline === E12_PRODUCTIZATION_COMPLETE_ID;
  const platformOk =
    platform.aligned === true &&
    OPERATIONS_P8_FREEZE_LOCK.platformBaseline ===
      "enterprise-platform-v1-complete";

  const frozen =
    versionLockOk &&
    chainOk &&
    gatePass &&
    launchOk &&
    e12Ok &&
    platformOk &&
    rollbackSnapshot.indexComplete;

  const freezeState: OperationsP8FreezeState = {
    frozen,
    versionLockOk,
    chainOk,
    gatePass,
    launchOk,
    e12Ok,
    platformOk,
    state: frozen ? "frozen" : gatePass ? "unfrozen" : "blocked",
    readOnly: true,
  };

  return {
    version: OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION,
    signoff: OPERATIONS_P8_SIGNOFF_VERSION,
    freezeId: `${OPERATIONS_GOVERNANCE_COMPLETE_ID}:${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: OPERATIONS_P8_GOVERNANCE_BASE,
    completeId: OPERATIONS_GOVERNANCE_COMPLETE_ID,
    completeAlias: ENTERPRISE_OPERATIONS_COMPLETE_ID,
    launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
    e12Baseline: "enterprise-e12-productization-complete-v1",
    platformBaseline: "enterprise-platform-v1-complete",
    lock: OPERATIONS_P8_FREEZE_LOCK,
    versionLockOk,
    chainOk,
    gate,
    rollbackSnapshot,
    freezeState,
    launchOk,
    e12Ok,
    platformOk,
    summary: [
      `operations-immutable frozen=${frozen}`,
      `gate=${gate.result}`,
      `chain=${chainOk}`,
      `launch=${launchOk}`,
      `e12=${e12Ok}`,
      `platform=${platformOk}`,
    ].join(" "),
    readOnly: true,
  };
}

export function assertOperationsImmutableManifestFrozen(
  manifest: OperationsImmutableManifest = buildOperationsImmutableManifest(),
): asserts manifest is OperationsImmutableManifest & {
  freezeState: OperationsP8FreezeState & { frozen: true; state: "frozen" };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(
      `operations immutable manifest not frozen: ${manifest.summary}`,
    );
  }
}
