/**
 * V86 — Renewal ops state store (minimal write, isolated from delivery/CS/health)
 */

import { randomUUID } from "node:crypto";

import type {
  RenewalOpsActionEntry,
  RenewalOpsActionType,
  RenewalOpsRecord,
  RenewalOpsStatus,
  RenewalOutcome,
} from "./renewal-ops.types";

declare global {
  // eslint-disable-next-line no-var
  var __v86RenewalOpsRecords: Map<string, RenewalOpsRecord> | undefined;
  // eslint-disable-next-line no-var
  var __v86RenewalOpsActions: RenewalOpsActionEntry[] | undefined;
}

function opsStore(): Map<string, RenewalOpsRecord> {
  globalThis.__v86RenewalOpsRecords ||= new Map();
  return globalThis.__v86RenewalOpsRecords;
}

function actionStore(): RenewalOpsActionEntry[] {
  globalThis.__v86RenewalOpsActions ||= [];
  return globalThis.__v86RenewalOpsActions;
}

function recordKey(sessionId: string, organizationId: string): string {
  return `${organizationId}:${sessionId}`;
}

export function getRenewalOpsRecord(
  sessionId: string,
  organizationId: string,
): RenewalOpsRecord | null {
  return opsStore().get(recordKey(sessionId, organizationId)) ?? null;
}

export function getOrCreateRenewalOpsRecord(
  sessionId: string,
  organizationId: string,
): RenewalOpsRecord {
  const key = recordKey(sessionId, organizationId);
  const existing = opsStore().get(key);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record: RenewalOpsRecord = {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    outreachAttempts: 0,
    createdAt: now,
    updatedAt: now,
  };
  opsStore().set(key, record);
  return record;
}

export function updateRenewalOpsRecord(
  sessionId: string,
  organizationId: string,
  patch: Partial<
    Pick<
      RenewalOpsRecord,
      | "ownerId"
      | "ownerName"
      | "status"
      | "outcome"
      | "outreachAttempts"
      | "lastOutreachAt"
      | "scheduledOutreachAt"
      | "savedAt"
      | "renewedAt"
      | "churnedAt"
    >
  >,
): RenewalOpsRecord {
  const record = getOrCreateRenewalOpsRecord(sessionId, organizationId);
  const updated: RenewalOpsRecord = {
    ...record,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  opsStore().set(recordKey(sessionId, organizationId), updated);
  return updated;
}

export function appendRenewalOpsAction(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: RenewalOpsActionType;
  note?: string;
  meta?: Record<string, unknown>;
}): RenewalOpsActionEntry {
  const entry: RenewalOpsActionEntry = {
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

export function listRenewalOpsActions(sessionId: string): RenewalOpsActionEntry[] {
  return actionStore()
    .filter((e) => e.sessionId === sessionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function listRenewalOpsRecordsForOrg(organizationId: string): RenewalOpsRecord[] {
  return [...opsStore().values()].filter((r) => r.organizationId === organizationId);
}

export function clearRenewalOpsStoreForTests(): void {
  globalThis.__v86RenewalOpsRecords = new Map();
  globalThis.__v86RenewalOpsActions = [];
}

export type { RenewalOpsStatus, RenewalOutcome };
