/**
 * RSO-3 — Incident severity contract
 * Projection vocabulary for RuntimeIncident.
 */

export const INCIDENT_SEVERITIES = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_STATES = ["OBSERVED", "OPEN", "CLEARED"] as const;
export type IncidentState = (typeof INCIDENT_STATES)[number];

export const INCIDENT_SURFACE_STATUSES = [
  "CLEAR",
  "ACTIVE",
  "CRITICAL",
] as const;
export type IncidentSurfaceStatus =
  (typeof INCIDENT_SURFACE_STATUSES)[number];

/** Map monitoring signal level to incident severity. */
export function incidentSeverityFromSignalLevel(
  level: "INFO" | "WARN" | "CRITICAL",
): IncidentSeverity {
  if (level === "INFO") return "NONE";
  if (level === "WARN") return "MEDIUM";
  return "CRITICAL";
}

/** Map severity to incident state (no recovery — contract only). */
export function incidentStateFromSeverity(
  severity: IncidentSeverity,
): IncidentState {
  if (severity === "NONE" || severity === "LOW") return "OBSERVED";
  if (severity === "CRITICAL" || severity === "HIGH") return "OPEN";
  return "OPEN";
}

/** Aggregate incident severities into surface status. */
export function aggregateIncidentSurfaceStatus(
  severities: readonly IncidentSeverity[],
): IncidentSurfaceStatus {
  if (severities.length === 0) return "CLEAR";
  if (severities.some((s) => s === "CRITICAL" || s === "HIGH")) {
    return "CRITICAL";
  }
  if (severities.some((s) => s === "MEDIUM" || s === "LOW")) return "ACTIVE";
  return "CLEAR";
}
