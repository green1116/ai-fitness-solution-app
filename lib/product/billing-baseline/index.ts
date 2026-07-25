/**
 * Product Billing — Governance Freeze public exports
 * Isolated namespace: lib/product/billing-baseline
 */

export {
  ENTERPRISE_PRODUCT_BILLING_BASELINE_ID,
  isProductBillingFreezeLockIntact,
  PRODUCT_BILLING_BASELINE_FREEZE_BASE,
  PRODUCT_BILLING_BASELINE_FREEZE_VERSION,
  PRODUCT_BILLING_BASELINE_ID,
  PRODUCT_BILLING_COMPONENT_LOCK,
  PRODUCT_BILLING_FREEZE_LOCK,
  PRODUCT_BILLING_PHASE_VERSIONS,
  PRODUCT_BILLING_SIGNOFF_VERSION,
  type ProductBillingComponentId,
  type ProductBillingComponentLock,
  type ProductBillingFreezeLock,
  type ProductBillingPhaseVersions,
} from "./freeze/freeze.lock";

export {
  assertProductBillingBaselineReleaseGatePass,
  checkProductBillingBaselineReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
