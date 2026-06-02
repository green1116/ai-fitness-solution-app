import type {
  EscalationDecision,
  Incident,
  IncidentAssessment,
  IncidentMetrics,
  IncidentReport,
} from "./types";
import { overallIncidentSeverity } from "./assessment";

export function buildIncidentReport(input: {
  deploymentId: string;
  incidents: Incident[];
  assessments: IncidentAssessment[];
  escalations: EscalationDecision[];
  metrics: IncidentMetrics;
}): IncidentReport {
  const overallSeverity = overallIncidentSeverity(input.assessments);
  const criticalCount = input.incidents.filter((i) => i.severity === "critical").length;
  const highCount = input.incidents.filter((i) => i.severity === "high").length;

  const resolutionRate =
    input.metrics.incidents > 0 ? Math.round((input.metrics.resolved / input.metrics.incidents) * 100) : 100;
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      resolutionRate - criticalCount * 12 - highCount * 6 - input.metrics.open * 4 + (input.metrics.escalated > 0 ? -5 : 5),
    ),
  );

  let status: IncidentReport["health"]["status"] = "healthy";
  if (healthScore < 50 || criticalCount > 1) status = "critical";
  else if (healthScore < 75 || input.metrics.open > 2) status = "degraded";

  const summaryText = `incidents=${input.metrics.incidents} open=${input.metrics.open} escalated=${input.metrics.escalated} critical=${input.metrics.critical} severity=${overallSeverity} health=${status}`;

  return {
    reportId: `incident-report-${input.deploymentId}`,
    summary: {
      summaryId: `incident-summary-${input.deploymentId}`,
      text: summaryText,
    },
    health: {
      healthId: `incident-health-${input.deploymentId}`,
      score: healthScore,
      status,
    },
    riskProfile: {
      profileId: `incident-risk-profile-${input.deploymentId}`,
      overallSeverity,
      criticalCount,
      highCount,
    },
  };
}
