import type {
  ChangeOverview,
  ExecutionOverview,
  IncidentOverview,
  OperationsDashboardModel,
  RecoveryOverview,
} from "./types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../recovery/types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

export function buildOperationsDashboard(input: {
  deploymentId: string;
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
}): OperationsDashboardModel {
  const execution: ExecutionOverview = {
    overviewId: `execution-overview-${input.deploymentId}`,
    runtimeId: input.execution.registry.executionRuntimeId,
    status: input.execution.status,
    candidates: input.execution.candidates.length,
    executions: input.execution.metrics.executions,
    successRate: input.execution.metrics.successRate,
    summary: input.execution.report.summary.text,
  };

  const change: ChangeOverview = {
    overviewId: `change-overview-${input.deploymentId}`,
    runtimeId: input.change.registry.changeManagementId,
    status: input.change.status,
    changes: input.change.metrics.changes,
    approved: input.change.metrics.approved,
    rejected: input.change.metrics.rejected,
    summary: input.change.report.summary.text,
  };

  const incident: IncidentOverview = {
    overviewId: `incident-overview-${input.deploymentId}`,
    runtimeId: input.incident.registry.incidentManagementId,
    status: input.incident.status,
    incidents: input.incident.metrics.incidents,
    open: input.incident.metrics.open,
    escalated: input.incident.metrics.escalated,
    summary: input.incident.report.summary.text,
  };

  const recovery: RecoveryOverview = {
    overviewId: `recovery-overview-${input.deploymentId}`,
    runtimeId: input.recovery.registry.recoveryOrchestrationId,
    status: input.recovery.status,
    recoveries: input.recovery.metrics.recoveries,
    successful: input.recovery.metrics.successful,
    verified: input.recovery.metrics.verified,
    summary: input.recovery.report.summary.text,
  };

  return {
    dashboardId: `operations-dashboard-${input.deploymentId}`,
    execution,
    change,
    incident,
    recovery,
  };
}
