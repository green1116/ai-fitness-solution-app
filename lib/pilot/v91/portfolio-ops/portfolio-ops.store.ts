/**
 * V91 — Portfolio ops state store (minimal write, isolated from upstream layers)
 */

import { randomUUID } from "node:crypto";

import type {
  PortfolioOpsActionEntry,
  PortfolioOpsActionType,
  PortfolioOpsRecord,
  PortfolioOpsStatus,
  PortfolioOpsOutcome,
} from "./portfolio-ops.types";

declare global {
  // eslint-disable-next-line no-var
  var __v91PortfolioOpsRecords: Map<string, PortfolioOpsRecord> | undefined;
  // eslint-disable-next-line no-var
  var __v91PortfolioOpsActions: PortfolioOpsActionEntry[] | undefined;
}

function opsStore(): Map<string, PortfolioOpsRecord> {
  globalThis.__v91PortfolioOpsRecords ||= new Map();
  return globalThis.__v91PortfolioOpsRecords;
}

function actionStore(): PortfolioOpsActionEntry[] {
  globalThis.__v91PortfolioOpsActions ||= [];
  return globalThis.__v91PortfolioOpsActions;
}

function recordKey(sessionId: string, organizationId: string): string {
  return `${organizationId}:${sessionId}`;
}

export function getPortfolioOpsRecord(
  sessionId: string,
  organizationId: string,
): PortfolioOpsRecord | null {
  return opsStore().get(recordKey(sessionId, organizationId)) ?? null;
}

export function getOrCreatePortfolioOpsRecord(
  sessionId: string,
  organizationId: string,
  expectedValue: number,
): PortfolioOpsRecord {
  const key = recordKey(sessionId, organizationId);
  const existing = opsStore().get(key);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record: PortfolioOpsRecord = {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    expectedValue,
    actionCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  opsStore().set(key, record);
  return record;
}

export function updatePortfolioOpsRecord(
  sessionId: string,
  organizationId: string,
  patch: Partial<
    Pick<
      PortfolioOpsRecord,
      | "ownerId"
      | "ownerName"
      | "status"
      | "outcome"
      | "scheduledReviewAt"
      | "completedAt"
      | "deferredAt"
      | "lostAt"
      | "actionCount"
    >
  >,
): PortfolioOpsRecord {
  const record = opsStore().get(recordKey(sessionId, organizationId));
  if (!record) throw new Error("PORTFOLIO_OPS_NOT_FOUND");
  const updated: PortfolioOpsRecord = {
    ...record,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  opsStore().set(recordKey(sessionId, organizationId), updated);
  return updated;
}

export function appendPortfolioOpsAction(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: PortfolioOpsActionType;
  note?: string;
  meta?: Record<string, unknown>;
}): PortfolioOpsActionEntry {
  const entry: PortfolioOpsActionEntry = {
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

export function listPortfolioOpsActions(sessionId: string): PortfolioOpsActionEntry[] {
  return actionStore()
    .filter((e) => e.sessionId === sessionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function listPortfolioOpsRecordsForOrg(organizationId: string): PortfolioOpsRecord[] {
  return [...opsStore().values()].filter((r) => r.organizationId === organizationId);
}

export function clearPortfolioOpsStoreForTests(): void {
  globalThis.__v91PortfolioOpsRecords = new Map();
  globalThis.__v91PortfolioOpsActions = [];
}

export type { PortfolioOpsStatus, PortfolioOpsOutcome };
