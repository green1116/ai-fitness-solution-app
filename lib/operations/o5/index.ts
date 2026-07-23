/**
 * Operations O5 — Governance Freeze public exports
 * Isolated namespace: lib/operations/o5
 */

export {
  ENTERPRISE_OPERATIONS_COMPLETE_ID,
  EXPECTED_OPERATIONS_O5_FREEZE_LOCK,
  OPERATIONS_COMPLETE_ID,
  OPERATIONS_O5_COMPONENT_LOCK,
  OPERATIONS_O5_FREEZE_BASE,
  OPERATIONS_O5_FREEZE_LOCK,
  OPERATIONS_O5_FREEZE_VERSION,
  OPERATIONS_O5_PHASE_VERSIONS,
  OPERATIONS_O5_SIGNOFF_VERSION,
  isOperationsO5FreezeLockIntact,
  operationsO5FreezeLockMatchesExpected,
  type OperationsO5ComponentId,
  type OperationsO5ComponentLock,
  type OperationsO5FreezeLock,
  type OperationsO5PhaseVersions,
} from "./freeze/freeze.lock";

export {
  OPERATIONS_O5_EXPECTED_BASE_CHAIN,
  validateOperationsO5DependencyChain,
} from "./freeze/freeze.dependency";

export {
  assertOperationsImmutableManifestFrozen,
  buildOperationsImmutableManifest,
  type OperationsImmutableManifest,
  type OperationsO5FreezeState,
} from "./freeze/freeze.manifest";

export {
  assertOperationsO5ReleaseGatePass,
  checkOperationsO5ReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./release/release.gate";

export {
  assertOperationsO5FinalVerificationPass,
  runOperationsO5FinalVerification,
  type OperationsO5FinalVerificationResult,
} from "./release/release.verification";

export {
  OPERATIONS_ROLLBACK_SNAPSHOT_ENTRIES,
  getOperationsRollbackSnapshotByLayer,
  type OperationsO5RollbackSnapshotEntry,
} from "./rollback/rollback.snapshot";

export {
  buildOperationsRollbackSnapshotIndex,
  type OperationsO5RollbackSnapshot,
} from "./rollback/rollback.index";
