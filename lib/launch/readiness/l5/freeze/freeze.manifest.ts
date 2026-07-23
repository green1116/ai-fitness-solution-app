/**
 * Launch L5 — Immutable freeze manifest (read-only)
 */

import { buildPlatformV1Manifest } from "../../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../../commercialization/p8/freeze/freeze.lock";
import { validateLaunchL5DependencyChain } from "./freeze.dependency";
import {
  ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  LAUNCH_L5_FREEZE_BASE,
  LAUNCH_L5_FREEZE_LOCK,
  LAUNCH_L5_FREEZE_VERSION,
  LAUNCH_L5_SIGNOFF_VERSION,
  LAUNCH_READINESS_COMPLETE_ID,
  isLaunchL5FreezeLockIntact,
  launchL5FreezeLockMatchesExpected,
  type LaunchL5FreezeLock,
} from "./freeze.lock";
import {
  checkLaunchL5ReleaseGate,
  type ReleaseGateResult,
} from "../release/release.gate";
import {
  buildLaunchReadinessRollbackSnapshotIndex,
  type LaunchL5RollbackSnapshot,
} from "../rollback/rollback.index";

export type LaunchL5FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  chainOk: boolean;
  gatePass: boolean;
  commercializationOk: boolean;
  evolutionOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  state: "frozen" | "unfrozen" | "blocked";
  readOnly: true;
};

export type LaunchReadinessImmutableManifest = {
  version: typeof LAUNCH_L5_FREEZE_VERSION;
  signoff: typeof LAUNCH_L5_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof LAUNCH_L5_FREEZE_BASE;
  completeId: typeof LAUNCH_READINESS_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID;
  commercializationBaseline: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  lock: LaunchL5FreezeLock;
  versionLockOk: boolean;
  chainOk: boolean;
  gate: ReleaseGateResult;
  rollbackSnapshot: LaunchL5RollbackSnapshot;
  freezeState: LaunchL5FreezeState;
  commercializationOk: boolean;
  evolutionOk: boolean;
  launchOk: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  summary: string;
  readOnly: true;
};

export function buildLaunchReadinessImmutableManifest(input?: {
  deploymentId?: string;
}): LaunchReadinessImmutableManifest {
  const deploymentId = input?.deploymentId ?? "launch-l5-freeze-default";
  const platform = buildPlatformV1Manifest();
  const gate = checkLaunchL5ReleaseGate();
  const rollbackSnapshot = buildLaunchReadinessRollbackSnapshotIndex();
  const chain = validateLaunchL5DependencyChain();
  const versionLockOk =
    isLaunchL5FreezeLockIntact() && launchL5FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";
  const chainOk = chain.ok;
  const commercializationOk =
    ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
      "enterprise-commercialization-complete-v1" &&
    LAUNCH_L5_FREEZE_LOCK.commercializationBaseline ===
      ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  const evolutionOk =
    ENTERPRISE_EVOLUTION_COMPLETE_ID ===
      "enterprise-evolution-complete-v1" &&
    LAUNCH_L5_FREEZE_LOCK.evolutionBaseline ===
      ENTERPRISE_EVOLUTION_COMPLETE_ID;
  const launchOk =
    ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
    LAUNCH_L5_FREEZE_LOCK.launchBaseline === ENTERPRISE_LAUNCH_COMPLETE_ID;
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1" &&
    LAUNCH_L5_FREEZE_LOCK.e12Baseline === E12_PRODUCTIZATION_COMPLETE_ID;
  const platformOk =
    platform.aligned === true &&
    LAUNCH_L5_FREEZE_LOCK.platformBaseline ===
      "enterprise-platform-v1-complete";

  const frozen =
    versionLockOk &&
    chainOk &&
    gatePass &&
    commercializationOk &&
    evolutionOk &&
    launchOk &&
    e12Ok &&
    platformOk &&
    rollbackSnapshot.indexComplete &&
    LAUNCH_L5_FREEZE_LOCK.readOnly === true;

  const freezeState: LaunchL5FreezeState = {
    frozen,
    versionLockOk,
    chainOk,
    gatePass,
    commercializationOk,
    evolutionOk,
    launchOk,
    e12Ok,
    platformOk,
    state: frozen ? "frozen" : gatePass ? "unfrozen" : "blocked",
    readOnly: true,
  };

  return {
    version: LAUNCH_L5_FREEZE_VERSION,
    signoff: LAUNCH_L5_SIGNOFF_VERSION,
    freezeId: `${LAUNCH_READINESS_COMPLETE_ID}:${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: LAUNCH_L5_FREEZE_BASE,
    completeId: LAUNCH_READINESS_COMPLETE_ID,
    completeAlias: ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
    commercializationBaseline: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
    evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
    launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
    e12Baseline: "enterprise-e12-productization-complete-v1",
    platformBaseline: "enterprise-platform-v1-complete",
    lock: LAUNCH_L5_FREEZE_LOCK,
    versionLockOk,
    chainOk,
    gate,
    rollbackSnapshot,
    freezeState,
    commercializationOk,
    evolutionOk,
    launchOk,
    e12Ok,
    platformOk,
    summary: [
      `launch-readiness-immutable frozen=${frozen}`,
      `gate=${gate.result}`,
      `chain=${chainOk}`,
      `commercialization=${commercializationOk}`,
      `evolution=${evolutionOk}`,
      `launch=${launchOk}`,
      `e12=${e12Ok}`,
      `platform=${platformOk}`,
    ].join(" "),
    readOnly: true,
  };
}

export function assertLaunchReadinessImmutableManifestFrozen(
  manifest: LaunchReadinessImmutableManifest = buildLaunchReadinessImmutableManifest(),
): asserts manifest is LaunchReadinessImmutableManifest & {
  freezeState: LaunchL5FreezeState & { frozen: true; state: "frozen" };
} {
  if (!manifest.freezeState.frozen || manifest.readOnly !== true) {
    throw new Error(
      `launch readiness immutable manifest not frozen: ${manifest.summary}`,
    );
  }
}
