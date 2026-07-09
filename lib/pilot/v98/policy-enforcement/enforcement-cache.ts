/**
 * V98 — Enforcement cache (minimal write for records / actions)
 */

import { randomUUID } from "node:crypto";

import type {
  EnforcementActionEntry,
  EnforcementActionType,
  EnforcementRecord,
} from "./enforcement.types";

type EnforcementCacheEntry = {
  organizationId: string;
  records: EnforcementRecord[];
  actions: EnforcementActionEntry[];
};

declare global {
  // eslint-disable-next-line no-var
  var __v98EnforcementCache: Map<string, EnforcementCacheEntry> | undefined;
}

function cache(): Map<string, EnforcementCacheEntry> {
  globalThis.__v98EnforcementCache ||= new Map();
  return globalThis.__v98EnforcementCache;
}

function getOrCreateEntry(organizationId: string): EnforcementCacheEntry {
  const existing = cache().get(organizationId);
  if (existing) return existing;
  const entry: EnforcementCacheEntry = {
    organizationId,
    records: [],
    actions: [],
  };
  cache().set(organizationId, entry);
  return entry;
}

function recordKey(organizationId: string, archiveRecordId: string): string {
  return `${organizationId}:${archiveRecordId}`;
}

export function listEnforcementRecords(organizationId: string): EnforcementRecord[] {
  return getOrCreateEntry(organizationId).records.sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getEnforcementRecord(
  organizationId: string,
  recordId: string,
): EnforcementRecord | null {
  return listEnforcementRecords(organizationId).find((r) => r.id === recordId) ?? null;
}

export function getEnforcementRecordByArchive(
  organizationId: string,
  archiveRecordId: string,
): EnforcementRecord | null {
  const key = recordKey(organizationId, archiveRecordId);
  return (
    listEnforcementRecords(organizationId).find(
      (r) => recordKey(r.organizationId, r.archiveRecordId) === key,
    ) ?? null
  );
}

export function saveEnforcementRecord(record: EnforcementRecord): EnforcementRecord {
  const entry = getOrCreateEntry(record.organizationId);
  const idx = entry.records.findIndex((r) => r.id === record.id);
  if (idx >= 0) entry.records[idx] = record;
  else entry.records.push(record);
  cache().set(record.organizationId, entry);
  return record;
}

export function appendEnforcementAction(input: {
  organizationId: string;
  actorId: string;
  action: EnforcementActionType;
  enforcementRecordId?: string;
  archiveRecordId?: string;
  sessionId?: string;
  note?: string;
  meta?: Record<string, unknown>;
}): EnforcementActionEntry {
  const entry = getOrCreateEntry(input.organizationId);
  const action: EnforcementActionEntry = {
    id: randomUUID(),
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: input.action,
    enforcementRecordId: input.enforcementRecordId,
    archiveRecordId: input.archiveRecordId,
    sessionId: input.sessionId,
    timestamp: new Date().toISOString(),
    note: input.note,
    meta: input.meta,
  };
  entry.actions.push(action);
  cache().set(input.organizationId, entry);
  return action;
}

export function listEnforcementActions(organizationId: string): EnforcementActionEntry[] {
  return getOrCreateEntry(organizationId).actions.sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export function clearEnforcementCacheForTests(): void {
  globalThis.__v98EnforcementCache = new Map();
}
