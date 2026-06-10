import { runAdoptionRuntime } from "../adoption/runtime";
import { runExpansionRuntime } from "../expansion/runtime";
import { runCustomerHealthRuntime } from "../health/runtime";
import { runRenewalRiskRuntime } from "../renewal-risk/runtime";

export function buildCustomerSuccessDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  customerHealth: number;
  adoptionHealth: number;
  renewalHealth: number;
  expansionHealth: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";

  const health = runCustomerHealthRuntime({ deploymentId });
  const adoption = runAdoptionRuntime({ deploymentId });
  const renewal = runRenewalRiskRuntime({ deploymentId });
  const expansion = runExpansionRuntime({ deploymentId });

  const totalHealth = health.payload.customers.length;
  const customerHealth = Math.round(
    (health.payload.healthyCount / totalHealth) * 100,
  );

  const adoptionHealth = Math.round(adoption.payload.overallAdoptionRate * 100);

  const renewalHealth = Math.round(
    ((renewal.payload.lowRiskCount + renewal.payload.mediumRiskCount * 0.5) /
      renewal.payload.records.length) *
      100,
  );

  const expansionHealth = Math.min(
    100,
    expansion.payload.opportunities.length * 25,
  );

  return {
    customerHealth,
    adoptionHealth,
    renewalHealth,
    expansionHealth,
    summary: `customer-success-dashboard health=${customerHealth}% adoption=${adoptionHealth}% renewal=${renewalHealth}% expansion=${expansionHealth}%`,
  };
}
