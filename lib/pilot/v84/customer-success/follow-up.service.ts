/**
 * V84 — Follow-up workflow service
 */

import { getIntakeSession } from "@/lib/pilot/v80";

import {
  appendRetentionAction,
  getOrCreateFollowUpRecord,
  listRetentionActions,
  updateFollowUpRecord,
} from "./follow-up.store";
import type { FollowUpRecord, ResponseStatus } from "./follow-up.types";

function assertReleasedSession(sessionId: string, organizationId: string) {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");
  return session;
}

export function assignFollowUpOwner(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  ownerId: string;
  ownerName?: string;
}): FollowUpRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  getOrCreateFollowUpRecord(input.sessionId, input.organizationId);

  const updated = updateFollowUpRecord(input.sessionId, input.organizationId, {
    ownerId: input.ownerId,
    ownerName: input.ownerName ?? input.ownerId,
    status: "in_progress",
  });

  appendRetentionAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "assign_owner",
    note: `分配给 ${updated.ownerName}`,
    meta: { ownerId: input.ownerId },
  });

  return updated;
}

export function recordContactAttempt(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  responseStatus?: ResponseStatus;
}): FollowUpRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  const existing = getOrCreateFollowUpRecord(input.sessionId, input.organizationId);
  const now = new Date().toISOString();

  const updated = updateFollowUpRecord(input.sessionId, input.organizationId, {
    contactAttempts: existing.contactAttempts + 1,
    lastContactAt: now,
    status: existing.status === "pending" ? "in_progress" : existing.status,
    responseStatus: input.responseStatus ?? existing.responseStatus,
  });

  appendRetentionAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "contact_attempt",
    note: input.note ?? `第 ${updated.contactAttempts} 次联系`,
    meta: { responseStatus: updated.responseStatus },
  });

  return updated;
}

export function updateFollowUpResponseStatus(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  responseStatus: ResponseStatus;
  note?: string;
}): FollowUpRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  getOrCreateFollowUpRecord(input.sessionId, input.organizationId);

  const updated = updateFollowUpRecord(input.sessionId, input.organizationId, {
    responseStatus: input.responseStatus,
    status: "in_progress",
  });

  appendRetentionAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "contact_attempt",
    note: input.note ?? `响应状态: ${input.responseStatus}`,
    meta: { responseStatus: input.responseStatus },
  });

  return updated;
}

export function getFollowUpState(
  sessionId: string,
  organizationId: string,
): FollowUpRecord {
  assertReleasedSession(sessionId, organizationId);
  return getOrCreateFollowUpRecord(sessionId, organizationId);
}

export function listFollowUpActionHistory(sessionId: string) {
  return listRetentionActions(sessionId);
}
