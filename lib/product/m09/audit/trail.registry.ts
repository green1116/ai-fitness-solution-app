/**
 * Product M09 — AI Audit trail registry (append-only record)
 */

import { AI_AUDIT_TRAIL_STATUSES } from "./audit.constants";
import type {
  AiAuditTrail,
  AiAuditTrailStatus,
  AppendAiAuditTrailInput,
  MarkAiAuditTrailStatusInput,
} from "./audit.types";
import { getAiAuditEvent } from "./event.registry";

const trails = new Map<string, AiAuditTrail>();
let sequenceCounter = 0;

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTrail(entry: AiAuditTrail): AiAuditTrail {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function appendAiAuditTrail(
  input: AppendAiAuditTrailInput,
): AiAuditTrail {
  const eventId = input.eventId.trim();
  if (!eventId) throw new Error("trail.eventId is required");
  if (!getAiAuditEvent(eventId)) {
    throw new Error(`audit event not found: ${eventId}`);
  }

  const duplicate = [...trails.values()].find((t) => t.eventId === eventId);
  if (duplicate) {
    throw new Error(`trail already exists for event: ${eventId}`);
  }

  const id = input.id?.trim() || createId("aiaudtrl");
  if (trails.has(id)) throw new Error(`trail already exists: ${id}`);

  sequenceCounter += 1;
  const entry: AiAuditTrail = {
    id,
    eventId,
    sequence: sequenceCounter,
    status: AI_AUDIT_TRAIL_STATUSES[0],
    detail: `event=${eventId} seq=${sequenceCounter}`,
    metadata: { ...(input.metadata ?? {}) },
    appendedAt: nowIso(),
  };
  trails.set(id, entry);
  return cloneTrail(entry);
}

export function markAiAuditTrailStatus(
  input: MarkAiAuditTrailStatusInput,
): AiAuditTrail {
  const trailId = input.trailId.trim();
  if (!trailId) throw new Error("trail.trailId is required");
  const existing = trails.get(trailId);
  if (!existing) throw new Error(`trail not found: ${trailId}`);
  if (existing.status === input.status) {
    throw new Error(`trail already ${input.status}: ${trailId}`);
  }

  const updated: AiAuditTrail = {
    ...existing,
    status: input.status,
    detail: `event=${existing.eventId} status=${input.status}`,
    metadata: { ...existing.metadata },
  };
  trails.set(trailId, updated);
  return cloneTrail(updated);
}

export function getAiAuditTrail(id: string): AiAuditTrail | undefined {
  const entry = trails.get(id.trim());
  return entry ? cloneTrail(entry) : undefined;
}

export function listAiAuditTrails(filter?: {
  status?: AiAuditTrailStatus;
  eventId?: string;
}): AiAuditTrail[] {
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

export function clearAiAuditTrails(): void {
  trails.clear();
  sequenceCounter = 0;
}
