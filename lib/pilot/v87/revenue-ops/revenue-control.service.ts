/**
 * V87 — Revenue control actions (minimal write to revenue ops; reuse V86 for outcomes)
 */

import { getIntakeSession } from "@/lib/pilot/v80";
import {
  assignRenewalOwner,
  markRenewalChurned,
  markRenewalRenewed,
  markRenewalSaved,
} from "@/lib/pilot/v86";

import { resolveExpectedRenewalValue } from "./revenue-forecast.service";
import {
  appendRevenueOpsAction,
  getOrCreateRevenueOpsRecord,
  updateRevenueOpsRecord,
} from "./revenue-ops.store";
import type { RevenueOpsRecord } from "./revenue-ops.types";

function assertReleasedSession(sessionId: string, organizationId: string) {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");
  return session;
}

function ensureRevenueRecord(sessionId: string, organizationId: string): RevenueOpsRecord {
  const value = resolveExpectedRenewalValue(sessionId);
  return getOrCreateRevenueOpsRecord(sessionId, organizationId, value);
}

export function assignRevenueOwner(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  ownerId: string;
  ownerName?: string;
}): RevenueOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureRevenueRecord(input.sessionId, input.organizationId);

  assignRenewalOwner({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    ownerId: input.ownerId,
    ownerName: input.ownerName,
  });

  const updated = updateRevenueOpsRecord(input.sessionId, input.organizationId, {
    ownerId: input.ownerId,
    ownerName: input.ownerName ?? input.ownerId,
    status: "in_control",
  });

  appendRevenueOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "assign_owner",
    note: `收入负责人: ${updated.ownerName}`,
    meta: { ownerId: input.ownerId },
  });

  return updated;
}

export function escalateRevenueCase(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  escalateTo?: string;
}): RevenueOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  const existing = ensureRevenueRecord(input.sessionId, input.organizationId);
  const now = new Date().toISOString();
  const level = existing.escalationLevel + 1;

  const updated = updateRevenueOpsRecord(input.sessionId, input.organizationId, {
    escalationLevel: level,
    escalatedAt: now,
    status: "escalated",
  });

  appendRevenueOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "escalate",
    note: input.note ?? `收入升级 L${level}`,
    meta: { escalationLevel: level, escalateTo: input.escalateTo },
  });

  return updated;
}

export function scheduleRevenueFollowUp(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  scheduledAt: string;
  note?: string;
}): RevenueOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureRevenueRecord(input.sessionId, input.organizationId);

  const updated = updateRevenueOpsRecord(input.sessionId, input.organizationId, {
    scheduledFollowUpAt: input.scheduledAt,
    status: "in_control",
  });

  appendRevenueOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "schedule_follow_up",
    note: input.note ?? `收入跟进计划: ${input.scheduledAt}`,
    meta: { scheduledAt: input.scheduledAt },
  });

  return updated;
}

export function markRevenueSaved(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): RevenueOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureRevenueRecord(input.sessionId, input.organizationId);

  markRenewalSaved({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    note: input.note,
  });

  const now = new Date().toISOString();
  const updated = updateRevenueOpsRecord(input.sessionId, input.organizationId, {
    status: "saved",
    outcome: "saved",
    savedAt: now,
  });

  appendRevenueOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_saved",
    note: input.note ?? "收入已挽留",
    meta: { savedAt: now },
  });

  return updated;
}

export function markRevenueRenewed(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): RevenueOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureRevenueRecord(input.sessionId, input.organizationId);

  markRenewalRenewed({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    note: input.note,
  });

  const now = new Date().toISOString();
  const updated = updateRevenueOpsRecord(input.sessionId, input.organizationId, {
    status: "renewed",
    outcome: "renewed",
    renewedAt: now,
  });

  appendRevenueOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_renewed",
    note: input.note ?? "收入已续约",
    meta: { renewedAt: now },
  });

  return updated;
}

export function markRevenueChurned(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  reason?: string;
}): RevenueOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureRevenueRecord(input.sessionId, input.organizationId);

  markRenewalChurned({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    note: input.note,
    reason: input.reason,
  });

  const now = new Date().toISOString();
  const updated = updateRevenueOpsRecord(input.sessionId, input.organizationId, {
    status: "churned",
    outcome: "churned",
    churnedAt: now,
  });

  appendRevenueOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_churned",
    note: input.note ?? input.reason ?? "收入流失",
    meta: { churnedAt: now, reason: input.reason },
  });

  return updated;
}
