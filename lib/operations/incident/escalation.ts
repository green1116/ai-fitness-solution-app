import type {
  EscalationDecision,
  EscalationLevel,
  EscalationPolicy,
  Incident,
  IncidentAssessment,
  IncidentPriority,
  IncidentSeverity,
} from "./types";

export const DEFAULT_ESCALATION_POLICY: EscalationPolicy = {
  policyId: "incident-escalation-policy-default",
  name: "autonomous-incident-escalation-policy",
  autoEscalateAboveSeverity: "high",
  manualEscalateAboveSeverity: "medium",
  multiStageThreshold: "critical",
};

const SEVERITY_ORDER: IncidentSeverity[] = ["low", "medium", "high", "critical"];

function severityAtOrAbove(severity: IncidentSeverity, threshold: IncidentSeverity): boolean {
  return SEVERITY_ORDER.indexOf(severity) >= SEVERITY_ORDER.indexOf(threshold);
}

function resolveEscalationMode(
  incident: Incident,
  policy: EscalationPolicy,
): EscalationDecision["mode"] {
  if (incident.priority === policy.multiStageThreshold) return "multi-stage";
  if (severityAtOrAbove(incident.severity, policy.autoEscalateAboveSeverity)) return "auto";
  if (severityAtOrAbove(incident.severity, policy.manualEscalateAboveSeverity)) return "manual";
  return "auto";
}

function resolveEscalationLevel(incident: Incident, mode: EscalationDecision["mode"]): EscalationLevel {
  if (incident.severity === "critical" && mode === "multi-stage") return 4;
  if (incident.severity === "critical") return 3;
  if (incident.severity === "high") return 2;
  return 1;
}

export function evaluateIncidentEscalations(input: {
  deploymentId: string;
  incidents: Incident[];
  assessments: IncidentAssessment[];
  policy?: EscalationPolicy;
}): EscalationDecision[] {
  const policy = input.policy ?? DEFAULT_ESCALATION_POLICY;

  return input.incidents.map((incident) => {
    const assessment = input.assessments.find((a) => a.incidentId === incident.incidentId);
    const mode = resolveEscalationMode(incident, policy);
    const level = resolveEscalationLevel(incident, mode);

    let escalated =
      severityAtOrAbove(incident.severity, policy.manualEscalateAboveSeverity) ||
      (mode === "auto" && severityAtOrAbove(incident.severity, policy.autoEscalateAboveSeverity));

    if (assessment && !assessment.responseReady && incident.severity !== "low") {
      escalated = true;
    }

    return {
      decisionId: `escalation-${incident.incidentId}`,
      incidentId: incident.incidentId,
      mode,
      level,
      escalated,
      reason: escalated ? `escalated:${mode}:level${level}` : "no-escalation-required",
      timestamp: new Date().toISOString(),
    };
  });
}
