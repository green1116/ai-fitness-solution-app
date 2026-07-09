/**
 * V80 POST-LAUNCH P3 — Revenue scaling entry (spec exports)
 */
export { V80_POSTLAUNCH_SCALING_VERSION, V80_POSTLAUNCH_SCALING_FREEZE_VERSION } from "./scaling.types";
export type {
  RevenueCompoundingLoop,
  ChannelScalingSystem,
  SalesAutomationStep,
  EnterpriseExpansionModel,
  ScalingManifest,
  RevenueScalingReport,
} from "./scaling.types";

export { REVENUE_COMPOUNDING_LOOPS, isRevenueCompoundingLoopsComplete } from "./scaling.compounding.spec";
export { CHANNEL_SCALING_SYSTEM, isChannelScalingSystemComplete } from "./scaling.channels.spec";
export { SALES_AUTOMATION_ENGINE, isSalesAutomationEngineComplete } from "./scaling.sales-automation.spec";
export { ENTERPRISE_EXPANSION_MODEL, isEnterpriseExpansionModelComplete } from "./scaling.enterprise-expansion.spec";

export {
  buildRevenueScaling,
  buildScalingManifest,
  assertRevenueScalingPass,
  formatScalingSummary,
  runRevenueScaling,
} from "./scaling.builder";
