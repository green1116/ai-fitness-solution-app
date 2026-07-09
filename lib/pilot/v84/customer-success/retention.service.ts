/**
 * V84 — Retention actions (minimal write to follow-up state only)
 */

import { getIntakeSession } from "@/lib/pilot/v80";

import {
  appendRetentionAction,
  getOrCreateFollowUpRecord,
  updateFollowUpRecord,
} from "./follow-up.store";
import type { FollowUpRecord } from "./follow-up.types";

function assertReleasedSession(sessionId: string, organizationId: string) {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");
  return session;
}

export function escalateHotAccount(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  reason?: string;
}): FollowUpRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  getOrCreateFollowUpRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateFollowUpRecord(input.sessionId, input.organizationId, {
    status: "escalated",
    resolutionStatus: "escalated",
    escalatedAt: now,
  });

  appendRetentionAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "escalate_hot",
    note: input.reason ?? "高风险账户升级",
    meta: { escalatedAt: now },
  });

  return updated;
}

export function scheduleCallback(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  scheduledAt: string;
  note?: string;
}): FollowUpRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  getOrCreateFollowUpRecord(input.sessionId, input.organizationId);

  const updated = updateFollowUpRecord(input.sessionId, input.organizationId, {
    callbackScheduledAt: input.scheduledAt,
    status: "in_progress",
  });

  appendRetentionAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "schedule_callback",
    note: input.note ?? `回拨 scheduled: ${input.scheduledAt}`,
    meta: { scheduledAt: input.scheduledAt },
  });

  return updated;
}

export function sendReminder(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  channel?: string;
  note?: string;
}): FollowUpRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  const existing = getOrCreateFollowUpRecord(input.sessionId, input.organizationId);

  appendRetentionAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "send_reminder",
    note: input.note ?? "发送跟进提醒",
    meta: { channel: input.channel ?? "in_app" },
  });

  return updateFollowUpRecord(input.sessionId, input.organizationId, {
    status: existing.status === "pending" ? "in_progress" : existing.status,
  });
}

export function markFollowUpResolved(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): FollowUpRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  getOrCreateFollowUpRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateFollowUpRecord(input.sessionId, input.organizationId, {
    status: "resolved",
    resolutionStatus: "resolved",
    resolvedAt: now,
  });

  appendRetentionAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_resolved",
    note: input.note ?? "跟进已解决",
    meta: { resolvedAt: now },
  });

  return updated;
}
