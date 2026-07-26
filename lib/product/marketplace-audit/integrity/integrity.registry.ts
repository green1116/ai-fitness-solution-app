/**
 * Product Marketplace Audit — Integrity registry (checksum seal only)
 */

import { createHash } from "node:crypto";

import { getMarketplaceAuditEvent } from "../event/event.registry";
import { getMarketplaceAuditTrail } from "../trail/trail.registry";
import type {
  MarketplaceAuditIntegrity,
  SealMarketplaceAuditIntegrityInput,
} from "./integrity.types";

const integrityRecords = new Map<string, MarketplaceAuditIntegrity>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIntegrity(
  record: MarketplaceAuditIntegrity,
): MarketplaceAuditIntegrity {
  return { ...record, metadata: { ...record.metadata } };
}

export function sealMarketplaceAuditIntegrity(
  input: SealMarketplaceAuditIntegrityInput,
): MarketplaceAuditIntegrity {
  const trailId = input.trailId.trim();
  if (!trailId) throw new Error("integrity.trailId is required");

  const trail = getMarketplaceAuditTrail(trailId);
  if (!trail) throw new Error(`trail not found: ${trailId}`);
  if (trail.status !== "SEALED") {
    throw new Error(`trail not sealed: ${trailId}`);
  }

  const event = getMarketplaceAuditEvent(trail.eventId);
  if (!event) throw new Error(`event not found: ${trail.eventId}`);

  const duplicate = [...integrityRecords.values()].find(
    (r) => r.trailId === trailId,
  );
  if (duplicate) throw new Error(`integrity already exists: ${trailId}`);

  const payload = {
    eventKey: event.eventKey,
    category: event.category,
    severity: event.severity,
    subjectKey: event.subjectKey,
    governanceKeyRef: event.governanceKeyRef,
    detail: event.detail,
    sequence: trail.sequence,
    status: trail.status,
  };
  const checksum = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  const id = input.id?.trim() || createId("mpaudint");
  if (integrityRecords.has(id)) {
    throw new Error(`integrity already exists: ${id}`);
  }

  const record: MarketplaceAuditIntegrity = {
    id,
    trailId,
    checksum,
    verdict: "INTACT",
    detail: `verdict=INTACT checksum=${checksum.slice(0, 12)}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  integrityRecords.set(id, record);
  return cloneIntegrity(record);
}

export function getMarketplaceAuditIntegrity(
  id: string,
): MarketplaceAuditIntegrity | undefined {
  const record = integrityRecords.get(id.trim());
  return record ? cloneIntegrity(record) : undefined;
}

export function listMarketplaceAuditIntegrities(filter?: {
  trailId?: string;
}): MarketplaceAuditIntegrity[] {
  let result = [...integrityRecords.values()];
  if (filter?.trailId) {
    const trailId = filter.trailId.trim();
    result = result.filter((r) => r.trailId === trailId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIntegrity);
}

export function clearMarketplaceAuditIntegrities(): void {
  integrityRecords.clear();
}
