/**
 * V96 — Archive cache (minimal write for records / actions)
 */

import { randomUUID } from "node:crypto";

import type {
  ArchiveActionEntry,
  ArchiveActionType,
  ArchiveRecord,
} from "./archive.types";

type ArchiveCacheEntry = {
  organizationId: string;
  records: ArchiveRecord[];
  actions: ArchiveActionEntry[];
  exportsCount: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __v96ArchiveCache: Map<string, ArchiveCacheEntry> | undefined;
}

function cache(): Map<string, ArchiveCacheEntry> {
  globalThis.__v96ArchiveCache ||= new Map();
  return globalThis.__v96ArchiveCache;
}

function getOrCreateEntry(organizationId: string): ArchiveCacheEntry {
  const existing = cache().get(organizationId);
  if (existing) return existing;
  const entry: ArchiveCacheEntry = {
    organizationId,
    records: [],
    actions: [],
    exportsCount: 0,
  };
  cache().set(organizationId, entry);
  return entry;
}

export function listArchiveRecords(organizationId: string): ArchiveRecord[] {
  return getOrCreateEntry(organizationId).records.sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getArchiveRecord(
  organizationId: string,
  recordId: string,
): ArchiveRecord | null {
  return listArchiveRecords(organizationId).find((r) => r.id === recordId) ?? null;
}

export function getArchiveRecordBySession(
  organizationId: string,
  sessionId: string,
): ArchiveRecord | null {
  return listArchiveRecords(organizationId).find((r) => r.sessionId === sessionId) ?? null;
}

export function saveArchiveRecord(record: ArchiveRecord): ArchiveRecord {
  const entry = getOrCreateEntry(record.organizationId);
  const idx = entry.records.findIndex((r) => r.id === record.id);
  if (idx >= 0) entry.records[idx] = record;
  else entry.records.push(record);
  cache().set(record.organizationId, entry);
  return record;
}

export function appendArchiveAction(input: {
  organizationId: string;
  actorId: string;
  action: ArchiveActionType;
  archiveRecordId?: string;
  sessionId?: string;
  note?: string;
  meta?: Record<string, unknown>;
}): ArchiveActionEntry {
  const entry = getOrCreateEntry(input.organizationId);
  const action: ArchiveActionEntry = {
    id: randomUUID(),
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: input.action,
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

export function listArchiveActions(organizationId: string): ArchiveActionEntry[] {
  return getOrCreateEntry(organizationId).actions.sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export function incrementExportsCount(organizationId: string): number {
  const entry = getOrCreateEntry(organizationId);
  entry.exportsCount += 1;
  cache().set(organizationId, entry);
  return entry.exportsCount;
}

export function getExportsCount(organizationId: string): number {
  return getOrCreateEntry(organizationId).exportsCount;
}

export function clearArchiveCacheForTests(): void {
  globalThis.__v96ArchiveCache = new Map();
}
