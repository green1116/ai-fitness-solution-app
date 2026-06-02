import type {
  HealthIndicator,
  HealthStatus,
  HealthTrend,
  OperationsHealth,
  OperationsStatus,
} from "./types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../recovery/types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

export function computeOperationsHealth(input: {
  deploymentId: string;
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
}): { health: OperationsHealth; trend: HealthTrend; compositeStatus: OperationsStatus } {
  const indicators: HealthIndicator[] = [
    {
      indicatorId: `health-execution-${input.deploymentId}`,
      domain: "execution",
      score: input.execution.report.health.score,
      status: input.execution.report.health.status,
      label: "execution-health",
    },
    {
      indicatorId: `health-change-${input.deploymentId}`,
      domain: "change",
      score: input.change.report.health.score,
      status: input.change.report.health.status,
      label: "change-health",
    },
    {
      indicatorId: `health-incident-${input.deploymentId}`,
      domain: "incident",
      score: input.incident.report.health.score,
      status: input.incident.report.health.status,
      label: "incident-health",
    },
    {
      indicatorId: `health-recovery-${input.deploymentId}`,
      domain: "recovery",
      score: input.recovery.report.health.score,
      status: input.recovery.report.health.status,
      label: "recovery-health",
    },
  ];

  const composite = Math.round(
    indicators.reduce((sum, indicator) => sum + indicator.score, 0) / indicators.length,
  );

  let status: HealthStatus = "healthy";
  if (composite < 50 || indicators.some((i) => i.status === "critical")) status = "critical";
  else if (composite < 75 || indicators.some((i) => i.status === "degraded")) status = "degraded";

  indicators.push({
    indicatorId: `health-platform-${input.deploymentId}`,
    domain: "platform",
    score: composite,
    status,
    label: "platform-health",
  });

  let trend: HealthTrend = "stable";
  if (input.incident.report.health.status === "critical" || input.change.report.health.status === "critical") {
    trend = "degrading";
  } else if (input.recovery.tracking.outcome.success) {
    trend = "improving";
  }

  let compositeStatus: OperationsStatus = "operational";
  if (status === "critical") compositeStatus = "critical";
  else if (input.recovery.status === "recovering" || input.recovery.status === "verifying") {
    compositeStatus = "recovering";
  } else if (status === "degraded") compositeStatus = "degraded";

  return {
    health: {
      healthId: `operations-health-${input.deploymentId}`,
      score: composite,
      status,
      indicators,
    },
    trend,
    compositeStatus,
  };
}
