/**
 * V97 — Compliance cache (minimal write for records / actions)
 */

import { randomUUID } from "node:crypto";

import type {
  ComplianceActionEntry,
  ComplianceActionType,
  ComplianceRecord,
} from "./compliance.types";

type ComplianceCacheEntry = {
  organizationId: string;
  records: ComplianceRecord[];
  actions: ComplianceActionEntry[];
  exportsRequested: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __v97ComplianceCache: Map<string, ComplianceCacheEntry> | undefined;
}

function cache(): Map<string, ComplianceCacheEntry> {
  globalThis.__v97ComplianceCache ||= new Map();
  return globalThis.__v97ComplianceCache;
}

function getOrCreateEntry(organizationId: string): ComplianceCacheEntry {
  const existing = cache().get(organizationId);
  if (existing) return existing;
  const entry: ComplianceCacheEntry = {
    organizationId,
    records: [],
    actions: [],
    exportsRequested: 0,
  };
  cache().set(organizationId, entry);
  return entry;
}

export function listComplianceRecords(organizationId: string): ComplianceRecord[] {
  return getOrCreateEntry(organizationId).records.sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getComplianceRecord(
  organizationId: string,
  recordId: string,
): ComplianceRecord | null {
  return listComplianceRecords(organizationId).find((r) => r.id === recordId) ?? null;
}

export function getComplianceRecordByArchive(
  organizationId: string,
  archiveRecordId: string,
): ComplianceRecord | null {
  return (
    listComplianceRecords(organizationId).find((r) => r.archiveRecordId === archiveRecordId) ??
    null
  );
}

export function getComplianceRecordBySession(
  organizationId: string,
  sessionId: string,
): ComplianceRecord | null {
  return listComplianceRecords(organizationId).find((r) => r.sessionId === sessionId) ?? null;
}

export function saveComplianceRecord(record: ComplianceRecord): ComplianceRecord {
  const entry = getOrCreateEntry(record.organizationId);
  const idx = entry.records.findIndex((r) => r.id === record.id);
  if (idx >= 0) entry.records[idx] = record;
  else entry.records.push(record);
  cache().set(record.organizationId, entry);
  return record;
}

export function appendComplianceAction(input: {
  organizationId: string;
  actorId: string;
  action: ComplianceActionType;
  complianceRecordId?: string;
  archiveRecordId?: string;
  sessionId?: string;
  note?: string;
  meta?: Record<string, unknown>;
}): ComplianceActionEntry {
  const entry = getOrCreateEntry(input.organizationId);
  const action: ComplianceActionEntry = {
    id: randomUUID(),
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: input.action,
    complianceRecordId: input.complianceRecordId,
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

export function listComplianceActions(organizationId: string): ComplianceActionEntry[] {
  return getOrCreateEntry(organizationId).actions.sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export function incrementComplianceExportsRequested(organizationId: string): number {
  const entry = getOrCreateEntry(organizationId);
  entry.exportsRequested += 1;
  cache().set(organizationId, entry);
  return entry.exportsRequested;
}

export function getComplianceExportsRequested(organizationId: string): number {
  return getOrCreateEntry(organizationId).exportsRequested;
}

export function clearComplianceCacheForTests(): void {
  globalThis.__v97ComplianceCache = new Map();
}
