import { buildRevenueForecast } from "./forecast";
import { buildRevenueMetrics } from "./metrics";
import { buildPipeline } from "./pipeline";
import { buildRevenueReport } from "./reporting";
import type { RevenueOperationsResponse, RevenueSummary } from "./types";
import { REVENUE_OPERATIONS_VERSION } from "./types";

export function buildRevenueSummary(input?: { deploymentId?: string }): RevenueSummary {
  const deploymentId = input?.deploymentId ?? "revenue-operations-default";
  const pipeline = buildPipeline({ deploymentId });
  const metrics = buildRevenueMetrics({ deploymentId });
  const wonCount = pipeline.filter((o) => o.stage === "won").length;
  const lostCount = pipeline.filter((o) => o.stage === "lost").length;
  const openPipelineValue = pipeline
    .filter((o) => !["won", "lost"].includes(o.stage))
    .reduce((sum, o) => sum + o.value, 0);

  return {
    summaryId: `revenue-summary-${deploymentId}`,
    version: REVENUE_OPERATIONS_VERSION,
    totalOpportunities: pipeline.length,
    wonCount,
    lostCount,
    openPipelineValue,
    metrics,
    summary: `revenue-summary opportunities=${pipeline.length} won=${wonCount} lost=${lostCount} openPipeline=${openPipelineValue} arr=${metrics.arr}`,
  };
}

export function buildRevenueOperationsResponse(input?: {
  deploymentId?: string;
}): RevenueOperationsResponse {
  const deploymentId = input?.deploymentId ?? "revenue-operations-default";
  return {
    version: REVENUE_OPERATIONS_VERSION,
    pipeline: buildPipeline({ deploymentId }),
    metrics: buildRevenueMetrics({ deploymentId }),
    forecast: buildRevenueForecast({ deploymentId }),
    report: buildRevenueReport({ deploymentId, period: "quarterly" }),
    summary: buildRevenueSummary({ deploymentId }),
  };
}

export function validateRevenueOperations(input?: { deploymentId?: string }): {
  pipelineValid: boolean;
  metricsValid: boolean;
  forecastValid: boolean;
  reportingValid: boolean;
  summaryValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "revenue-operations-default";
  const response = buildRevenueOperationsResponse({ deploymentId });
  const stages = new Set(["lead", "qualified", "proposal", "trial", "negotiation", "won", "lost"]);

  const pipelineValid =
    response.pipeline.length > 0 &&
    response.pipeline.every((o) => stages.has(o.stage) && o.value >= 0);

  const metricsValid =
    response.metrics.pipelineValue >= 0 &&
    response.metrics.forecastRevenue >= 0 &&
    response.metrics.closedRevenue >= 0 &&
    response.metrics.expansionRevenue >= 0 &&
    response.metrics.renewalRevenue >= 0 &&
    response.metrics.arr >= 0 &&
    response.metrics.mrr >= 0;

  const forecastValid =
    response.forecast.bestCase >= response.forecast.expectedCase &&
    response.forecast.expectedCase >= response.forecast.worstCase;

  const reportingValid =
    response.report.period === "quarterly" &&
    response.report.pipelineValue >= 0 &&
    response.report.closedRevenue >= 0;

  const summaryValid =
    response.summary.summaryId.length > 0 &&
    response.summary.totalOpportunities === response.pipeline.length &&
    response.summary.metrics.metricsId === response.metrics.metricsId;

  return {
    pipelineValid,
    metricsValid,
    forecastValid,
    reportingValid,
    summaryValid,
  };
}
