/**
 * V3.7-H1 Production Hardening — runtime incident taxonomy
 */

export const INCIDENT_TAXONOMY_VERSION = "3.7-h1-incident-1" as const;

export type IncidentSeverity =
  | "fatal"
  | "degraded"
  | "recoverable"
  | "warning"
  | "informational";

export type IncidentOperationalImpact = "block" | "degrade" | "recover" | "warn" | "info";

export type IncidentClass = {
  severity: IncidentSeverity;
  code: string;
  label: string;
  operationalImpact: IncidentOperationalImpact;
  description: string;
};

export const INCIDENT_SEVERITY_ORDER: readonly IncidentSeverity[] = [
  "fatal",
  "degraded",
  "recoverable",
  "warning",
  "informational",
] as const;

export const INCIDENT_CLASSES: readonly IncidentClass[] = [
  {
    severity: "fatal",
    code: "INC-FATAL",
    label: "Fatal",
    operationalImpact: "block",
    description: "Production release must halt; runtime or build integrity compromised.",
  },
  {
    severity: "degraded",
    code: "INC-DEGRADED",
    label: "Degraded",
    operationalImpact: "degrade",
    description: "Service continues with reduced confidence or partial runtime failure.",
  },
  {
    severity: "recoverable",
    code: "INC-RECOVERABLE",
    label: "Recoverable",
    operationalImpact: "recover",
    description: "Automated or operational recovery expected without full redeploy.",
  },
  {
    severity: "warning",
    code: "INC-WARNING",
    label: "Warning",
    operationalImpact: "warn",
    description: "Non-blocking anomaly requiring monitoring or scheduled remediation.",
  },
  {
    severity: "informational",
    code: "INC-INFO",
    label: "Informational",
    operationalImpact: "info",
    description: "Expected operational signal with no release impact.",
  },
] as const;

export type ClassifiedIncident = {
  severity: IncidentSeverity;
  code: string;
  domain: string;
  detail: string;
  operationalImpact: IncidentOperationalImpact;
  label: string;
};

export function resolveIncidentClass(severity: IncidentSeverity): IncidentClass {
  const found = INCIDENT_CLASSES.find((c) => c.severity === severity);
  if (!found) {
    return INCIDENT_CLASSES[INCIDENT_CLASSES.length - 1];
  }
  return found;
}

export function classifyIncident(input: {
  severity: IncidentSeverity;
  domain: string;
  detail: string;
}): ClassifiedIncident {
  const incidentClass = resolveIncidentClass(input.severity);
  return {
    severity: input.severity,
    code: incidentClass.code,
    domain: input.domain,
    detail: input.detail,
    operationalImpact: incidentClass.operationalImpact,
    label: incidentClass.label,
  };
}

export function formatIncidentTaxonomySummary(): string {
  return INCIDENT_CLASSES.map((c) => `${c.severity}=${c.code}`).join(" ");
}
