import type {
  RecoveryAssessment,
  RecoveryMetrics,
  RecoveryReport,
  RecoveryRequest,
} from "./types";
import { overallRecoverySeverity } from "./assessment";

export function buildRecoveryReport(input: {
  deploymentId: string;
  requests: RecoveryRequest[];
  assessments: RecoveryAssessment[];
  metrics: RecoveryMetrics;
}): RecoveryReport {
  const overallSeverity = overallRecoverySeverity(input.assessments);
  const criticalCount = input.requests.filter((r) => r.severity === "critical").length;
  const highRiskCount = input.requests.filter((r) => r.severity === "high").length;

  const successRate =
    input.metrics.recoveries > 0 ? Math.round((input.metrics.successful / input.metrics.recoveries) * 100) : 100;
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      successRate - criticalCount * 10 - highRiskCount * 5 + (input.metrics.verified > 0 ? 10 : 0),
    ),
  );

  let status: RecoveryReport["health"]["status"] = "healthy";
  if (healthScore < 50 || criticalCount > 1) status = "critical";
  else if (healthScore < 75 || input.metrics.failed > 0) status = "degraded";

  const summaryText = `recoveries=${input.metrics.recoveries} successful=${input.metrics.successful} verified=${input.metrics.verified} severity=${overallSeverity} health=${status}`;

  return {
    reportId: `recovery-report-${input.deploymentId}`,
    summary: {
      summaryId: `recovery-summary-${input.deploymentId}`,
      text: summaryText,
    },
    health: {
      healthId: `recovery-health-${input.deploymentId}`,
      score: healthScore,
      status,
    },
    riskProfile: {
      profileId: `recovery-risk-profile-${input.deploymentId}`,
      overallSeverity,
      highRiskCount,
      criticalCount,
    },
  };
}
