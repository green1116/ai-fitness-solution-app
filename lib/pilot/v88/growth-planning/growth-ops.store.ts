/**
 * V88 — Growth ops state store (minimal write, isolated from upstream layers)
 */

import { randomUUID } from "node:crypto";

import type {
  GrowthOpsActionEntry,
  GrowthOpsActionType,
  GrowthOpsRecord,
  GrowthOpsStatus,
  GrowthOutcome,
} from "./growth-ops.types";

declare global {
  // eslint-disable-next-line no-var
  var __v88GrowthOpsRecords: Map<string, GrowthOpsRecord> | undefined;
  // eslint-disable-next-line no-var
  var __v88GrowthOpsActions: GrowthOpsActionEntry[] | undefined;
}

function opsStore(): Map<string, GrowthOpsRecord> {
  globalThis.__v88GrowthOpsRecords ||= new Map();
  return globalThis.__v88GrowthOpsRecords;
}

function actionStore(): GrowthOpsActionEntry[] {
  globalThis.__v88GrowthOpsActions ||= [];
  return globalThis.__v88GrowthOpsActions;
}

function recordKey(sessionId: string, organizationId: string): string {
  return `${organizationId}:${sessionId}`;
}

export function getGrowthOpsRecord(
  sessionId: string,
  organizationId: string,
): GrowthOpsRecord | null {
  return opsStore().get(recordKey(sessionId, organizationId)) ?? null;
}

export function getOrCreateGrowthOpsRecord(
  sessionId: string,
  organizationId: string,
  baseRenewalValue: number,
  expansionPotential: number,
): GrowthOpsRecord {
  const key = recordKey(sessionId, organizationId);
  const existing = opsStore().get(key);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record: GrowthOpsRecord = {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    baseRenewalValue,
    expansionPotential,
    createdAt: now,
    updatedAt: now,
  };
  opsStore().set(key, record);
  return record;
}

export function updateGrowthOpsRecord(
  sessionId: string,
  organizationId: string,
  patch: Partial<
    Pick<
      GrowthOpsRecord,
      | "ownerId"
      | "ownerName"
      | "status"
      | "outcome"
      | "scheduledExpansionFollowUpAt"
      | "retainedAt"
      | "expandedAt"
      | "lostAt"
    >
  >,
): GrowthOpsRecord {
  const record = opsStore().get(recordKey(sessionId, organizationId));
  if (!record) throw new Error("GROWTH_OPS_NOT_FOUND");
  const updated: GrowthOpsRecord = {
    ...record,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  opsStore().set(recordKey(sessionId, organizationId), updated);
  return updated;
}

export function appendGrowthOpsAction(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: GrowthOpsActionType;
  note?: string;
  meta?: Record<string, unknown>;
}): GrowthOpsActionEntry {
  const entry: GrowthOpsActionEntry = {
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

export function listGrowthOpsActions(sessionId: string): GrowthOpsActionEntry[] {
  return actionStore()
    .filter((e) => e.sessionId === sessionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function listGrowthOpsRecordsForOrg(organizationId: string): GrowthOpsRecord[] {
  return [...opsStore().values()].filter((r) => r.organizationId === organizationId);
}

export function clearGrowthOpsStoreForTests(): void {
  globalThis.__v88GrowthOpsRecords = new Map();
  globalThis.__v88GrowthOpsActions = [];
}

export type { GrowthOpsStatus, GrowthOutcome };
