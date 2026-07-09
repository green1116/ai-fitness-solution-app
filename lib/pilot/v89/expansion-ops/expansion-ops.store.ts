/**
 * V89 — Expansion ops state store (minimal write, isolated from upstream layers)
 */

import { randomUUID } from "node:crypto";

import type {
  ExpansionOpsActionEntry,
  ExpansionOpsActionType,
  ExpansionOpsRecord,
  ExpansionOpsStatus,
  ExpansionOutcome,
} from "./expansion-ops.types";

declare global {
  // eslint-disable-next-line no-var
  var __v89ExpansionOpsRecords: Map<string, ExpansionOpsRecord> | undefined;
  // eslint-disable-next-line no-var
  var __v89ExpansionOpsActions: ExpansionOpsActionEntry[] | undefined;
}

function opsStore(): Map<string, ExpansionOpsRecord> {
  globalThis.__v89ExpansionOpsRecords ||= new Map();
  return globalThis.__v89ExpansionOpsRecords;
}

function actionStore(): ExpansionOpsActionEntry[] {
  globalThis.__v89ExpansionOpsActions ||= [];
  return globalThis.__v89ExpansionOpsActions;
}

function recordKey(sessionId: string, organizationId: string): string {
  return `${organizationId}:${sessionId}`;
}

export function getExpansionOpsRecord(
  sessionId: string,
  organizationId: string,
): ExpansionOpsRecord | null {
  return opsStore().get(recordKey(sessionId, organizationId)) ?? null;
}

export function getOrCreateExpansionOpsRecord(
  sessionId: string,
  organizationId: string,
  expansionOpportunity: number,
): ExpansionOpsRecord {
  const key = recordKey(sessionId, organizationId);
  const existing = opsStore().get(key);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record: ExpansionOpsRecord = {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    expansionOpportunity,
    proposalCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  opsStore().set(key, record);
  return record;
}

export function updateExpansionOpsRecord(
  sessionId: string,
  organizationId: string,
  patch: Partial<
    Pick<
      ExpansionOpsRecord,
      | "ownerId"
      | "ownerName"
      | "status"
      | "outcome"
      | "proposalCount"
      | "lastProposalAt"
      | "scheduledFollowUpAt"
      | "expandedAt"
      | "retainedAt"
      | "lostAt"
    >
  >,
): ExpansionOpsRecord {
  const record = opsStore().get(recordKey(sessionId, organizationId));
  if (!record) throw new Error("EXPANSION_OPS_NOT_FOUND");
  const updated: ExpansionOpsRecord = {
    ...record,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  opsStore().set(recordKey(sessionId, organizationId), updated);
  return updated;
}

export function appendExpansionOpsAction(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: ExpansionOpsActionType;
  note?: string;
  meta?: Record<string, unknown>;
}): ExpansionOpsActionEntry {
  const entry: ExpansionOpsActionEntry = {
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

export function listExpansionOpsActions(sessionId: string): ExpansionOpsActionEntry[] {
  return actionStore()
    .filter((e) => e.sessionId === sessionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function listExpansionOpsRecordsForOrg(organizationId: string): ExpansionOpsRecord[] {
  return [...opsStore().values()].filter((r) => r.organizationId === organizationId);
}

export function clearExpansionOpsStoreForTests(): void {
  globalThis.__v89ExpansionOpsRecords = new Map();
  globalThis.__v89ExpansionOpsActions = [];
}

export type { ExpansionOpsStatus, ExpansionOutcome };
