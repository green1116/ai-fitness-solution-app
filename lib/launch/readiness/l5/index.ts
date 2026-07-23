/**
 * Launch L5 — Launch Freeze public exports
 * Isolated namespace: lib/launch/readiness/l5
 */

export {
  ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  EXPECTED_LAUNCH_L5_FREEZE_LOCK,
  LAUNCH_L5_COMPONENT_LOCK,
  LAUNCH_L5_FREEZE_BASE,
  LAUNCH_L5_FREEZE_LOCK,
  LAUNCH_L5_FREEZE_VERSION,
  LAUNCH_L5_PHASE_VERSIONS,
  LAUNCH_L5_SIGNOFF_VERSION,
  LAUNCH_READINESS_COMPLETE_ID,
  isLaunchL5FreezeLockIntact,
  launchL5FreezeLockMatchesExpected,
  type LaunchL5ComponentId,
  type LaunchL5ComponentLock,
  type LaunchL5FreezeLock,
  type LaunchL5PhaseVersions,
} from "./freeze/freeze.lock";

export {
  LAUNCH_L5_EXPECTED_BASE_CHAIN,
  validateLaunchL5DependencyChain,
} from "./freeze/freeze.dependency";

export {
  assertLaunchReadinessImmutableManifestFrozen,
  buildLaunchReadinessImmutableManifest,
  type LaunchL5FreezeState,
  type LaunchReadinessImmutableManifest,
} from "./freeze/freeze.manifest";

export {
  assertLaunchL5ReleaseGatePass,
  checkLaunchL5ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./release/release.gate";

export {
  assertLaunchL5FinalVerificationPass,
  runLaunchL5FinalVerification,
  type LaunchL5FinalVerificationResult,
} from "./release/release.verification";

export {
  LAUNCH_READINESS_ROLLBACK_SNAPSHOT_ENTRIES,
  getLaunchReadinessRollbackSnapshotByLayer,
  type LaunchL5RollbackSnapshotEntry,
} from "./rollback/rollback.snapshot";

export {
  buildLaunchReadinessRollbackSnapshotIndex,
  type LaunchL5RollbackSnapshot,
} from "./rollback/rollback.index";
