/**
 * Product API Audit — Trail registry
 */

import { API_AUDIT_TRAIL_STATUSES } from "../management/management.constants";
import { getApiAuditEvent } from "../event/event.registry";
import type {
  AppendApiAuditTrailInput,
  ApiAuditTrail,
  SealApiAuditTrailInput,
} from "./trail.types";

const trails = new Map<string, ApiAuditTrail>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTrail(trail: ApiAuditTrail): ApiAuditTrail {
  return { ...trail, metadata: { ...trail.metadata } };
}

export function appendApiAuditTrail(
  input: AppendApiAuditTrailInput,
): ApiAuditTrail {
  const eventId = input.eventId.trim();
  if (!eventId) throw new Error("trail.eventId is required");
  if (!Number.isFinite(input.sequence) || input.sequence < 1) {
    throw new Error("trail.sequence must be >= 1");
  }
  if (!getApiAuditEvent(eventId)) {
    throw new Error(`event not found: ${eventId}`);
  }

  const duplicate = [...trails.values()].find(
    (t) => t.eventId === eventId && t.sequence === Math.floor(input.sequence),
  );
  if (duplicate) {
    throw new Error(`trail sequence already exists: ${input.sequence}`);
  }

  const id = input.id?.trim() || createId("apiaudtrl");
  if (trails.has(id)) throw new Error(`trail already exists: ${id}`);

  const now = nowIso();
  const trail: ApiAuditTrail = {
    id,
    eventId,
    status: API_AUDIT_TRAIL_STATUSES[0],
    sequence: Math.floor(input.sequence),
    detail: `status=RECORDED sequence=${Math.floor(input.sequence)}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  trails.set(id, trail);
  return cloneTrail(trail);
}

export function sealApiAuditTrail(
  input: SealApiAuditTrailInput,
): ApiAuditTrail {
  const trailId = input.trailId.trim();
  if (!trailId) throw new Error("trail.trailId is required");

  const existing = trails.get(trailId);
  if (!existing) throw new Error(`trail not found: ${trailId}`);
  if (existing.status === "SEALED") {
    throw new Error(`trail already sealed: ${trailId}`);
  }

  const updated: ApiAuditTrail = {
    ...existing,
    status: "SEALED",
    detail: `status=SEALED sequence=${existing.sequence}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  trails.set(trailId, updated);
  return cloneTrail(updated);
}

export function getApiAuditTrail(id: string): ApiAuditTrail | undefined {
  const trail = trails.get(id.trim());
  return trail ? cloneTrail(trail) : undefined;
}

export function listApiAuditTrails(filter?: {
  eventId?: string;
}): ApiAuditTrail[] {
  let result = [...trails.values()];
  if (filter?.eventId) {
    const eventId = filter.eventId.trim();
    result = result.filter((t) => t.eventId === eventId);
  }
  return result
    .slice()
    .sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id))
    .map(cloneTrail);
}

export function clearApiAuditTrails(): void {
  trails.clear();
}
