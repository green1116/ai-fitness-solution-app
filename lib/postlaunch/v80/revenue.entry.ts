/**
 * V80 POST-LAUNCH P1 — Revenue activation entry (spec exports)
 */
export {
  V80_POSTLAUNCH_REVENUE_VERSION,
  V80_POSTLAUNCH_REVENUE_FREEZE_VERSION,
} from "./revenue.types";
export type {
  RevenueLoopStage,
  HighConversionEntryPoint,
  FirstCustomerRevenueStep,
  PricingPressurePoint,
  RevenueManifest,
  RevenueActivationReport,
} from "./revenue.types";

export { REVENUE_ACTIVATION_LOOP, isRevenueLoopComplete } from "./revenue.loop.spec";
export { HIGH_CONVERSION_ENTRY_POINTS, isHighConversionEntryPointsComplete } from "./revenue.entrypoints.spec";
export { FIRST_CUSTOMER_REVENUE_PATH, isFirstCustomerRevenuePathComplete } from "./revenue.first-customer.spec";
export { PRICING_PRESSURE_POINTS, isPricingPressureComplete } from "./revenue.pricing-pressure.spec";

export {
  buildRevenueActivation,
  buildRevenueManifest,
  assertRevenueActivationPass,
  formatRevenueSummary,
  runRevenueActivation,
} from "./revenue.builder";
