import type { ApprovalDecision, ChangeAssessment, ChangeMetrics, ChangeReport, ChangeRequest } from "./types";
import { overallChangeRisk } from "./assessment";

export function buildChangeReport(input: {
  deploymentId: string;
  requests: ChangeRequest[];
  assessments: ChangeAssessment[];
  approvals: ApprovalDecision[];
  metrics: ChangeMetrics;
}): ChangeReport {
  const overallRisk = overallChangeRisk(input.assessments);
  const highRiskCount = input.assessments.filter(
    (a) => a.risk.risk === "elevated" || a.risk.risk === "critical",
  ).length;
  const criticalCount = input.assessments.filter((a) => a.risk.risk === "critical").length;

  const approvalRate =
    input.metrics.changes > 0 ? Math.round((input.metrics.approved / input.metrics.changes) * 100) : 0;
  const healthScore = Math.max(
    0,
    Math.min(100, approvalRate - highRiskCount * 8 - criticalCount * 15 + (input.metrics.executed > 0 ? 10 : 0)),
  );

  let status: ChangeReport["health"]["status"] = "healthy";
  if (healthScore < 50 || criticalCount > 0) status = "critical";
  else if (healthScore < 75 || highRiskCount > 2) status = "degraded";

  const summaryText = `changes=${input.metrics.changes} approved=${input.metrics.approved} executed=${input.metrics.executed} risk=${overallRisk} health=${status}`;

  return {
    reportId: `change-report-${input.deploymentId}`,
    summary: {
      summaryId: `change-summary-${input.deploymentId}`,
      text: summaryText,
    },
    health: {
      healthId: `change-health-${input.deploymentId}`,
      score: healthScore,
      status,
    },
    riskProfile: {
      profileId: `change-risk-profile-${input.deploymentId}`,
      overallRisk,
      highRiskCount,
      criticalCount,
    },
  };
}
