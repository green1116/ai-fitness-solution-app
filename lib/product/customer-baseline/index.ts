/**
 * Product Customer — Governance Freeze public exports
 * Isolated namespace: lib/product/customer-baseline
 */

export {
  ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID,
  isProductCustomerFreezeLockIntact,
  PRODUCT_CUSTOMER_BASELINE_FREEZE_BASE,
  PRODUCT_CUSTOMER_BASELINE_FREEZE_VERSION,
  PRODUCT_CUSTOMER_BASELINE_ID,
  PRODUCT_CUSTOMER_COMPONENT_LOCK,
  PRODUCT_CUSTOMER_FREEZE_LOCK,
  PRODUCT_CUSTOMER_PHASE_VERSIONS,
  PRODUCT_CUSTOMER_SIGNOFF_VERSION,
  type ProductCustomerComponentId,
  type ProductCustomerComponentLock,
  type ProductCustomerFreezeLock,
  type ProductCustomerPhaseVersions,
} from "./freeze/freeze.lock";

export {
  assertProductCustomerBaselineReleaseGatePass,
  checkProductCustomerBaselineReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
