import { buildRevenueMetrics } from "./metrics";
import type { RevenueForecast } from "./types";

export function buildRevenueForecast(input?: { deploymentId?: string }): RevenueForecast {
  const deploymentId = input?.deploymentId ?? "revenue-operations-default";
  const metrics = buildRevenueMetrics({ deploymentId });
  const expectedCase = metrics.forecastRevenue;
  const bestCase = Math.round(expectedCase * 1.25);
  const worstCase = Math.round(expectedCase * 0.72);

  return {
    forecastId: `revenue-forecast-${deploymentId}`,
    bestCase,
    expectedCase,
    worstCase,
    currency: "CNY",
    summary: `revenue-forecast best=${bestCase} expected=${expectedCase} worst=${worstCase} currency=CNY`,
  };
}
