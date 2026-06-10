import type { RevenueDashboardMetrics } from "./types";

export function buildRevenueDashboardMetrics(input?: {
  deploymentId?: string;
}): RevenueDashboardMetrics {
  const deploymentId = input?.deploymentId ?? "dashboard-default";

  const activeCustomers = 128;
  const mrr = 384200;
  const arr = mrr * 12;
  const trialStarts = 420;
  const trialConversions = 126;
  const trialConversionRate =
    trialStarts > 0
      ? Math.round((trialConversions / trialStarts) * 1000) / 10
      : 0;
  const revenueGrowthRate = 18.6;

  return {
    metricsId: `revenue-dashboard-metrics-${deploymentId}`,
    mrr,
    arr,
    activeCustomers,
    trialConversionRate,
    revenueGrowthRate,
    currency: "CNY",
  };
}
