/**
 * V92 — Governance state store (minimal write, isolated from upstream layers)
 */

import { randomUUID } from "node:crypto";

import type {
  GovernanceActionEntry,
  GovernanceActionType,
  GovernanceRecord,
  GovernanceStatus,
  GovernanceOutcome,
} from "./governance.types";

declare global {
  // eslint-disable-next-line no-var
  var __v92GovernanceRecords: Map<string, GovernanceRecord> | undefined;
  // eslint-disable-next-line no-var
  var __v92GovernanceActions: GovernanceActionEntry[] | undefined;
}

function opsStore(): Map<string, GovernanceRecord> {
  globalThis.__v92GovernanceRecords ||= new Map();
  return globalThis.__v92GovernanceRecords;
}

function actionStore(): GovernanceActionEntry[] {
  globalThis.__v92GovernanceActions ||= [];
  return globalThis.__v92GovernanceActions;
}

function recordKey(sessionId: string, organizationId: string): string {
  return `${organizationId}:${sessionId}`;
}

export function getGovernanceRecord(
  sessionId: string,
  organizationId: string,
): GovernanceRecord | null {
  return opsStore().get(recordKey(sessionId, organizationId)) ?? null;
}

export function getOrCreateGovernanceRecord(
  sessionId: string,
  organizationId: string,
  expectedValue: number,
): GovernanceRecord {
  const key = recordKey(sessionId, organizationId);
  const existing = opsStore().get(key);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record: GovernanceRecord = {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    expectedValue,
    decisionCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  opsStore().set(key, record);
  return record;
}

export function updateGovernanceRecord(
  sessionId: string,
  organizationId: string,
  patch: Partial<
    Pick<
      GovernanceRecord,
      | "executiveOwnerId"
      | "executiveOwnerName"
      | "status"
      | "outcome"
      | "scheduledBoardReviewAt"
      | "approvedAt"
      | "deferredAt"
      | "blockedAt"
      | "decisionCount"
    >
  >,
): GovernanceRecord {
  const record = opsStore().get(recordKey(sessionId, organizationId));
  if (!record) throw new Error("GOVERNANCE_NOT_FOUND");
  const updated: GovernanceRecord = {
    ...record,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  opsStore().set(recordKey(sessionId, organizationId), updated);
  return updated;
}

export function appendGovernanceAction(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: GovernanceActionType;
  note?: string;
  meta?: Record<string, unknown>;
}): GovernanceActionEntry {
  const entry: GovernanceActionEntry = {
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

export function listGovernanceActions(sessionId: string): GovernanceActionEntry[] {
  return actionStore()
    .filter((e) => e.sessionId === sessionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function listGovernanceRecordsForOrg(organizationId: string): GovernanceRecord[] {
  return [...opsStore().values()].filter((r) => r.organizationId === organizationId);
}

export function clearGovernanceStoreForTests(): void {
  globalThis.__v92GovernanceRecords = new Map();
  globalThis.__v92GovernanceActions = [];
}

export type { GovernanceStatus, GovernanceOutcome };
