/**
 * V95 — Executive closure actions (minimal write to executive action cache only)
 */

import { getIntakeSession } from "@/lib/pilot/v80";
import { buildDecisionSupportList } from "@/lib/pilot/v94";

import {
  appendExecutiveAction,
  getOrCreateExecutiveActionRecord,
  updateExecutiveActionRecord,
} from "./executive-action.store";
import type { ExecutiveActionRecord } from "./executive-action.types";

function assertReleasedSession(sessionId: string, organizationId: string) {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");
  return session;
}

function ensureActionRecord(sessionId: string, organizationId: string): ExecutiveActionRecord {
  const support = buildDecisionSupportList(organizationId);
  const decision = support.find((d) => d.sessionId === sessionId);
  if (!decision) throw new Error("DECISION_NOT_FOUND");

  return getOrCreateExecutiveActionRecord({
    sessionId,
    organizationId,
    priority: decision.priorityDecision,
    recommendedAction: decision.recommendedAction,
    dueDate: decision.dueDate,
  });
}

export function assignExecutiveActionOwner(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  ownerId: string;
  ownerName?: string;
}): ExecutiveActionRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureActionRecord(input.sessionId, input.organizationId);

  const updated = updateExecutiveActionRecord(input.sessionId, input.organizationId, {
    executiveOwnerId: input.ownerId,
    executiveOwnerName: input.ownerName ?? input.ownerId,
    status: "assigned",
  });

  appendExecutiveAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "assign_executive_owner",
    note: `高管负责人: ${updated.executiveOwnerName}`,
    meta: { ownerId: input.ownerId },
  });

  return updated;
}

export function confirmExecutiveDecision(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): ExecutiveActionRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  const existing = ensureActionRecord(input.sessionId, input.organizationId);

  const updated = updateExecutiveActionRecord(input.sessionId, input.organizationId, {
    status: "confirmed",
    actionCount: existing.actionCount + 1,
  });

  appendExecutiveAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "confirm_decision",
    note: input.note ?? "高管决策已确认",
    meta: { actionCount: updated.actionCount },
  });

  return updated;
}

export function markExecutiveActionActed(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): ExecutiveActionRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureActionRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateExecutiveActionRecord(input.sessionId, input.organizationId, {
    status: "acted",
    outcome: "acted",
    actedAt: now,
  });

  appendExecutiveAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_acted",
    note: input.note ?? "行动已执行",
    meta: { actedAt: now },
  });

  return updated;
}

export function markExecutiveActionDeferred(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): ExecutiveActionRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureActionRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateExecutiveActionRecord(input.sessionId, input.organizationId, {
    status: "deferred",
    outcome: "deferred",
    deferredAt: now,
  });

  appendExecutiveAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_deferred",
    note: input.note ?? "行动已延期",
    meta: { deferredAt: now },
  });

  return updated;
}

export function markExecutiveActionClosed(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): ExecutiveActionRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureActionRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateExecutiveActionRecord(input.sessionId, input.organizationId, {
    status: "closed",
    outcome: "closed",
    closedAt: now,
  });

  appendExecutiveAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_closed",
    note: input.note ?? "治理已闭环",
    meta: { closedAt: now },
  });

  return updated;
}

export function recordExecutiveOutcome(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  outcomeNote: string;
  note?: string;
}): ExecutiveActionRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  const existing = ensureActionRecord(input.sessionId, input.organizationId);

  const updated = updateExecutiveActionRecord(input.sessionId, input.organizationId, {
    outcomeNote: input.outcomeNote,
    actionCount: existing.actionCount + 1,
  });

  appendExecutiveAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "record_outcome",
    note: input.note ?? input.outcomeNote,
    meta: { outcomeNote: input.outcomeNote },
  });

  return updated;
}
