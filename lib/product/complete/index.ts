/**
 * Product Complete — public exports
 * Isolated namespace: lib/product/complete
 */

export {
  ENTERPRISE_PRODUCT_COMPLETE_ID,
  isProductCompleteFreezeLockIntact,
  PRODUCT_COMPLETE_COMPONENT_LOCK,
  PRODUCT_COMPLETE_FREEZE_BASE,
  PRODUCT_COMPLETE_FREEZE_LOCK,
  PRODUCT_COMPLETE_FREEZE_VERSION,
  PRODUCT_COMPLETE_ID,
  PRODUCT_COMPLETE_PHASE_VERSIONS,
  PRODUCT_COMPLETE_SIGNOFF_VERSION,
  type ProductCompleteComponentId,
  type ProductCompleteComponentLock,
  type ProductCompleteFreezeLock,
  type ProductCompletePhaseVersions,
} from "./freeze/freeze.lock";

export {
  assertProductCompleteReleaseGatePass,
  checkProductCompleteReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
