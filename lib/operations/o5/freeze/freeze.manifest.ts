/**
 * Operations O5 — Immutable freeze manifest (read-only)
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { validateOperationsO5DependencyChain } from "./freeze.dependency";
import {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  OPERATIONS_COMPLETE_ID,
  OPERATIONS_O5_FREEZE_BASE,
  OPERATIONS_O5_FREEZE_LOCK,
  OPERATIONS_O5_FREEZE_VERSION,
  OPERATIONS_O5_SIGNOFF_VERSION,
  isOperationsO5FreezeLockIntact,
  operationsO5FreezeLockMatchesExpected,
  type OperationsO5FreezeLock,
} from "./freeze.lock";
import {
  checkOperationsO5ReleaseGate,
  type ReleaseGateResult,
} from "../release/release.gate";
import {
  buildOperationsRollbackSnapshotIndex,
  type OperationsO5RollbackSnapshot,
} from "../rollback/rollback.index";

export type OperationsO5FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  chainOk: boolean;
  gatePass: boolean;
  launchReadinessOk: boolean;
  commercializationOk: boolean;
  evolutionOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  state: "frozen" | "unfrozen" | "blocked";
  readOnly: true;
};

export type OperationsImmutableManifest = {
  version: typeof OPERATIONS_O5_FREEZE_VERSION;
  signoff: typeof OPERATIONS_O5_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof OPERATIONS_O5_FREEZE_BASE;
  completeId: typeof OPERATIONS_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_OPERATIONS_COMPLETE_ID;
  launchReadinessBaseline: typeof ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID;
  commercializationBaseline: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  lock: OperationsO5FreezeLock;
  versionLockOk: boolean;
  chainOk: boolean;
  gate: ReleaseGateResult;
  rollbackSnapshot: OperationsO5RollbackSnapshot;
  freezeState: OperationsO5FreezeState;
  launchReadinessOk: boolean;
  commercializationOk: boolean;
  evolutionOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  summary: string;
  readOnly: true;
};

export function buildOperationsImmutableManifest(input?: {
  deploymentId?: string;
}): OperationsImmutableManifest {
  const deploymentId = input?.deploymentId ?? "operations-o5-freeze-default";
  const platform = buildPlatformV1Manifest();
  const gate = checkOperationsO5ReleaseGate();
  const rollbackSnapshot = buildOperationsRollbackSnapshotIndex();
  const chain = validateOperationsO5DependencyChain();
  const versionLockOk =
    isOperationsO5FreezeLockIntact() &&
    operationsO5FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";
  const chainOk = chain.ok;
  const launchReadinessOk =
    ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
      "enterprise-launch-readiness-complete-v1" &&
    OPERATIONS_O5_FREEZE_LOCK.launchReadinessBaseline ===
      ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID;
  const commercializationOk =
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1" &&
    OPERATIONS_O5_FREEZE_LOCK.commercializationBaseline ===
      ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  const evolutionOk =
    ENTERPRISE_EVOLUTION_COMPLETE_ID ===
      "enterprise-evolution-complete-v1" &&
    OPERATIONS_O5_FREEZE_LOCK.evolutionBaseline ===
      ENTERPRISE_EVOLUTION_COMPLETE_ID;
  const launchOk =
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
    OPERATIONS_O5_FREEZE_LOCK.launchBaseline === ENTERPRISE_LAUNCH_COMPLETE_ID;
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1" &&
    OPERATIONS_O5_FREEZE_LOCK.e12Baseline === E12_PRODUCTIZATION_COMPLETE_ID;
  const platformOk =
    platform.aligned === true &&
    OPERATIONS_O5_FREEZE_LOCK.platformBaseline ===
      "enterprise-platform-v1-complete";

  const frozen =
    versionLockOk &&
    chainOk &&
    gatePass &&
    launchReadinessOk &&
    commercializationOk &&
    evolutionOk &&
    launchOk &&
    e12Ok &&
    platformOk &&
    rollbackSnapshot.indexComplete &&
    OPERATIONS_O5_FREEZE_LOCK.readOnly === true;

  const freezeState: OperationsO5FreezeState = {
    frozen,
    versionLockOk,
    chainOk,
    gatePass,
    launchReadinessOk,
    commercializationOk,
    evolutionOk,
    launchOk,
    e12Ok,
    platformOk,
    state: frozen ? "frozen" : gatePass ? "unfrozen" : "blocked",
    readOnly: true,
  };

  return {
    version: OPERATIONS_O5_FREEZE_VERSION,
    signoff: OPERATIONS_O5_SIGNOFF_VERSION,
    freezeId: `${OPERATIONS_COMPLETE_ID}:${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: OPERATIONS_O5_FREEZE_BASE,
    completeId: OPERATIONS_COMPLETE_ID,
    completeAlias: ENTERPRISE_OPERATIONS_COMPLETE_ID,
    launchReadinessBaseline: ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
    commercializationBaseline: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
    evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
    launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
    e12Baseline: "enterprise-e12-productization-complete-v1",
    platformBaseline: "enterprise-platform-v1-complete",
    lock: OPERATIONS_O5_FREEZE_LOCK,
    versionLockOk,
    chainOk,
    gate,
    rollbackSnapshot,
    freezeState,
    launchReadinessOk,
    commercializationOk,
    evolutionOk,
    launchOk,
    e12Ok,
    platformOk,
    summary: [
      `operations-immutable frozen=${frozen}`,
      `gate=${gate.result}`,
      `chain=${chainOk}`,
      `launchReadiness=${launchReadinessOk}`,
      `commercialization=${commercializationOk}`,
      `evolution=${evolutionOk}`,
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
  freezeState: OperationsO5FreezeState & { frozen: true; state: "frozen" };
} {
  if (!manifest.freezeState.frozen || manifest.readOnly !== true) {
    throw new Error(
      `operations immutable manifest not frozen: ${manifest.summary}`,
    );
  }
}
