/**
 * Product Admin — Governance Freeze public exports
 * Isolated namespace: lib/product/admin-baseline
 */

export {
  ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID,
  isProductAdminFreezeLockIntact,
  PRODUCT_ADMIN_BASELINE_FREEZE_BASE,
  PRODUCT_ADMIN_BASELINE_FREEZE_VERSION,
  PRODUCT_ADMIN_BASELINE_ID,
  PRODUCT_ADMIN_COMPONENT_LOCK,
  PRODUCT_ADMIN_FREEZE_LOCK,
  PRODUCT_ADMIN_PHASE_VERSIONS,
  PRODUCT_ADMIN_SIGNOFF_VERSION,
  type ProductAdminComponentId,
  type ProductAdminComponentLock,
  type ProductAdminFreezeLock,
  type ProductAdminPhaseVersions,
} from "./freeze/freeze.lock";

export {
  assertProductAdminBaselineReleaseGatePass,
  checkProductAdminBaselineReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
