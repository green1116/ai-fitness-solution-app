/**
 * V95 — Executive action cache (minimal write, isolated from upstream)
 */

import { randomUUID } from "node:crypto";

import type {
  ExecutiveActionEntry,
  ExecutiveActionRecord,
  ExecutiveActionType,
} from "./executive-action.types";

declare global {
  // eslint-disable-next-line no-var
  var __v95ExecutiveActionRecords: Map<string, ExecutiveActionRecord> | undefined;
  // eslint-disable-next-line no-var
  var __v95ExecutiveActionLog: ExecutiveActionEntry[] | undefined;
}

function recordStore(): Map<string, ExecutiveActionRecord> {
  globalThis.__v95ExecutiveActionRecords ||= new Map();
  return globalThis.__v95ExecutiveActionRecords;
}

function actionStore(): ExecutiveActionEntry[] {
  globalThis.__v95ExecutiveActionLog ||= [];
  return globalThis.__v95ExecutiveActionLog;
}

function recordKey(sessionId: string, organizationId: string): string {
  return `${organizationId}:${sessionId}`;
}

export function getExecutiveActionRecord(
  sessionId: string,
  organizationId: string,
): ExecutiveActionRecord | null {
  return recordStore().get(recordKey(sessionId, organizationId)) ?? null;
}

export function getOrCreateExecutiveActionRecord(input: {
  sessionId: string;
  organizationId: string;
  priority: ExecutiveActionRecord["priority"];
  recommendedAction: string;
  dueDate: string;
}): ExecutiveActionRecord {
  const key = recordKey(input.sessionId, input.organizationId);
  const existing = recordStore().get(key);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record: ExecutiveActionRecord = {
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    status: "queued",
    outcome: "open",
    priority: input.priority,
    recommendedAction: input.recommendedAction,
    dueDate: input.dueDate,
    actionCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  recordStore().set(key, record);
  return record;
}

export function updateExecutiveActionRecord(
  sessionId: string,
  organizationId: string,
  patch: Partial<
    Pick<
      ExecutiveActionRecord,
      | "executiveOwnerId"
      | "executiveOwnerName"
      | "status"
      | "outcome"
      | "outcomeNote"
      | "actedAt"
      | "deferredAt"
      | "closedAt"
      | "actionCount"
      | "recommendedAction"
      | "dueDate"
    >
  >,
): ExecutiveActionRecord {
  const key = recordKey(sessionId, organizationId);
  const existing = recordStore().get(key);
  if (!existing) throw new Error("EXECUTIVE_ACTION_NOT_FOUND");

  const updated: ExecutiveActionRecord = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  recordStore().set(key, updated);
  return updated;
}

export function appendExecutiveAction(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: ExecutiveActionType;
  note?: string;
  meta?: Record<string, unknown>;
}): ExecutiveActionEntry {
  const entry: ExecutiveActionEntry = {
    id: randomUUID(),
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: input.action,
    timestamp: new Date().toISOString(),
    note: input.note,
    meta: input.meta,
  };
  actionStore().push(entry);
  return entry;
}

export function listExecutiveActionsForOrg(organizationId: string): ExecutiveActionEntry[] {
  return actionStore()
    .filter((a) => a.organizationId === organizationId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function listExecutiveActionsForSession(
  sessionId: string,
  organizationId: string,
): ExecutiveActionEntry[] {
  return actionStore()
    .filter((a) => a.sessionId === sessionId && a.organizationId === organizationId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function listExecutiveActionRecordsForOrg(
  organizationId: string,
): ExecutiveActionRecord[] {
  return [...recordStore().values()].filter((r) => r.organizationId === organizationId);
}

export function clearExecutiveActionStoreForTests(): void {
  globalThis.__v95ExecutiveActionRecords = new Map();
  globalThis.__v95ExecutiveActionLog = [];
}
