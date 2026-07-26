/**
 * Product M09 — AI Governance Freeze public exports
 * Isolated namespace: lib/product/m09/baseline
 */

export {
  ENTERPRISE_PRODUCT_AI_BASELINE_ID,
  isProductAiFreezeLockIntact,
  PRODUCT_AI_BASELINE_FREEZE_BASE,
  PRODUCT_AI_BASELINE_FREEZE_VERSION,
  PRODUCT_AI_BASELINE_ID,
  PRODUCT_AI_COMPONENT_LOCK,
  PRODUCT_AI_FREEZE_LOCK,
  PRODUCT_AI_PHASE_VERSIONS,
  PRODUCT_AI_SIGNOFF_VERSION,
  type ProductAiComponentId,
  type ProductAiComponentLock,
  type ProductAiFreezeLock,
  type ProductAiPhaseVersions,
} from "./freeze/freeze.lock";

export {
  isProductAiImmutableManifestIntact,
  PRODUCT_AI_IMMUTABLE_MANIFEST,
  type ProductAiImmutableManifest,
} from "./freeze/immutable.manifest";

export {
  isProductAiRollbackSnapshotIntact,
  PRODUCT_AI_ROLLBACK_SNAPSHOT,
  type ProductAiRollbackSnapshot,
} from "./freeze/rollback.snapshot";
