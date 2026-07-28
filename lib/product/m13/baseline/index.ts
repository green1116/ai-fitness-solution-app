/**
 * Product M13 — Enterprise Operating System Baseline Freeze public exports
 * Isolated namespace: lib/product/m13/baseline
 */

export {
  ENTERPRISE_PRODUCT_OS_BASELINE_ID,
  isProductOsFreezeLockIntact,
  PRODUCT_OS_BASELINE_FREEZE_BASE,
  PRODUCT_OS_BASELINE_FREEZE_VERSION,
  PRODUCT_OS_BASELINE_ID,
  PRODUCT_OS_COMPONENT_LOCK,
  PRODUCT_OS_FREEZE_LOCK,
  PRODUCT_OS_PHASE_VERSIONS,
  PRODUCT_OS_SIGNOFF_VERSION,
  type ProductOsComponentId,
  type ProductOsComponentLock,
  type ProductOsFreezeLock,
  type ProductOsPhaseVersions,
} from "./freeze/freeze.lock";

export {
  isProductOsImmutableManifestIntact,
  PRODUCT_OS_IMMUTABLE_MANIFEST,
  type ProductOsImmutableManifest,
} from "./freeze/immutable.manifest";

export {
  isProductOsRollbackSnapshotIntact,
  PRODUCT_OS_ROLLBACK_SNAPSHOT,
  type ProductOsRollbackSnapshot,
} from "./freeze/rollback.snapshot";
