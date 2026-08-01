/**
 * PL-3 — Incident Management types.
 * In-memory incident core only — no IO / persistence / providers.
 */

export const INCIDENT_MANAGEMENT_ID = "pl-3-incident-management-v1" as const;

export const INCIDENT_SEVERITIES = [
  "sev1",
  "sev2",
  "sev3",
  "sev4",
] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_RESOLUTION_STATES = [
  "open",
  "acknowledged",
  "investigating",
  "escalated",
  "resolved",
  "closed",
] as const;

export type IncidentResolutionState =
  (typeof INCIDENT_RESOLUTION_STATES)[number];

/** Escalation ladder levels (0 = none). */
export const INCIDENT_ESCALATION_LEVELS = [0, 1, 2, 3] as const;

export type IncidentEscalationLevel =
  (typeof INCIDENT_ESCALATION_LEVELS)[number];

/** Deterministic incident policy. */
export type IncidentPolicy = Readonly<{
  /** Severities that auto-escalate on open (to level 1). */
  autoEscalateSeverities: readonly IncidentSeverity[];
  /** Maximum open incidents retained (oldest closed when exceeded). */
  maxOpenIncidents: number;
  /** Maximum escalation level allowed. */
  maxEscalationLevel: IncidentEscalationLevel;
  /** Whether resolved incidents may reopen. */
  allowReopen: boolean;
}>;

export const DEFAULT_INCIDENT_POLICY: IncidentPolicy = {
  autoEscalateSeverities: ["sev1"],
  maxOpenIncidents: 100,
  maxEscalationLevel: 3,
  allowReopen: true,
};

export type IncidentRecord = Readonly<{
  incidentId: string;
  title: string;
  severity: IncidentSeverity;
  state: IncidentResolutionState;
  escalationLevel: IncidentEscalationLevel;
  /** Optional opaque service ref (string only — no monitoring coupling). */
  serviceId?: string;
  openedAt: number;
  updatedAt: number;
  acknowledgedAt?: number;
  escalatedAt?: number;
  resolvedAt?: number;
  closedAt?: number;
}>;

export type OpenIncidentInput = Readonly<{
  title: string;
  severity: IncidentSeverity;
  serviceId?: string;
  /** Optional stable id — when omitted, manager assigns sequential id. */
  incidentId?: string;
}>;

export type AcknowledgeIncidentInput = Readonly<{
  incidentId: string;
}>;

export type InvestigateIncidentInput = Readonly<{
  incidentId: string;
}>;

export type EscalateIncidentInput = Readonly<{
  incidentId: string;
  /** Target level; defaults to current + 1. */
  toLevel?: IncidentEscalationLevel;
}>;

export type ResolveIncidentInput = Readonly<{
  incidentId: string;
}>;

export type CloseIncidentInput = Readonly<{
  incidentId: string;
}>;

export type ReopenIncidentInput = Readonly<{
  incidentId: string;
}>;

export type SetIncidentSeverityInput = Readonly<{
  incidentId: string;
  severity: IncidentSeverity;
}>;

export type IncidentSnapshot = Readonly<{
  at: number;
  incidentCount: number;
  openCount: number;
  acknowledgedCount: number;
  investigatingCount: number;
  escalatedCount: number;
  resolvedCount: number;
  closedCount: number;
  policy: IncidentPolicy;
  incidents: readonly IncidentRecord[];
}>;

export type IncidentManagerStatus = "idle" | "running" | "stopped";

export type IncidentManagerSnapshot = Readonly<{
  managerId: string;
  layerId: typeof INCIDENT_MANAGEMENT_ID;
  status: IncidentManagerStatus;
  clock: number;
  incidentCount: number;
  openCount: number;
}>;
