import type { OperationsRiskProfile, RiskIndicator, RiskLevel, RiskSignal } from "./types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../recovery/types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

function levelFromScore(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function buildOperationsRiskProfile(input: {
  deploymentId: string;
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
}): OperationsRiskProfile {
  const signals: RiskSignal[] = [];

  if (input.execution.metrics.blocked > 0) {
    signals.push({
      signalId: `risk-execution-blocked-${input.deploymentId}`,
      source: "execution",
      message: `blocked=${input.execution.metrics.blocked}`,
      weight: 15,
    });
  }
  if (input.change.metrics.rejected > 0) {
    signals.push({
      signalId: `risk-change-rejected-${input.deploymentId}`,
      source: "change",
      message: `rejected=${input.change.metrics.rejected}`,
      weight: 12,
    });
  }
  if (input.incident.metrics.critical > 0) {
    signals.push({
      signalId: `risk-incident-critical-${input.deploymentId}`,
      source: "incident",
      message: `critical=${input.incident.metrics.critical}`,
      weight: 20,
    });
  }
  if (input.recovery.metrics.failed > 0) {
    signals.push({
      signalId: `risk-recovery-failed-${input.deploymentId}`,
      source: "recovery",
      message: `failed=${input.recovery.metrics.failed}`,
      weight: 18,
    });
  }

  const indicators: RiskIndicator[] = [
    {
      indicatorId: `risk-ind-execution-${input.deploymentId}`,
      domain: "execution",
      level: levelFromScore(100 - input.execution.report.health.score),
      score: 100 - input.execution.report.health.score,
    },
    {
      indicatorId: `risk-ind-change-${input.deploymentId}`,
      domain: "change",
      level: levelFromScore(100 - input.change.report.health.score),
      score: 100 - input.change.report.health.score,
    },
    {
      indicatorId: `risk-ind-incident-${input.deploymentId}`,
      domain: "incident",
      level: levelFromScore(100 - input.incident.report.health.score),
      score: 100 - input.incident.report.health.score,
    },
    {
      indicatorId: `risk-ind-recovery-${input.deploymentId}`,
      domain: "recovery",
      level: levelFromScore(100 - input.recovery.report.health.score),
      score: 100 - input.recovery.report.health.score,
    },
  ];

  const score = Math.min(
    100,
    Math.round(indicators.reduce((sum, i) => sum + i.score, 0) / indicators.length + signals.length * 3),
  );

  return {
    profileId: `operations-risk-profile-${input.deploymentId}`,
    level: levelFromScore(score),
    score,
    signals,
    indicators,
  };
}
