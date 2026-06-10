import { runChurnRuntime } from "../churn/runtime";
import { runConversionRuntime } from "../conversion/runtime";
import { runCustomerRuntime } from "../customer/runtime";
import { runLeadRuntime } from "../lead/runtime";
import { runOpportunityRuntime } from "../opportunity/runtime";
import { runRenewalRuntime } from "../renewal/runtime";
import { runRevenueAnalyticsRuntime } from "../revenue-analytics/runtime";
import { runTrialOperationsRuntime } from "../trial/runtime";

export function buildRevenueOpsDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  pipelineHealth: number;
  conversionHealth: number;
  renewalHealth: number;
  retentionHealth: number;
  revenueHealth: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";

  const lead = runLeadRuntime({ deploymentId });
  const opportunity = runOpportunityRuntime({ deploymentId });
  const customer = runCustomerRuntime({ deploymentId });
  const trial = runTrialOperationsRuntime({ deploymentId });
  const conversion = runConversionRuntime({ deploymentId });
  const renewal = runRenewalRuntime({ deploymentId });
  const churn = runChurnRuntime({ deploymentId });
  const analytics = runRevenueAnalyticsRuntime({ deploymentId });

  const qualifiedLeads = lead.payload.leads.filter((l) => l.status === "qualified" || l.status === "converted").length;
  const pipelineHealth = Math.round(
    ((qualifiedLeads / lead.payload.leadCount) * 50 +
      (opportunity.payload.opportunities.filter((o) => o.pipelineStage !== "lost").length /
        opportunity.payload.opportunities.length) *
        50),
  );

  const conversionHealth = Math.round(conversion.payload.overallConversionRate * 100);
  const renewalHealth = renewal.payload.renewalReadiness;
  const retentionHealth = Math.round(churn.payload.retentionRate * 100);
  const revenueHealth = Math.min(100, Math.round(analytics.payload.snapshot.revenueGrowthPercent * 8));

  void customer;
  void trial;

  return {
    pipelineHealth,
    conversionHealth,
    renewalHealth,
    retentionHealth,
    revenueHealth,
    summary: `revenue-ops-dashboard pipeline=${pipelineHealth}% conversion=${conversionHealth}% renewal=${renewalHealth}% retention=${retentionHealth}% revenue=${revenueHealth}%`,
  };
}
