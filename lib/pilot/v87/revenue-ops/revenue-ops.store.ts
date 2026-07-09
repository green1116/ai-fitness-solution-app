/**
 * V87 — Revenue ops state store (minimal write, isolated from upstream layers)
 */

import { randomUUID } from "node:crypto";

import type {
  RevenueOpsActionEntry,
  RevenueOpsActionType,
  RevenueOpsRecord,
  RevenueOpsStatus,
  RevenueOpsOutcome,
} from "./revenue-ops.types";

declare global {
  // eslint-disable-next-line no-var
  var __v87RevenueOpsRecords: Map<string, RevenueOpsRecord> | undefined;
  // eslint-disable-next-line no-var
  var __v87RevenueOpsActions: RevenueOpsActionEntry[] | undefined;
}

function opsStore(): Map<string, RevenueOpsRecord> {
  globalThis.__v87RevenueOpsRecords ||= new Map();
  return globalThis.__v87RevenueOpsRecords;
}

function actionStore(): RevenueOpsActionEntry[] {
  globalThis.__v87RevenueOpsActions ||= [];
  return globalThis.__v87RevenueOpsActions;
}

function recordKey(sessionId: string, organizationId: string): string {
  return `${organizationId}:${sessionId}`;
}

export function getRevenueOpsRecord(
  sessionId: string,
  organizationId: string,
): RevenueOpsRecord | null {
  return opsStore().get(recordKey(sessionId, organizationId)) ?? null;
}

export function getOrCreateRevenueOpsRecord(
  sessionId: string,
  organizationId: string,
  expectedRenewalValue: number,
): RevenueOpsRecord {
  const key = recordKey(sessionId, organizationId);
  const existing = opsStore().get(key);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record: RevenueOpsRecord = {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    expectedRenewalValue,
    escalationLevel: 0,
    createdAt: now,
    updatedAt: now,
  };
  opsStore().set(key, record);
  return record;
}

export function updateRevenueOpsRecord(
  sessionId: string,
  organizationId: string,
  patch: Partial<
    Pick<
      RevenueOpsRecord,
      | "ownerId"
      | "ownerName"
      | "status"
      | "outcome"
      | "escalationLevel"
      | "escalatedAt"
      | "scheduledFollowUpAt"
      | "savedAt"
      | "renewedAt"
      | "churnedAt"
    >
  >,
): RevenueOpsRecord {
  const record = opsStore().get(recordKey(sessionId, organizationId));
  if (!record) throw new Error("REVENUE_OPS_NOT_FOUND");
  const updated: RevenueOpsRecord = {
    ...record,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  opsStore().set(recordKey(sessionId, organizationId), updated);
  return updated;
}

export function appendRevenueOpsAction(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: RevenueOpsActionType;
  note?: string;
  meta?: Record<string, unknown>;
}): RevenueOpsActionEntry {
  const entry: RevenueOpsActionEntry = {
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

export function listRevenueOpsActions(sessionId: string): RevenueOpsActionEntry[] {
  return actionStore()
    .filter((e) => e.sessionId === sessionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function listRevenueOpsRecordsForOrg(organizationId: string): RevenueOpsRecord[] {
  return [...opsStore().values()].filter((r) => r.organizationId === organizationId);
}

export function clearRevenueOpsStoreForTests(): void {
  globalThis.__v87RevenueOpsRecords = new Map();
  globalThis.__v87RevenueOpsActions = [];
}

export type { RevenueOpsStatus, RevenueOpsOutcome };
