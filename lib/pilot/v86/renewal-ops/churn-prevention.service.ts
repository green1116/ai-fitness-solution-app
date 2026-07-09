/**
 * V86 — Churn prevention actions (minimal write to renewal ops state only)
 */

import { getIntakeSession } from "@/lib/pilot/v80";

import {
  appendRenewalOpsAction,
  getOrCreateRenewalOpsRecord,
  updateRenewalOpsRecord,
} from "./renewal-ops.store";
import type { RenewalOpsRecord } from "./renewal-ops.types";

function assertReleasedSession(sessionId: string, organizationId: string) {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");
  return session;
}

export function assignRenewalOwner(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  ownerId: string;
  ownerName?: string;
}): RenewalOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  getOrCreateRenewalOpsRecord(input.sessionId, input.organizationId);

  const updated = updateRenewalOpsRecord(input.sessionId, input.organizationId, {
    ownerId: input.ownerId,
    ownerName: input.ownerName ?? input.ownerId,
    status: "in_outreach",
  });

  appendRenewalOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "assign_owner",
    note: `续约负责人: ${updated.ownerName}`,
    meta: { ownerId: input.ownerId },
  });

  return updated;
}

export function scheduleRenewalOutreach(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  scheduledAt: string;
  note?: string;
}): RenewalOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  getOrCreateRenewalOpsRecord(input.sessionId, input.organizationId);

  const updated = updateRenewalOpsRecord(input.sessionId, input.organizationId, {
    scheduledOutreachAt: input.scheduledAt,
    status: "in_outreach",
  });

  appendRenewalOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "schedule_outreach",
    note: input.note ?? `外联计划: ${input.scheduledAt}`,
    meta: { scheduledAt: input.scheduledAt },
  });

  return updated;
}

export function recordRenewalAttempt(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  response?: string;
}): RenewalOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  const existing = getOrCreateRenewalOpsRecord(input.sessionId, input.organizationId);
  const now = new Date().toISOString();

  const updated = updateRenewalOpsRecord(input.sessionId, input.organizationId, {
    outreachAttempts: existing.outreachAttempts + 1,
    lastOutreachAt: now,
    status: "negotiating",
  });

  appendRenewalOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "renewal_attempt",
    note: input.note ?? `第 ${updated.outreachAttempts} 次续约触达`,
    meta: { response: input.response },
  });

  return updated;
}

export function markRenewalSaved(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): RenewalOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  getOrCreateRenewalOpsRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateRenewalOpsRecord(input.sessionId, input.organizationId, {
    status: "saved",
    outcome: "saved",
    savedAt: now,
  });

  appendRenewalOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_saved",
    note: input.note ?? "客户已挽留",
    meta: { savedAt: now },
  });

  return updated;
}

export function markRenewalRenewed(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): RenewalOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  getOrCreateRenewalOpsRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateRenewalOpsRecord(input.sessionId, input.organizationId, {
    status: "renewed",
    outcome: "renewed",
    renewedAt: now,
  });

  appendRenewalOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_renewed",
    note: input.note ?? "续约成功",
    meta: { renewedAt: now },
  });

  return updated;
}

export function markRenewalChurned(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  reason?: string;
}): RenewalOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  getOrCreateRenewalOpsRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateRenewalOpsRecord(input.sessionId, input.organizationId, {
    status: "churned",
    outcome: "churned",
    churnedAt: now,
  });

  appendRenewalOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_churned",
    note: input.note ?? input.reason ?? "客户流失",
    meta: { churnedAt: now, reason: input.reason },
  });

  return updated;
}
