/**
 * Product Admin Audit — Trail registry
 */

import { getAdminAuditEvent } from "../event/event.registry";
import { ADMIN_TRAIL_STATUSES } from "../traceability/traceability.constants";
import type {
  AdminAuditTrail,
  AdminTrailStatus,
  AppendAdminTrailInput,
  MarkAdminTrailStatusInput,
} from "./trail.types";

const trails = new Map<string, AdminAuditTrail>();
let sequenceCounter = 0;

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTrail(trail: AdminAuditTrail): AdminAuditTrail {
  return { ...trail, metadata: { ...trail.metadata } };
}

export function appendAdminTrail(
  input: AppendAdminTrailInput,
): AdminAuditTrail {
  const eventId = input.eventId.trim();
  if (!eventId) throw new Error("trail.eventId is required");
  if (!getAdminAuditEvent(eventId)) {
    throw new Error(`admin audit event not found: ${eventId}`);
  }

  const duplicate = [...trails.values()].find((t) => t.eventId === eventId);
  if (duplicate) {
    throw new Error(`trail already exists for event: ${eventId}`);
  }

  const id = input.id?.trim() || createId("adautrl");
  if (trails.has(id)) throw new Error(`trail already exists: ${id}`);

  sequenceCounter += 1;
  const trail: AdminAuditTrail = {
    id,
    eventId,
    sequence: sequenceCounter,
    status: ADMIN_TRAIL_STATUSES[0],
    detail: `event=${eventId} seq=${sequenceCounter}`,
    metadata: { ...(input.metadata ?? {}) },
    appendedAt: nowIso(),
  };
  trails.set(id, trail);
  return cloneTrail(trail);
}

export function markAdminTrailStatus(
  input: MarkAdminTrailStatusInput,
): AdminAuditTrail {
  const trailId = input.trailId.trim();
  if (!trailId) throw new Error("trail.trailId is required");
  const existing = trails.get(trailId);
  if (!existing) throw new Error(`trail not found: ${trailId}`);
  if (existing.status === input.status) {
    throw new Error(`trail already ${input.status}: ${trailId}`);
  }

  const updated: AdminAuditTrail = {
    ...existing,
    status: input.status,
    detail: `event=${existing.eventId} status=${input.status}`,
    metadata: { ...existing.metadata },
  };
  trails.set(trailId, updated);
  return cloneTrail(updated);
}

export function getAdminTrail(id: string): AdminAuditTrail | undefined {
  const trail = trails.get(id.trim());
  return trail ? cloneTrail(trail) : undefined;
}

export function listAdminTrails(filter?: {
  status?: AdminTrailStatus;
  eventId?: string;
}): AdminAuditTrail[] {
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

export function clearAdminTrails(): void {
  trails.clear();
  sequenceCounter = 0;
}
