import type { EscalationDecision, Incident, IncidentMetrics, IncidentTrackingBundle, ResponsePlan } from "./types";

export function computeIncidentMetrics(input: {
  deploymentId: string;
  incidents: Incident[];
  escalations: EscalationDecision[];
  responsePlans: ResponsePlan[];
  tracking: IncidentTrackingBundle;
}): IncidentMetrics {
  const incidents = input.incidents.length;
  const escalated = input.escalations.filter((e) => e.escalated).length;
  const critical = input.incidents.filter((i) => i.severity === "critical").length;
  const resolved = input.tracking.outcome.resolved ? Math.max(1, incidents - critical) : 0;
  const open = incidents - resolved;
  const failed = input.incidents.filter((i) => i.incidentType === "execution").length;

  return {
    metricsId: `incident-metrics-${input.deploymentId}`,
    incidents,
    open,
    resolved,
    escalated,
    critical,
    failed,
  };
}
