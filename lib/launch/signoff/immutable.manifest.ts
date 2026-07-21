/**
 * Launch P8 — Immutable Commercial Release Freeze Manifest (read-only)
 */

import { buildPlatformV1Manifest } from "../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../product/e12/signoff/governance.freeze.lock";
import {
  LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
  LAUNCH_P8_FREEZE_LOCK,
  LAUNCH_P8_GOVERNANCE_BASE,
  LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION,
  LAUNCH_P8_SIGNOFF_VERSION,
  isLaunchP8FreezeLockIntact,
  launchP8FreezeLockMatchesExpected,
  validateLaunchP8DependencyChain,
  type LaunchP8FreezeLock,
} from "./governance.freeze.lock";
import {
  checkLaunchP8ReleaseGate,
  type ReleaseGateResult,
} from "./governance.release.gate";
import {
  buildRollbackSnapshotIndex,
  type LaunchP8RollbackSnapshot,
} from "./rollback.snapshot.index";

export type LaunchP8FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  chainOk: boolean;
  gatePass: boolean;
  e12Ok: boolean;
  platformOk: boolean;
  state: "frozen" | "unfrozen" | "blocked";
  readOnly: true;
};

export type LaunchImmutableManifest = {
  version: typeof LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION;
  signoff: typeof LAUNCH_P8_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof LAUNCH_P8_GOVERNANCE_BASE;
  completeId: typeof LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  lock: LaunchP8FreezeLock;
  versionLockOk: boolean;
  chainOk: boolean;
  gate: ReleaseGateResult;
  rollbackSnapshot: LaunchP8RollbackSnapshot;
  freezeState: LaunchP8FreezeState;
  e12Ok: boolean;
  platformOk: boolean;
  summary: string;
  readOnly: true;
};

export function buildLaunchImmutableManifest(input?: {
  deploymentId?: string;
}): LaunchImmutableManifest {
  const deploymentId = input?.deploymentId ?? "launch-p8-governance-default";
  const platform = buildPlatformV1Manifest();
  const gate = checkLaunchP8ReleaseGate();
  const rollbackSnapshot = buildRollbackSnapshotIndex();
  const chain = validateLaunchP8DependencyChain();
  const versionLockOk =
    isLaunchP8FreezeLockIntact() && launchP8FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";
  const chainOk = chain.ok;
  const e12Ok =
    E12_PRODUCTIZATION_COMPLETE_ID ===
      "enterprise-e12-productization-complete-v1" &&
    LAUNCH_P8_FREEZE_LOCK.e12Baseline === E12_PRODUCTIZATION_COMPLETE_ID;
  const platformOk =
    platform.aligned === true &&
    LAUNCH_P8_FREEZE_LOCK.platformBaseline ===
      "enterprise-platform-v1-complete";

  const frozen =
    versionLockOk &&
    chainOk &&
    gatePass &&
    e12Ok &&
    platformOk &&
    rollbackSnapshot.indexComplete;

  const freezeState: LaunchP8FreezeState = {
    frozen,
    versionLockOk,
    chainOk,
    gatePass,
    e12Ok,
    platformOk,
    state: frozen ? "frozen" : gatePass ? "unfrozen" : "blocked",
    readOnly: true,
  };

  return {
    version: LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION,
    signoff: LAUNCH_P8_SIGNOFF_VERSION,
    freezeId: `${LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID}:${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: LAUNCH_P8_GOVERNANCE_BASE,
    completeId: LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
    e12Baseline: "enterprise-e12-productization-complete-v1",
    platformBaseline: "enterprise-platform-v1-complete",
    lock: LAUNCH_P8_FREEZE_LOCK,
    versionLockOk,
    chainOk,
    gate,
    rollbackSnapshot,
    freezeState,
    e12Ok,
    platformOk,
    summary: [
      `launch-immutable frozen=${frozen}`,
      `gate=${gate.result}`,
      `chain=${chainOk}`,
      `e12=${e12Ok}`,
      `platform=${platformOk}`,
    ].join(" "),
    readOnly: true,
  };
}

export function assertLaunchImmutableManifestFrozen(
  manifest: LaunchImmutableManifest = buildLaunchImmutableManifest(),
): asserts manifest is LaunchImmutableManifest & {
  freezeState: LaunchP8FreezeState & { frozen: true; state: "frozen" };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(
      `launch immutable manifest not frozen: ${manifest.summary}`,
    );
  }
}
