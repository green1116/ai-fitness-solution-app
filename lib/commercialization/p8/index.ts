/**
 * Commercialization P8 — Freeze public exports
 * Isolated namespace: lib/commercialization/p8
 */

export {
  COMMERCIALIZATION_COMPLETE_ID,
  COMMERCIALIZATION_P8_COMPONENT_LOCK,
  COMMERCIALIZATION_P8_FREEZE_BASE,
  COMMERCIALIZATION_P8_FREEZE_LOCK,
  COMMERCIALIZATION_P8_FREEZE_VERSION,
  COMMERCIALIZATION_P8_PHASE_VERSIONS,
  COMMERCIALIZATION_P8_SIGNOFF_VERSION,
  ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  EXPECTED_COMMERCIALIZATION_P8_FREEZE_LOCK,
  commercializationP8FreezeLockMatchesExpected,
  isCommercializationP8FreezeLockIntact,
  type CommercializationP8ComponentId,
  type CommercializationP8ComponentLock,
  type CommercializationP8FreezeLock,
  type CommercializationP8PhaseVersions,
} from "./freeze/freeze.lock";

export {
  COMMERCIALIZATION_P8_EXPECTED_BASE_CHAIN,
  validateCommercializationP8DependencyChain,
} from "./freeze/freeze.dependency";

export {
  assertCommercializationImmutableManifestFrozen,
  buildCommercializationImmutableManifest,
  type CommercializationImmutableManifest,
  type CommercializationP8FreezeState,
} from "./freeze/freeze.manifest";

export {
  assertCommercializationP8ReleaseGatePass,
  checkCommercializationP8ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./release/release.gate";

export {
  assertCommercializationP8FinalVerificationPass,
  runCommercializationP8FinalVerification,
  type CommercializationP8FinalVerificationResult,
} from "./release/release.verification";

export {
  COMMERCIALIZATION_ROLLBACK_SNAPSHOT_ENTRIES,
  getCommercializationRollbackSnapshotByLayer,
  type CommercializationP8RollbackSnapshotEntry,
} from "./rollback/rollback.snapshot";

export {
  buildCommercializationRollbackSnapshotIndex,
  type CommercializationP8RollbackSnapshot,
} from "./rollback/rollback.index";
