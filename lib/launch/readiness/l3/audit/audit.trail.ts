/**
 * Launch L3 — Audit trail
 */

import { listAuditEvents } from "./audit.event";
import type { AssembleAuditTrailInput, AuditTrail } from "./audit.types";

const trails = new Map<string, AuditTrail>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTrail(trail: AuditTrail): AuditTrail {
  return { ...trail, eventIds: [...trail.eventIds] };
}

export function assembleAuditTrail(
  input: AssembleAuditTrailInput,
): AuditTrail {
  const runtimeId = input.runtimeId.trim();
  if (!runtimeId) throw new Error("auditTrail.runtimeId is required");

  const events = listAuditEvents({ runtimeId });
  if (events.length < 1) {
    throw new Error(`no audit events for runtime: ${runtimeId}`);
  }

  const id = input.id?.trim() || createId("l3trl");
  if (trails.has(id)) {
    throw new Error(`audit trail already exists: ${id}`);
  }

  const trail: AuditTrail = {
    id,
    runtimeId,
    eventIds: events.map((e) => e.id),
    eventCount: events.length,
    detail: `runtime=${runtimeId} events=${events.length}`,
    assembledAt: nowIso(),
  };
  trails.set(id, trail);
  return cloneTrail(trail);
}

export function getAuditTrail(id: string): AuditTrail | undefined {
  const trail = trails.get(id.trim());
  return trail ? cloneTrail(trail) : undefined;
}

export function listAuditTrails(filter?: {
  runtimeId?: string;
}): AuditTrail[] {
  let result = [...trails.values()];
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((t) => t.runtimeId === rid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTrail);
}

export function clearAuditTrails(): void {
  trails.clear();
}
