/**
 * V3.7 FINAL Production Freeze Layer
 */

export {
  PRODUCTION_FREEZE_MANIFEST_VERSION,
  buildProductionFreezeManifest,
  type ProductionFreezeManifest,
  type IntegrityState,
} from "./freeze-manifest";

export {
  FREEZE_BASELINE_VERSION,
  buildFreezeBaseline,
  type FreezeBaseline,
  type FreezeBaselineLayer,
} from "./freeze-baseline";

export {
  FREEZE_INTEGRITY_VERSION,
  buildFreezeIntegrityReport,
  type FreezeIntegrityReport,
} from "./freeze-integrity";

export {
  FREEZE_RELEASE_VERSION,
  buildFreezeReleaseDescriptor,
  type FreezeReleaseDescriptor,
  type FreezeReleaseEntry,
} from "./freeze-release";

export {
  FREEZE_SNAPSHOT_VERSION,
  buildFreezeSnapshotMeta,
  type FreezeSnapshotMeta,
} from "./freeze-snapshot";

export {
  FREEZE_LOCK_VERSION,
  buildFreezeLockState,
  type FreezeLockState,
} from "./freeze-lock";
