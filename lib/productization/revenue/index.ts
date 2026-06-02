/**
 * V8.7 Revenue Operations Platform — revenue entry
 */

export * from "./types";
export { buildPipelineStages, buildPipeline, getOpportunitiesByStage } from "./pipeline";
export { buildRevenueMetrics } from "./metrics";
export { buildRevenueForecast } from "./forecast";
export { buildRevenueReport, buildRevenueReports } from "./reporting";
export {
  buildRevenueSummary,
  buildRevenueOperationsResponse,
  validateRevenueOperations,
} from "./revenue";
