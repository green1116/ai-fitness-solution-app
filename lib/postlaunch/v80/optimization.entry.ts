/**
 * V80 POST-LAUNCH P2 — Revenue optimization entry (spec exports)
 */
export {
  V80_POSTLAUNCH_OPTIMIZATION_VERSION,
  V80_POSTLAUNCH_OPTIMIZATION_FREEZE_VERSION,
} from "./optimization.types";
export type {
  ConversionRateTuning,
  EnterpriseSalesAcceleration,
  PricingYieldOptimization,
  RevenueLeakPoint,
  OptimizationManifest,
  RevenueOptimizationReport,
} from "./optimization.types";

export { CONVERSION_RATE_TUNING, isConversionRateTuningComplete } from "./optimization.conversion.spec";
export { ENTERPRISE_SALES_ACCELERATION, isEnterpriseSalesAccelerationComplete } from "./optimization.enterprise.spec";
export { PRICING_YIELD_OPTIMIZATION, isPricingYieldOptimizationComplete } from "./optimization.pricing-yield.spec";
export { REVENUE_LEAK_DETECTION, isRevenueLeakDetectionComplete } from "./optimization.leak-detection.spec";

export {
  buildRevenueOptimization,
  buildOptimizationManifest,
  assertRevenueOptimizationPass,
  formatOptimizationSummary,
  runRevenueOptimization,
} from "./optimization.builder";
