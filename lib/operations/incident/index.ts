export * from "./types";
export * from "./classification";
export * from "./assessment";
export * from "./escalation";
export * from "./workflow";
export * from "./tracking";
export * from "./metrics";
export * from "./report";

import {
  AUTONOMOUS_INCIDENT_MANAGEMENT_RUNTIME_VERSION,
  type AutonomousIncidentManagementRuntimeInput,
  type AutonomousIncidentManagementRuntimeResult,
  type IncidentLifecyclePhase,
  type IncidentStatus,
} from "./types";
import { discoverIncidents, classifyIncidents } from "./classification";
import { assessIncidents } from "./assessment";
import { evaluateIncidentEscalations } from "./escalation";
import { buildIncidentResponsePlans, resolveIncidentStatus } from "./workflow";
import { buildIncidentTrackingBundle } from "./tracking";
import { computeIncidentMetrics } from "./metrics";
import { buildIncidentReport } from "./report";

const LIFECYCLE_PHASES: IncidentLifecyclePhase[] = [
  "discover",
  "classify",
  "assess",
  "escalate",
  "orchestrate",
  "track",
  "close",
  "audit",
];

export function buildAutonomousIncidentManagementRuntime(
  input: AutonomousIncidentManagementRuntimeInput,
): AutonomousIncidentManagementRuntimeResult {
  const incidents = discoverIncidents({
    deploymentId: input.deploymentId,
    intelligence: input.intelligence,
    execution: input.execution,
    change: input.change,
  });

  const classifications = classifyIncidents({
    deploymentId: input.deploymentId,
    incidents,
  });

  const assessments = assessIncidents({
    deploymentId: input.deploymentId,
    incidents,
    intelligence: input.intelligence,
  });

  const escalations = evaluateIncidentEscalations({
    deploymentId: input.deploymentId,
    incidents,
    assessments,
  });

  const responsePlans = buildIncidentResponsePlans({
    deploymentId: input.deploymentId,
    incidents,
    escalations,
    intelligence: input.intelligence,
  });

  const tracking = buildIncidentTrackingBundle({
    deploymentId: input.deploymentId,
    incidents,
    responsePlans,
    escalations,
    lifecyclePhases: LIFECYCLE_PHASES,
    execution: input.execution,
  });

  const metrics = computeIncidentMetrics({
    deploymentId: input.deploymentId,
    incidents,
    escalations,
    responsePlans,
    tracking,
  });

  const report = buildIncidentReport({
    deploymentId: input.deploymentId,
    incidents,
    assessments,
    escalations,
    metrics,
  });

  const lifecycleClosed = tracking.outcome.resolved || metrics.open === 0;

  const flags = {
    classification: classifications.length > 0,
    assessment: assessments.length > 0,
    escalation: escalations.length > 0,
    workflow: responsePlans.length >= 0,
    tracking: tracking.timelines.length > 0 && tracking.trace.events.length > 0,
    metrics: metrics.incidents >= 0,
    reporting: report.summary.text.length > 0,
  };

  const status = resolveIncidentStatus({
    incidents,
    responsePlans,
    executionStatus: input.execution?.status,
  });

  const incidentManagementId = `autonomous-incident-management-${input.deploymentId}`;
  const traceId = `autonomous-incident-management-trace-${input.deploymentId}`;

  return {
    version: AUTONOMOUS_INCIDENT_MANAGEMENT_RUNTIME_VERSION,
    registry: { incidentManagementId, incidentCount: incidents.length },
    lifecycle: {
      lifecycleId: `incident-lifecycle-${input.deploymentId}`,
      phases: LIFECYCLE_PHASES,
      currentPhase: lifecycleClosed ? "audit" : responsePlans.length > 0 ? "orchestrate" : "escalate",
      closed: lifecycleClosed,
    },
    incidents,
    classifications,
    assessments,
    escalations,
    responsePlans,
    tracking,
    metrics,
    report,
    flags,
    summary: {
      summaryId: `incident-management-summary-${Date.now()}`,
      text: `${report.summary.text} lifecycle=${lifecycleClosed} plans=${responsePlans.length} status=${status}`,
      traceId,
    },
    status,
  };
}

export { AUTONOMOUS_INCIDENT_MANAGEMENT_RUNTIME_VERSION };
