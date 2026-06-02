import { buildRevenueMetrics } from "./metrics";
import type { ReportingPeriod, RevenueReport } from "./types";

function scaleForPeriod(metrics: ReturnType<typeof buildRevenueMetrics>, period: ReportingPeriod): {
  pipelineValue: number;
  closedRevenue: number;
  forecastRevenue: number;
  arr: number;
  mrr: number;
} {
  const multiplier = period === "monthly" ? 1 / 12 : period === "quarterly" ? 1 / 4 : 1;
  return {
    pipelineValue: Math.round(metrics.pipelineValue * multiplier),
    closedRevenue: Math.round(metrics.closedRevenue * multiplier),
    forecastRevenue: Math.round(metrics.forecastRevenue * multiplier),
    arr: metrics.arr,
    mrr: metrics.mrr,
  };
}

export function buildRevenueReport(input?: {
  deploymentId?: string;
  period?: ReportingPeriod;
}): RevenueReport {
  const deploymentId = input?.deploymentId ?? "revenue-operations-default";
  const period = input?.period ?? "quarterly";
  const metrics = buildRevenueMetrics({ deploymentId });
  const scaled = scaleForPeriod(metrics, period);

  return {
    reportId: `revenue-report-${period}-${deploymentId}`,
    period,
    pipelineValue: scaled.pipelineValue,
    closedRevenue: scaled.closedRevenue,
    forecastRevenue: scaled.forecastRevenue,
    arr: scaled.arr,
    mrr: scaled.mrr,
    summary: `revenue-report period=${period} pipeline=${scaled.pipelineValue} closed=${scaled.closedRevenue} forecast=${scaled.forecastRevenue}`,
  };
}

export function buildRevenueReports(input?: { deploymentId?: string }): RevenueReport[] {
  return (["monthly", "quarterly", "annual"] as const).map((period) =>
    buildRevenueReport({ deploymentId: input?.deploymentId, period }),
  );
}
