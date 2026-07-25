/**
 * Product Operations — Incident registry
 */

import {
  OPS_INCIDENT_SEVERITIES,
  OPS_INCIDENT_STATUSES,
} from "../console/console.constants";
import { getOpsSurface } from "../surface/surface.registry";
import type {
  OpenOpsIncidentInput,
  OpsIncident,
  OpsIncidentSeverity,
  OpsIncidentStatus,
  UpdateOpsIncidentStatusInput,
} from "./incident.types";

const incidents = new Map<string, OpsIncident>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIncident(incident: OpsIncident): OpsIncident {
  return { ...incident, metadata: { ...incident.metadata } };
}

export function openOpsIncident(input: OpenOpsIncidentInput): OpsIncident {
  const surfaceId = input.surfaceId.trim();
  const title = input.title.trim();
  if (!surfaceId) throw new Error("incident.surfaceId is required");
  if (!title) throw new Error("incident.title is required");
  if (
    !(OPS_INCIDENT_SEVERITIES as readonly string[]).includes(input.severity)
  ) {
    throw new Error(`invalid incident severity: ${input.severity}`);
  }

  const surface = getOpsSurface(surfaceId);
  if (!surface) throw new Error(`surface not found: ${surfaceId}`);
  if (surface.status !== "ACTIVE") {
    throw new Error(`surface not active: ${surfaceId}`);
  }

  const id = input.id?.trim() || createId("opsinc");
  if (incidents.has(id)) throw new Error(`incident already exists: ${id}`);

  const now = nowIso();
  const incident: OpsIncident = {
    id,
    surfaceId,
    title,
    severity: input.severity,
    status: OPS_INCIDENT_STATUSES[0],
    detail: `severity=${input.severity} status=OPEN`,
    metadata: { ...(input.metadata ?? {}) },
    openedAt: now,
    updatedAt: now,
  };
  incidents.set(id, incident);
  return cloneIncident(incident);
}

export function updateOpsIncidentStatus(
  input: UpdateOpsIncidentStatusInput,
): OpsIncident {
  const incidentId = input.incidentId.trim();
  if (!incidentId) throw new Error("incident.incidentId is required");
  if (!(OPS_INCIDENT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid incident status: ${input.status}`);
  }

  const existing = incidents.get(incidentId);
  if (!existing) throw new Error(`incident not found: ${incidentId}`);

  const updated: OpsIncident = {
    ...existing,
    status: input.status,
    detail: `severity=${existing.severity} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  incidents.set(incidentId, updated);
  return cloneIncident(updated);
}

export function getOpsIncident(id: string): OpsIncident | undefined {
  const incident = incidents.get(id.trim());
  return incident ? cloneIncident(incident) : undefined;
}

export function listOpsIncidents(filter?: {
  surfaceId?: string;
  severity?: OpsIncidentSeverity;
  status?: OpsIncidentStatus;
}): OpsIncident[] {
  let result = [...incidents.values()];
  if (filter?.surfaceId) {
    const surfaceId = filter.surfaceId.trim();
    result = result.filter((i) => i.surfaceId === surfaceId);
  }
  if (filter?.severity) {
    result = result.filter((i) => i.severity === filter.severity);
  }
  if (filter?.status) {
    result = result.filter((i) => i.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIncident);
}

export function clearOpsIncidents(): void {
  incidents.clear();
}
