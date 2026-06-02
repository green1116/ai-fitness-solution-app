import type {
  OperationsCommand,
  OperationsAction,
  OperationsInsight,
  OperationsRecommendation,
  OperationsSnapshot,
  OperationsStatus,
  OperationsSummary,
  OperationsImpactGraph,
  OperationsHealth,
  OperationsRiskProfile,
  OperationsDashboardModel,
} from "./types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../recovery/types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

export function buildOperationsSummary(input: {
  deploymentId: string;
  status: OperationsStatus;
  health: OperationsHealth;
  risk: OperationsRiskProfile;
  dashboard: OperationsDashboardModel;
  correlation: OperationsImpactGraph;
}): OperationsSummary {
  return {
    summaryId: `operations-summary-${input.deploymentId}`,
    text: `status=${input.status} health=${input.health.score} risk=${input.risk.level} changes=${input.dashboard.change.changes} incidents=${input.dashboard.incident.incidents} recoveries=${input.dashboard.recovery.recoveries} correlations=${input.correlation.correlations.length}`,
  };
}

export function buildOperationsSnapshot(input: {
  deploymentId: string;
  status: OperationsStatus;
  health: OperationsHealth;
  risk: OperationsRiskProfile;
}): OperationsSnapshot {
  return {
    snapshotId: `operations-snapshot-${input.deploymentId}`,
    capturedAt: new Date().toISOString(),
    status: input.status,
    healthScore: input.health.score,
    riskLevel: input.risk.level,
  };
}

export function deriveOperationsInsights(input: {
  deploymentId: string;
  health: OperationsHealth;
  risk: OperationsRiskProfile;
  correlation: OperationsImpactGraph;
  execution: OperationalAutonomousExecutionRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
}): OperationsInsight[] {
  const insights: OperationsInsight[] = [
    {
      insightId: `insight-health-${input.deploymentId}`,
      category: "health",
      message: `platform health=${input.health.status} score=${input.health.score}`,
      priority: input.health.status === "critical" ? "high" : "medium",
    },
    {
      insightId: `insight-risk-${input.deploymentId}`,
      category: "risk",
      message: `risk level=${input.risk.level} signals=${input.risk.signals.length}`,
      priority: input.risk.level === "critical" ? "high" : "low",
    },
    {
      insightId: `insight-correlation-${input.deploymentId}`,
      category: "correlation",
      message: `correlations=${input.correlation.correlations.length} nodes=${input.correlation.nodes.length}`,
      priority: "medium",
    },
  ];

  if (input.execution.metrics.failures > 0) {
    insights.push({
      insightId: `insight-throughput-${input.deploymentId}`,
      category: "throughput",
      message: `execution failures=${input.execution.metrics.failures}`,
      priority: "high",
    });
  }

  if (input.incident.metrics.escalated > 0) {
    insights.push({
      insightId: `insight-incident-escalation-${input.deploymentId}`,
      category: "risk",
      message: `escalated incidents=${input.incident.metrics.escalated}`,
      priority: "critical",
    });
  }

  return insights;
}

export function buildOperationsCommands(input: {
  deploymentId: string;
  recommendations: OperationsRecommendation[];
}): { commands: OperationsCommand[]; actions: OperationsAction[]; recommendations: OperationsRecommendation[] } {
  const commands: OperationsCommand[] = [
    { commandId: `cmd-execution-${input.deploymentId}`, name: "run-execution", target: "execution", enabled: true },
    { commandId: `cmd-change-${input.deploymentId}`, name: "approve-change", target: "change", enabled: true },
    { commandId: `cmd-incident-${input.deploymentId}`, name: "escalate-incident", target: "incident", enabled: true },
    { commandId: `cmd-recovery-${input.deploymentId}`, name: "orchestrate-recovery", target: "recovery", enabled: true },
    { commandId: `cmd-platform-${input.deploymentId}`, name: "refresh-operations-center", target: "platform", enabled: true },
  ];

  const actions: OperationsAction[] = commands.map((command) => ({
    actionId: `action-${command.commandId}`,
    commandId: command.commandId,
    name: command.name,
    status: command.enabled ? "ready" : "blocked",
  }));

  const recommendations: OperationsRecommendation[] =
    input.recommendations.length > 0
      ? input.recommendations
      : [
          {
            recommendationId: `rec-refresh-${input.deploymentId}`,
            action: "refresh-operations-dashboard",
            rationale: "reconcile execution, change, incident, and recovery state",
            priority: "medium",
          },
          {
            recommendationId: `rec-correlate-${input.deploymentId}`,
            action: "review-correlation-graph",
            rationale: "validate change→execution→incident→recovery chain",
            priority: "high",
          },
        ];

  return { commands, actions, recommendations };
}

export function buildDefaultRecommendations(input: {
  deploymentId: string;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
}): OperationsRecommendation[] {
  const recommendations: OperationsRecommendation[] = [];

  if (input.change.metrics.rejected > 0) {
    recommendations.push({
      recommendationId: `rec-change-review-${input.deploymentId}`,
      action: "review-rejected-changes",
      rationale: "reduce change-driven incidents",
      priority: "high",
    });
  }
  if (input.incident.metrics.open > 0) {
    recommendations.push({
      recommendationId: `rec-incident-triage-${input.deploymentId}`,
      action: "triage-open-incidents",
      rationale: "prioritize incident response",
      priority: "critical",
    });
  }
  if (input.recovery.metrics.recoveries > 0 && input.recovery.metrics.verified < input.recovery.metrics.recoveries) {
    recommendations.push({
      recommendationId: `rec-recovery-verify-${input.deploymentId}`,
      action: "verify-active-recoveries",
      rationale: "close recovery loop with verification",
      priority: "high",
    });
  }

  return recommendations;
}
