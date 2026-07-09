/**
 * V84 — Follow-up state store (minimal write, separate from delivery data)
 */

import { randomUUID } from "node:crypto";

import type {
  FollowUpRecord,
  FollowUpStatus,
  ResolutionStatus,
  ResponseStatus,
  RetentionActionEntry,
  RetentionActionType,
} from "./follow-up.types";

declare global {
  // eslint-disable-next-line no-var
  var __v84FollowUpRecords: Map<string, FollowUpRecord> | undefined;
  // eslint-disable-next-line no-var
  var __v84RetentionActions: RetentionActionEntry[] | undefined;
}

function followUpStore(): Map<string, FollowUpRecord> {
  globalThis.__v84FollowUpRecords ||= new Map();
  return globalThis.__v84FollowUpRecords;
}

function actionStore(): RetentionActionEntry[] {
  globalThis.__v84RetentionActions ||= [];
  return globalThis.__v84RetentionActions;
}

function recordKey(sessionId: string, organizationId: string): string {
  return `${organizationId}:${sessionId}`;
}

export function getFollowUpRecord(
  sessionId: string,
  organizationId: string,
): FollowUpRecord | null {
  return followUpStore().get(recordKey(sessionId, organizationId)) ?? null;
}

export function getOrCreateFollowUpRecord(
  sessionId: string,
  organizationId: string,
): FollowUpRecord {
  const key = recordKey(sessionId, organizationId);
  const existing = followUpStore().get(key);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record: FollowUpRecord = {
    sessionId,
    organizationId,
    status: "pending",
    responseStatus: "unknown",
    resolutionStatus: "open",
    contactAttempts: 0,
    createdAt: now,
    updatedAt: now,
  };
  followUpStore().set(key, record);
  return record;
}

export function updateFollowUpRecord(
  sessionId: string,
  organizationId: string,
  patch: Partial<
    Pick<
      FollowUpRecord,
      | "ownerId"
      | "ownerName"
      | "status"
      | "responseStatus"
      | "resolutionStatus"
      | "contactAttempts"
      | "lastContactAt"
      | "callbackScheduledAt"
      | "escalatedAt"
      | "resolvedAt"
    >
  >,
): FollowUpRecord {
  const record = getOrCreateFollowUpRecord(sessionId, organizationId);
  const updated: FollowUpRecord = {
    ...record,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  followUpStore().set(recordKey(sessionId, organizationId), updated);
  return updated;
}

export function appendRetentionAction(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: RetentionActionType;
  note?: string;
  meta?: Record<string, unknown>;
}): RetentionActionEntry {
  const entry: RetentionActionEntry = {
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

export function listRetentionActions(sessionId: string): RetentionActionEntry[] {
  return actionStore()
    .filter((e) => e.sessionId === sessionId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function listFollowUpRecordsForOrg(organizationId: string): FollowUpRecord[] {
  return [...followUpStore().values()].filter((r) => r.organizationId === organizationId);
}

export function clearCustomerSuccessStoreForTests(): void {
  globalThis.__v84FollowUpRecords = new Map();
  globalThis.__v84RetentionActions = [];
}

export function deriveFollowUpStatus(
  resolution: ResolutionStatus,
  status: FollowUpStatus,
): FollowUpStatus {
  if (resolution === "resolved") return "resolved";
  if (resolution === "escalated") return "escalated";
  return status;
}

export type { FollowUpStatus, ResponseStatus, ResolutionStatus };
