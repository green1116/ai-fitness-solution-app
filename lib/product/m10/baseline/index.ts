/**
 * Product M10 — AI Runtime Governance Freeze public exports
 * Isolated namespace: lib/product/m10/baseline
 */

export {
  ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
  isProductAiRuntimeFreezeLockIntact,
  PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE,
  PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_BASELINE_ID,
  PRODUCT_AI_RUNTIME_COMPONENT_LOCK,
  PRODUCT_AI_RUNTIME_FREEZE_LOCK,
  PRODUCT_AI_RUNTIME_PHASE_VERSIONS,
  PRODUCT_AI_RUNTIME_SIGNOFF_VERSION,
  type ProductAiRuntimeComponentId,
  type ProductAiRuntimeComponentLock,
  type ProductAiRuntimeFreezeLock,
  type ProductAiRuntimePhaseVersions,
} from "./freeze/freeze.lock";

export {
  isProductAiRuntimeImmutableManifestIntact,
  PRODUCT_AI_RUNTIME_IMMUTABLE_MANIFEST,
  type ProductAiRuntimeImmutableManifest,
} from "./freeze/immutable.manifest";

export {
  isProductAiRuntimeRollbackSnapshotIntact,
  PRODUCT_AI_RUNTIME_ROLLBACK_SNAPSHOT,
  type ProductAiRuntimeRollbackSnapshot,
} from "./freeze/rollback.snapshot";
