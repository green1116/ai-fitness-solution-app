/**
 * Product M12 — AI Agent Platform Baseline Freeze public exports
 * Isolated namespace: lib/product/m12/baseline
 */

export {
  ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
  isProductAgentFreezeLockIntact,
  PRODUCT_AGENT_BASELINE_FREEZE_BASE,
  PRODUCT_AGENT_BASELINE_FREEZE_VERSION,
  PRODUCT_AGENT_BASELINE_ID,
  PRODUCT_AGENT_COMPONENT_LOCK,
  PRODUCT_AGENT_FREEZE_LOCK,
  PRODUCT_AGENT_PHASE_VERSIONS,
  PRODUCT_AGENT_SIGNOFF_VERSION,
  type ProductAgentComponentId,
  type ProductAgentComponentLock,
  type ProductAgentFreezeLock,
  type ProductAgentPhaseVersions,
} from "./freeze/freeze.lock";

export {
  isProductAgentImmutableManifestIntact,
  PRODUCT_AGENT_IMMUTABLE_MANIFEST,
  type ProductAgentImmutableManifest,
} from "./freeze/immutable.manifest";

export {
  isProductAgentRollbackSnapshotIntact,
  PRODUCT_AGENT_ROLLBACK_SNAPSHOT,
  type ProductAgentRollbackSnapshot,
} from "./freeze/rollback.snapshot";
