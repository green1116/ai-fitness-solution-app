/**
 * V64 P3 — Revenue Optimization System public API
 */

export type {
  RevenueMetrics,
  RevenueThresholds,
  RevenueSegment,
  RevenueLoopResult,
  PricingRecommendation,
  UpsellTrigger,
} from "./revenue.types";

export { computeRevenueThresholds } from "./revenue.types";
export { aggregateRevenueMetrics } from "./core/revenue.context";

export { analyzeRevenueStructure } from "./segmentation/revenue.segmenter";
export { segmentHighValueUsers } from "./segmentation/user.segment.engine";

export { optimizePricingStrategy, optimizeSubscriptionPlan } from "./pricing/pricing.optimizer";
export { runDynamicPricingEngine } from "./pricing/dynamic.pricing.engine";
export { buildRevenuePricingStrategy } from "./pricing/pricing.strategy";

export { analyzeARPU } from "./arpu/arpu.analyzer";
export { increaseARPU } from "./arpu/arpu.optimizer";

export { predictLTV } from "./ltv/ltv.predictor";
export { optimizeLTV } from "./ltv/ltv.optimizer";

export { triggerUpsell, triggerUpsellFlow, fireUpsellImpression } from "./upsell/upsell.engine";
export { triggerCrossSell } from "./upsell/cross.sell.engine";
export { recordUpgradeEvent, getUpgradeEventsSnapshot, clearUpgradeStoreForTests } from "./upsell/upgrade.tracker";

export { runRevenueEngine, autoImproveRevenueLoop } from "./core/revenue.engine";
