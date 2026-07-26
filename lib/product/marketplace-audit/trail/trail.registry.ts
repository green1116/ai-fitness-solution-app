/**
 * Product Marketplace Audit — Trail registry
 */

import { MARKETPLACE_AUDIT_TRAIL_STATUSES } from "../management/management.constants";
import { getMarketplaceAuditEvent } from "../event/event.registry";
import type {
  AppendMarketplaceAuditTrailInput,
  MarketplaceAuditTrail,
  SealMarketplaceAuditTrailInput,
} from "./trail.types";

const trails = new Map<string, MarketplaceAuditTrail>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTrail(trail: MarketplaceAuditTrail): MarketplaceAuditTrail {
  return { ...trail, metadata: { ...trail.metadata } };
}

export function appendMarketplaceAuditTrail(
  input: AppendMarketplaceAuditTrailInput,
): MarketplaceAuditTrail {
  const eventId = input.eventId.trim();
  if (!eventId) throw new Error("trail.eventId is required");
  if (!Number.isFinite(input.sequence) || input.sequence < 1) {
    throw new Error("trail.sequence must be >= 1");
  }
  if (!getMarketplaceAuditEvent(eventId)) {
    throw new Error(`event not found: ${eventId}`);
  }

  const duplicate = [...trails.values()].find(
    (t) => t.eventId === eventId && t.sequence === Math.floor(input.sequence),
  );
  if (duplicate) {
    throw new Error(`trail sequence already exists: ${input.sequence}`);
  }

  const id = input.id?.trim() || createId("mpaudtrl");
  if (trails.has(id)) throw new Error(`trail already exists: ${id}`);

  const now = nowIso();
  const trail: MarketplaceAuditTrail = {
    id,
    eventId,
    status: MARKETPLACE_AUDIT_TRAIL_STATUSES[0],
    sequence: Math.floor(input.sequence),
    detail: `status=RECORDED sequence=${Math.floor(input.sequence)}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  trails.set(id, trail);
  return cloneTrail(trail);
}

export function sealMarketplaceAuditTrail(
  input: SealMarketplaceAuditTrailInput,
): MarketplaceAuditTrail {
  const trailId = input.trailId.trim();
  if (!trailId) throw new Error("trail.trailId is required");

  const existing = trails.get(trailId);
  if (!existing) throw new Error(`trail not found: ${trailId}`);
  if (existing.status === "SEALED") {
    throw new Error(`trail already sealed: ${trailId}`);
  }

  const updated: MarketplaceAuditTrail = {
    ...existing,
    status: "SEALED",
    detail: `status=SEALED sequence=${existing.sequence}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  trails.set(trailId, updated);
  return cloneTrail(updated);
}

export function getMarketplaceAuditTrail(
  id: string,
): MarketplaceAuditTrail | undefined {
  const trail = trails.get(id.trim());
  return trail ? cloneTrail(trail) : undefined;
}

export function listMarketplaceAuditTrails(filter?: {
  eventId?: string;
}): MarketplaceAuditTrail[] {
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

export function clearMarketplaceAuditTrails(): void {
  trails.clear();
}
