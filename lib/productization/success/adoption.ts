import type { AdoptionMetrics } from "./types";

export function buildAdoptionMetrics(input?: { deploymentId?: string }): AdoptionMetrics {
  const deploymentId = input?.deploymentId ?? "customer-success-default";
  return {
    metricsId: `adoption-metrics-${deploymentId}`,
    workspaceUtilization: 74,
    activeUsers: 18,
    generatedPlans: 42,
    generatedBudgets: 28,
    proposalExports: 22,
    tenderExports: 14,
    summary: `adoption-metrics utilization=74% activeUsers=18 plans=42 budgets=28 proposals=22 tenders=14`,
  };
}
