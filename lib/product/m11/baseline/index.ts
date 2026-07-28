/**
 * Product M11 — Knowledge Platform Baseline Freeze public exports
 * Isolated namespace: lib/product/m11/baseline
 */

export {
  ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
  isProductKnowledgeFreezeLockIntact,
  PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE,
  PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_BASELINE_ID,
  PRODUCT_KNOWLEDGE_COMPONENT_LOCK,
  PRODUCT_KNOWLEDGE_FREEZE_LOCK,
  PRODUCT_KNOWLEDGE_PHASE_VERSIONS,
  PRODUCT_KNOWLEDGE_SIGNOFF_VERSION,
  type ProductKnowledgeComponentId,
  type ProductKnowledgeComponentLock,
  type ProductKnowledgeFreezeLock,
  type ProductKnowledgePhaseVersions,
} from "./freeze/freeze.lock";

export {
  isProductKnowledgeImmutableManifestIntact,
  PRODUCT_KNOWLEDGE_IMMUTABLE_MANIFEST,
  type ProductKnowledgeImmutableManifest,
} from "./freeze/immutable.manifest";

export {
  isProductKnowledgeRollbackSnapshotIntact,
  PRODUCT_KNOWLEDGE_ROLLBACK_SNAPSHOT,
  type ProductKnowledgeRollbackSnapshot,
} from "./freeze/rollback.snapshot";
