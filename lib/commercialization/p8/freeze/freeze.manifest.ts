/**
 * Commercialization P8 — Immutable freeze manifest (read-only)
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { validateCommercializationP8DependencyChain } from "./freeze.dependency";
import {
  COMMERCIALIZATION_COMPLETE_ID,
  COMMERCIALIZATION_P8_FREEZE_BASE,
  COMMERCIALIZATION_P8_FREEZE_LOCK,
  COMMERCIALIZATION_P8_FREEZE_VERSION,
  COMMERCIALIZATION_P8_SIGNOFF_VERSION,
  ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  commercializationP8FreezeLockMatchesExpected,
  isCommercializationP8FreezeLockIntact,
  type CommercializationP8FreezeLock,
} from "./freeze.lock";
import {
  checkCommercializationP8ReleaseGate,
  type ReleaseGateResult,
} from "../release/release.gate";
import {
  buildCommercializationRollbackSnapshotIndex,
  type CommercializationP8RollbackSnapshot,
} from "../rollback/rollback.index";

export type CommercializationP8FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  chainOk: boolean;
  gatePass: boolean;
  evolutionOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  state: "frozen" | "unfrozen" | "blocked";
  readOnly: true;
};

export type CommercializationImmutableManifest = {
  version: typeof COMMERCIALIZATION_P8_FREEZE_VERSION;
  signoff: typeof COMMERCIALIZATION_P8_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof COMMERCIALIZATION_P8_FREEZE_BASE;
  completeId: typeof COMMERCIALIZATION_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  lock: CommercializationP8FreezeLock;
  versionLockOk: boolean;
  chainOk: boolean;
  gate: ReleaseGateResult;
  rollbackSnapshot: CommercializationP8RollbackSnapshot;
  freezeState: CommercializationP8FreezeState;
  evolutionOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  summary: string;
  readOnly: true;
};

export function buildCommercializationImmutableManifest(input?: {
  deploymentId?: string;
}): CommercializationImmutableManifest {
  const deploymentId =
    input?.deploymentId ?? "commercialization-p8-freeze-default";
  const platform = buildPlatformV1Manifest();
  const gate = checkCommercializationP8ReleaseGate();
  const rollbackSnapshot = buildCommercializationRollbackSnapshotIndex();
  const chain = validateCommercializationP8DependencyChain();
  const versionLockOk =
    isCommercializationP8FreezeLockIntact() &&
    commercializationP8FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";
  const chainOk = chain.ok;
  const evolutionOk =
    ENTERPRISE_EVOLUTION_COMPLETE_ID ===
      "enterprise-evolution-complete-v1" &&
    COMMERCIALIZATION_P8_FREEZE_LOCK.evolutionBaseline ===
      ENTERPRISE_EVOLUTION_COMPLETE_ID;
  const launchOk =
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
    COMMERCIALIZATION_P8_FREEZE_LOCK.launchBaseline ===
      ENTERPRISE_LAUNCH_COMPLETE_ID;
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1" &&
    COMMERCIALIZATION_P8_FREEZE_LOCK.e12Baseline ===
      E12_PRODUCTIZATION_COMPLETE_ID;
  const platformOk =
    platform.aligned === true &&
    COMMERCIALIZATION_P8_FREEZE_LOCK.platformBaseline ===
      "enterprise-platform-v1-complete";

  const frozen =
    versionLockOk &&
    chainOk &&
    gatePass &&
    evolutionOk &&
    launchOk &&
    e12Ok &&
    platformOk &&
    rollbackSnapshot.indexComplete &&
    COMMERCIALIZATION_P8_FREEZE_LOCK.readOnly === true;

  const freezeState: CommercializationP8FreezeState = {
    frozen,
    versionLockOk,
    chainOk,
    gatePass,
    evolutionOk,
    launchOk,
    e12Ok,
    platformOk,
    state: frozen ? "frozen" : gatePass ? "unfrozen" : "blocked",
    readOnly: true,
  };

  return {
    version: COMMERCIALIZATION_P8_FREEZE_VERSION,
    signoff: COMMERCIALIZATION_P8_SIGNOFF_VERSION,
    freezeId: `${COMMERCIALIZATION_COMPLETE_ID}:${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: COMMERCIALIZATION_P8_FREEZE_BASE,
    completeId: COMMERCIALIZATION_COMPLETE_ID,
    completeAlias: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
    evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
    launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
    e12Baseline: "enterprise-e12-productization-complete-v1",
    platformBaseline: "enterprise-platform-v1-complete",
    lock: COMMERCIALIZATION_P8_FREEZE_LOCK,
    versionLockOk,
    chainOk,
    gate,
    rollbackSnapshot,
    freezeState,
    evolutionOk,
    launchOk,
    e12Ok,
    platformOk,
    summary: [
      `commercialization-immutable frozen=${frozen}`,
      `gate=${gate.result}`,
      `chain=${chainOk}`,
      `evolution=${evolutionOk}`,
      `launch=${launchOk}`,
      `e12=${e12Ok}`,
      `platform=${platformOk}`,
    ].join(" "),
    readOnly: true,
  };
}

export function assertCommercializationImmutableManifestFrozen(
  manifest: CommercializationImmutableManifest = buildCommercializationImmutableManifest(),
): asserts manifest is CommercializationImmutableManifest & {
  freezeState: CommercializationP8FreezeState & {
    frozen: true;
    state: "frozen";
  };
} {
  if (!manifest.freezeState.frozen || manifest.readOnly !== true) {
    throw new Error(
      `commercialization immutable manifest not frozen: ${manifest.summary}`,
    );
  }
}
