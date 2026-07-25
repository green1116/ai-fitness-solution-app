/**
 * Product CRM Audit — Trail registry
 */

import { getCrmAuditEvent } from "../event/event.registry";
import { CRM_TRAIL_STATUSES } from "../traceability/traceability.constants";
import type {
  AppendCrmTrailInput,
  CrmAuditTrail,
  CrmTrailStatus,
  MarkCrmTrailStatusInput,
} from "./trail.types";

const trails = new Map<string, CrmAuditTrail>();
let sequenceCounter = 0;

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTrail(trail: CrmAuditTrail): CrmAuditTrail {
  return { ...trail, metadata: { ...trail.metadata } };
}

export function appendCrmTrail(input: AppendCrmTrailInput): CrmAuditTrail {
  const eventId = input.eventId.trim();
  if (!eventId) throw new Error("trail.eventId is required");
  if (!getCrmAuditEvent(eventId)) {
    throw new Error(`crm audit event not found: ${eventId}`);
  }

  const duplicate = [...trails.values()].find((t) => t.eventId === eventId);
  if (duplicate) {
    throw new Error(`trail already exists for event: ${eventId}`);
  }

  const id = input.id?.trim() || createId("crautrl");
  if (trails.has(id)) throw new Error(`trail already exists: ${id}`);

  sequenceCounter += 1;
  const trail: CrmAuditTrail = {
    id,
    eventId,
    sequence: sequenceCounter,
    status: CRM_TRAIL_STATUSES[0],
    detail: `event=${eventId} seq=${sequenceCounter}`,
    metadata: { ...(input.metadata ?? {}) },
    appendedAt: nowIso(),
  };
  trails.set(id, trail);
  return cloneTrail(trail);
}

export function markCrmTrailStatus(
  input: MarkCrmTrailStatusInput,
): CrmAuditTrail {
  const trailId = input.trailId.trim();
  if (!trailId) throw new Error("trail.trailId is required");
  const existing = trails.get(trailId);
  if (!existing) throw new Error(`trail not found: ${trailId}`);
  if (existing.status === input.status) {
    throw new Error(`trail already ${input.status}: ${trailId}`);
  }

  const updated: CrmAuditTrail = {
    ...existing,
    status: input.status,
    detail: `event=${existing.eventId} status=${input.status}`,
    metadata: { ...existing.metadata },
  };
  trails.set(trailId, updated);
  return cloneTrail(updated);
}

export function getCrmTrail(id: string): CrmAuditTrail | undefined {
  const trail = trails.get(id.trim());
  return trail ? cloneTrail(trail) : undefined;
}

export function listCrmTrails(filter?: {
  status?: CrmTrailStatus;
  eventId?: string;
}): CrmAuditTrail[] {
  let result = [...trails.values()];
  if (filter?.status) {
    result = result.filter((t) => t.status === filter.status);
  }
  if (filter?.eventId) {
    const eventId = filter.eventId.trim();
    result = result.filter((t) => t.eventId === eventId);
  }
  return result
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map(cloneTrail);
}

export function clearCrmTrails(): void {
  trails.clear();
  sequenceCounter = 0;
}
