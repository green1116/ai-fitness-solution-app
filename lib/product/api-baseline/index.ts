/**
 * Product API — Governance Freeze public exports
 * Isolated namespace: lib/product/api-baseline
 */

export {
  ENTERPRISE_PRODUCT_API_BASELINE_ID,
  isProductApiFreezeLockIntact,
  PRODUCT_API_BASELINE_FREEZE_BASE,
  PRODUCT_API_BASELINE_FREEZE_VERSION,
  PRODUCT_API_BASELINE_ID,
  PRODUCT_API_COMPONENT_LOCK,
  PRODUCT_API_FREEZE_LOCK,
  PRODUCT_API_PHASE_VERSIONS,
  PRODUCT_API_SIGNOFF_VERSION,
  type ProductApiComponentId,
  type ProductApiComponentLock,
  type ProductApiFreezeLock,
  type ProductApiPhaseVersions,
} from "./freeze/freeze.lock";

export {
  isProductApiImmutableManifestIntact,
  PRODUCT_API_IMMUTABLE_MANIFEST,
  type ProductApiImmutableManifest,
} from "./freeze/immutable.manifest";

export {
  isProductApiRollbackSnapshotIntact,
  PRODUCT_API_ROLLBACK_SNAPSHOT,
  type ProductApiRollbackSnapshot,
} from "./freeze/rollback.snapshot";

export {
  assertProductApiBaselineReleaseGatePass,
  checkProductApiBaselineReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
