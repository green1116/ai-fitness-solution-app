/**
 * Product Marketplace — Governance Freeze public exports
 * Isolated namespace: lib/product/marketplace-baseline
 */

export {
  ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
  isProductMarketplaceFreezeLockIntact,
  PRODUCT_MARKETPLACE_BASELINE_FREEZE_BASE,
  PRODUCT_MARKETPLACE_BASELINE_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_BASELINE_ID,
  PRODUCT_MARKETPLACE_COMPONENT_LOCK,
  PRODUCT_MARKETPLACE_FREEZE_LOCK,
  PRODUCT_MARKETPLACE_PHASE_VERSIONS,
  PRODUCT_MARKETPLACE_SIGNOFF_VERSION,
  type ProductMarketplaceComponentId,
  type ProductMarketplaceComponentLock,
  type ProductMarketplaceFreezeLock,
  type ProductMarketplacePhaseVersions,
} from "./freeze/freeze.lock";

export {
  isProductMarketplaceImmutableManifestIntact,
  PRODUCT_MARKETPLACE_IMMUTABLE_MANIFEST,
  type ProductMarketplaceImmutableManifest,
} from "./freeze/immutable.manifest";

export {
  isProductMarketplaceRollbackSnapshotIntact,
  PRODUCT_MARKETPLACE_ROLLBACK_SNAPSHOT,
  type ProductMarketplaceRollbackSnapshot,
} from "./freeze/rollback.snapshot";

export {
  assertProductMarketplaceBaselineReleaseGatePass,
  checkProductMarketplaceBaselineReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
