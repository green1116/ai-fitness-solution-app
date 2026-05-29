import type { OperationsCorrelation, OperationsImpactGraph } from "./types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../recovery/types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

export function buildOperationsCorrelationGraph(input: {
  deploymentId: string;
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
}): OperationsImpactGraph {
  const correlations: OperationsCorrelation[] = [];
  const nodes = new Set<string>();

  nodes.add("change-runtime");
  nodes.add("execution-runtime");
  nodes.add("incident-runtime");
  nodes.add("recovery-runtime");

  if (input.change.metrics.executed > 0 || input.change.plans.length > 0) {
    correlations.push({
      correlationId: `corr-change-execution-${input.deploymentId}`,
      relationship: "change_to_execution",
      fromId: input.change.registry.changeManagementId,
      toId: input.execution.registry.executionRuntimeId,
      confidence: 85,
      reason: "approved changes feed execution candidates",
    });
  }

  if (input.execution.metrics.failures > 0 || input.execution.status === "failed") {
    correlations.push({
      correlationId: `corr-execution-incident-${input.deploymentId}`,
      relationship: "execution_to_incident",
      fromId: input.execution.registry.executionRuntimeId,
      toId: input.incident.registry.incidentManagementId,
      confidence: 90,
      reason: "execution failures raised incidents",
    });
  }

  if (input.change.metrics.rejected > 0) {
    correlations.push({
      correlationId: `corr-change-incident-${input.deploymentId}`,
      relationship: "change_to_incident",
      fromId: input.change.registry.changeManagementId,
      toId: input.incident.registry.incidentManagementId,
      confidence: 70,
      reason: "rejected changes correlated with change incidents",
    });
  }

  if (input.incident.metrics.incidents > 0 && input.recovery.metrics.recoveries > 0) {
    correlations.push({
      correlationId: `corr-incident-recovery-${input.deploymentId}`,
      relationship: "incident_to_recovery",
      fromId: input.incident.registry.incidentManagementId,
      toId: input.recovery.registry.recoveryOrchestrationId,
      confidence: 88,
      reason: "incidents triggered recovery orchestration",
    });
  }

  for (const incident of input.incident.incidents) {
    nodes.add(incident.incidentId);
  }
  for (const request of input.recovery.requests) {
    if (request.sourceIncidentId) {
      correlations.push({
        correlationId: `corr-incident-recovery-${request.sourceIncidentId}`,
        relationship: "incident_to_recovery",
        fromId: request.sourceIncidentId,
        toId: request.requestId,
        confidence: 92,
        reason: "recovery caused by incident",
      });
      nodes.add(request.requestId);
    }
  }

  if (input.execution.status === "failed" && input.recovery.metrics.recoveries > 0) {
    correlations.push({
      correlationId: `corr-execution-recovery-${input.deploymentId}`,
      relationship: "execution_to_recovery",
      fromId: input.execution.registry.executionRuntimeId,
      toId: input.recovery.registry.recoveryOrchestrationId,
      confidence: 75,
      reason: "execution failure drove recovery path",
    });
  }

  return {
    graphId: `operations-impact-graph-${input.deploymentId}`,
    nodes: [...nodes],
    correlations,
  };
}
