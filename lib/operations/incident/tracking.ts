import type {
  EscalationDecision,
  Incident,
  IncidentLifecyclePhase,
  IncidentOutcome,
  IncidentTimeline,
  IncidentTrackingBundle,
  ResponsePlan,
} from "./types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

export function buildIncidentTrackingBundle(input: {
  deploymentId: string;
  incidents: Incident[];
  responsePlans: ResponsePlan[];
  escalations: EscalationDecision[];
  lifecyclePhases: IncidentLifecyclePhase[];
  execution?: OperationalAutonomousExecutionRuntimeResult;
}): IncidentTrackingBundle {
  const now = new Date().toISOString();
  const primaryIncident = input.incidents[0];
  const escalatedCount = input.escalations.filter((e) => e.escalated).length;
  const resolved =
    input.execution?.audit.outcome.success === true ||
    (input.responsePlans.length > 0 && input.execution?.status === "completed");

  const timelines: IncidentTimeline[] = input.incidents.map((incident) => ({
    timelineId: `timeline-${incident.incidentId}`,
    incidentId: incident.incidentId,
    entries: input.lifecyclePhases.map((phase) => ({
      entryId: `timeline-${phase}-${incident.incidentId}`,
      phase,
      detail: `${phase}-recorded`,
      timestamp: now,
    })),
  }));

  const traceEvents: { event: string; detail: string; timestamp: string }[] = input.lifecyclePhases.map(
    (phase) => ({
      event: phase,
      detail: `${phase}-tracked`,
      timestamp: now,
    }),
  );

  if (input.execution) {
    traceEvents.push({
      event: "execution-linked",
      detail: `engine=${input.execution.engine.engineId}`,
      timestamp: now,
    });
  }

  const outcome: IncidentOutcome = {
    outcomeId: `incident-outcome-${input.deploymentId}`,
    incidentId: primaryIncident?.incidentId ?? "none",
    resolved,
    escalated: escalatedCount > 0,
    message: `incidents=${input.incidents.length} escalated=${escalatedCount} plans=${input.responsePlans.length}`,
  };

  return {
    timelines,
    trace: {
      traceId: `incident-trace-${input.deploymentId}`,
      events: traceEvents,
    },
    evidence: {
      evidenceId: `incident-evidence-${input.deploymentId}`,
      incidentId: primaryIncident?.incidentId ?? "none",
      artifacts: [
        `incidents:${input.incidents.length}`,
        `escalations:${escalatedCount}`,
        `responsePlans:${input.responsePlans.length}`,
        input.execution ? `execution:${input.execution.registry.executionRuntimeId}` : "execution:none",
      ],
    },
    outcome,
  };
}
