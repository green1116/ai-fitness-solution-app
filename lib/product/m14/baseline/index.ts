/**
 * Product M14 — Enterprise Intelligence Baseline Freeze public exports
 * Isolated namespace: lib/product/m14/baseline
 */

export {
  ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
  isProductIntelligenceFreezeLockIntact,
  PRODUCT_INTELLIGENCE_BASELINE_FREEZE_BASE,
  PRODUCT_INTELLIGENCE_BASELINE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_BASELINE_ID,
  PRODUCT_INTELLIGENCE_COMPONENT_LOCK,
  PRODUCT_INTELLIGENCE_FREEZE_LOCK,
  PRODUCT_INTELLIGENCE_PHASE_VERSIONS,
  PRODUCT_INTELLIGENCE_SIGNOFF_VERSION,
  type ProductIntelligenceComponentId,
  type ProductIntelligenceComponentLock,
  type ProductIntelligenceFreezeLock,
  type ProductIntelligencePhaseVersions,
} from "./freeze/freeze.lock";

export {
  isProductIntelligenceImmutableManifestIntact,
  PRODUCT_INTELLIGENCE_IMMUTABLE_MANIFEST,
  type ProductIntelligenceImmutableManifest,
} from "./freeze/immutable.manifest";

export {
  isProductIntelligenceRollbackSnapshotIntact,
  PRODUCT_INTELLIGENCE_ROLLBACK_SNAPSHOT,
  type ProductIntelligenceRollbackSnapshot,
} from "./freeze/rollback.snapshot";
