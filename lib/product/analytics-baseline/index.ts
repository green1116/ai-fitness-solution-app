/**
 * Product Analytics — Governance Freeze public exports
 * Isolated namespace: lib/product/analytics-baseline
 */

export {
  ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID,
  isProductAnalyticsFreezeLockIntact,
  PRODUCT_ANALYTICS_BASELINE_FREEZE_BASE,
  PRODUCT_ANALYTICS_BASELINE_FREEZE_VERSION,
  PRODUCT_ANALYTICS_BASELINE_ID,
  PRODUCT_ANALYTICS_COMPONENT_LOCK,
  PRODUCT_ANALYTICS_FREEZE_LOCK,
  PRODUCT_ANALYTICS_PHASE_VERSIONS,
  PRODUCT_ANALYTICS_SIGNOFF_VERSION,
  type ProductAnalyticsComponentId,
  type ProductAnalyticsComponentLock,
  type ProductAnalyticsFreezeLock,
  type ProductAnalyticsPhaseVersions,
} from "./freeze/freeze.lock";

export {
  assertProductAnalyticsBaselineReleaseGatePass,
  checkProductAnalyticsBaselineReleaseGate,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
