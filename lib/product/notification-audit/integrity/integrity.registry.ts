/**
 * Product Notification Audit — Integrity registry
 */

import { createHash } from "node:crypto";

import { getNotificationAuditEvent } from "../event/event.registry";
import { getNotificationAuditTrail } from "../trail/trail.registry";
import type {
  NotificationAuditIntegrity,
  SealNotificationAuditIntegrityInput,
} from "./integrity.types";

const integrityRecords = new Map<string, NotificationAuditIntegrity>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIntegrity(
  record: NotificationAuditIntegrity,
): NotificationAuditIntegrity {
  return { ...record, metadata: { ...record.metadata } };
}

export function sealNotificationAuditIntegrity(
  input: SealNotificationAuditIntegrityInput,
): NotificationAuditIntegrity {
  const trailId = input.trailId.trim();
  if (!trailId) throw new Error("integrity.trailId is required");

  const trail = getNotificationAuditTrail(trailId);
  if (!trail) throw new Error(`trail not found: ${trailId}`);
  if (trail.status !== "SEALED") {
    throw new Error(`trail not sealed: ${trailId}`);
  }

  const event = getNotificationAuditEvent(trail.eventId);
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
    detail: event.detail,
    sequence: trail.sequence,
    status: trail.status,
  };
  const checksum = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  const id = input.id?.trim() || createId("naudint");
  if (integrityRecords.has(id)) {
    throw new Error(`integrity already exists: ${id}`);
  }

  const record: NotificationAuditIntegrity = {
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

export function getNotificationAuditIntegrity(
  id: string,
): NotificationAuditIntegrity | undefined {
  const record = integrityRecords.get(id.trim());
  return record ? cloneIntegrity(record) : undefined;
}

export function listNotificationAuditIntegrities(filter?: {
  trailId?: string;
}): NotificationAuditIntegrity[] {
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

export function clearNotificationAuditIntegrities(): void {
  integrityRecords.clear();
}
