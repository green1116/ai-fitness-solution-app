import type { SuccessMetric } from "./types";

export function buildSuccessMetrics(input?: {
  deploymentId?: string;
}): SuccessMetric {
  const deploymentId = input?.deploymentId ?? "customer-delivery-default";
  return {
    metricId: `delivery-metrics-${deploymentId}`,
    deliveryCompletionRate: 72,
    customerAdoption: 68,
    workspaceUtilization: 74,
    proposalAcceptance: 81,
    renewalReadiness: 63,
  };
}
