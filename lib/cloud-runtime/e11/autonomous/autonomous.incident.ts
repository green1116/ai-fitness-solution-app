/**
 * E11-P6 — Incident Workflow
 */

import { INCIDENT_SEVERITIES, INCIDENT_STATUSES } from "./autonomous.constants";
import type {
  AutonomousIncident,
  IncidentSeverity,
  IncidentStatus,
  OpenIncidentInput,
} from "./autonomous.types";

const incidents = new Map<string, AutonomousIncident>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIncident(incident: AutonomousIncident): AutonomousIncident {
  return {
    ...incident,
    operationIds: [...incident.operationIds],
    metadata: { ...incident.metadata },
  };
}

export function openIncident(input: OpenIncidentInput): AutonomousIncident {
  const title = input.title.trim();
  if (!title) throw new Error("incident.title is required");

  const severity = input.severity ?? "MEDIUM";
  if (!(INCIDENT_SEVERITIES as readonly string[]).includes(severity)) {
    throw new Error(`invalid incident severity: ${severity}`);
  }

  const id = input.id?.trim() || createId("inc");
  if (incidents.has(id)) throw new Error(`incident already exists: ${id}`);

  const incident: AutonomousIncident = {
    id,
    title,
    severity,
    status: "OPEN",
    anomalyId: input.anomalyId?.trim() || undefined,
    runtimeId: input.runtimeId?.trim() || undefined,
    tenantId: input.tenantId?.trim() || undefined,
    operationIds: [],
    metadata: { ...(input.metadata ?? {}) },
    openedAt: nowIso(),
  };
  incidents.set(id, incident);
  return cloneIncident(incident);
}

export function getIncident(id: string): AutonomousIncident | undefined {
  const incident = incidents.get(id.trim());
  return incident ? cloneIncident(incident) : undefined;
}

export function listIncidents(filter?: {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  runtimeId?: string;
  tenantId?: string;
}): AutonomousIncident[] {
  let result = [...incidents.values()];
  if (filter?.status) result = result.filter((i) => i.status === filter.status);
  if (filter?.severity) {
    result = result.filter((i) => i.severity === filter.severity);
  }
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((i) => i.runtimeId === rid);
  }
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((i) => i.tenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIncident);
}

export function setIncidentStatus(
  id: string,
  status: IncidentStatus,
): AutonomousIncident {
  const incident = incidents.get(id.trim());
  if (!incident) throw new Error(`incident not found: ${id}`);
  if (!(INCIDENT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid incident status: ${status}`);
  }
  incident.status = status;
  if (status === "RESOLVED" || status === "CLOSED") {
    incident.resolvedAt = nowIso();
  }
  incidents.set(incident.id, incident);
  return cloneIncident(incident);
}

export function attachOperationToIncident(
  incidentId: string,
  operationId: string,
): AutonomousIncident {
  const incident = incidents.get(incidentId.trim());
  if (!incident) throw new Error(`incident not found: ${incidentId}`);
  const oid = operationId.trim();
  if (!incident.operationIds.includes(oid)) {
    incident.operationIds = [...incident.operationIds, oid];
  }
  incidents.set(incident.id, incident);
  return cloneIncident(incident);
}

export function clearIncidents(): void {
  incidents.clear();
}
