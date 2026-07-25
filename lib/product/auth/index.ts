/**
 * Product Auth — Governance Freeze public exports
 * Isolated namespace: lib/product/auth
 */

export {
  ENTERPRISE_PRODUCT_AUTH_BASELINE_ID,
  isProductAuthFreezeLockIntact,
  PRODUCT_AUTH_BASELINE_ID,
  PRODUCT_AUTH_COMPONENT_LOCK,
  PRODUCT_AUTH_FREEZE_BASE,
  PRODUCT_AUTH_FREEZE_LOCK,
  PRODUCT_AUTH_FREEZE_VERSION,
  PRODUCT_AUTH_PHASE_VERSIONS,
  PRODUCT_AUTH_SIGNOFF_VERSION,
  type ProductAuthComponentId,
  type ProductAuthComponentLock,
  type ProductAuthFreezeLock,
  type ProductAuthPhaseVersions,
} from "./freeze/freeze.lock";

export {
  assertProductAuthReleaseGatePass,
  checkProductAuthReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
