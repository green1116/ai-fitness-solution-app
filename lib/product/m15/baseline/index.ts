/**
 * Product M15 — Enterprise Evolution Baseline Freeze public exports
 * Isolated namespace: lib/product/m15/baseline
 */

export {
  ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID,
  isProductEvolutionFreezeLockIntact,
  PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE,
  PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_BASELINE_ID,
  PRODUCT_EVOLUTION_COMPONENT_LOCK,
  PRODUCT_EVOLUTION_FREEZE_LOCK,
  PRODUCT_EVOLUTION_PHASE_VERSIONS,
  PRODUCT_EVOLUTION_SIGNOFF_VERSION,
  type ProductEvolutionComponentId,
  type ProductEvolutionComponentLock,
  type ProductEvolutionFreezeLock,
  type ProductEvolutionPhaseVersions,
} from "./freeze/freeze.lock";

export {
  isProductEvolutionImmutableManifestIntact,
  PRODUCT_EVOLUTION_IMMUTABLE_MANIFEST,
  type ProductEvolutionImmutableManifest,
} from "./freeze/immutable.manifest";

export {
  isProductEvolutionRollbackSnapshotIntact,
  PRODUCT_EVOLUTION_ROLLBACK_SNAPSHOT,
  type ProductEvolutionRollbackSnapshot,
} from "./freeze/rollback.snapshot";
