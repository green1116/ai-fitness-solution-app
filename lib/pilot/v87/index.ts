/**
 * V87 — Revenue ops & forecast control
 */

export {
  V87_REVENUE_OPS_VERSION,
  type RevenueForecastSummary,
  type RevenueOpsActionEntry,
  type RevenueOpsActionType,
  type RevenueOpsDashboard,
  type RevenueOpsDetail,
  type RevenueOpsRecord,
  type RevenueOpsStatus,
  type RevenueOpsOutcome,
  type RevenueQueueCategory,
  type RevenueQueueItem,
} from "./revenue-ops/revenue-ops.types";

export {
  clearRevenueOpsStoreForTests,
  getRevenueOpsRecord,
  getOrCreateRevenueOpsRecord,
  listRevenueOpsActions,
  listRevenueOpsRecordsForOrg,
} from "./revenue-ops/revenue-ops.store";

export {
  buildRevenueForecastSummary,
  computeWeightedValue,
  deriveExpectedRenewalValue,
  resolveExpectedRenewalValue,
} from "./revenue-ops/revenue-forecast.service";

export {
  buildRevenuePipeline,
  buildRevenueQueueItem,
  classifyRevenueQueue,
} from "./revenue-ops/revenue-pipeline.service";

export {
  assignRevenueOwner,
  escalateRevenueCase,
  markRevenueChurned,
  markRevenueRenewed,
  markRevenueSaved,
  scheduleRevenueFollowUp,
} from "./revenue-ops/revenue-control.service";

export {
  buildRevenueOpsDashboard,
  buildRevenueOpsDetail,
} from "./revenue-ops/revenue-dashboard.service";
