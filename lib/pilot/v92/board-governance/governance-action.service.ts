/**
 * V92 — Governance actions (minimal write to governance state only)
 */

import { getIntakeSession } from "@/lib/pilot/v80";
import { buildPortfolioOpsDashboard } from "@/lib/pilot/v91";

import {
  appendGovernanceAction,
  getOrCreateGovernanceRecord,
  updateGovernanceRecord,
} from "./governance.store";
import type { GovernanceRecord } from "./governance.types";

function assertReleasedSession(sessionId: string, organizationId: string) {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");
  return session;
}

function resolveExpectedValue(sessionId: string, organizationId: string): number {
  const ops = buildPortfolioOpsDashboard(organizationId);
  const item = ops.allItems.find((i) => i.sessionId === sessionId);
  return item?.expectedValue ?? 10_000;
}

function ensureGovernanceRecord(
  sessionId: string,
  organizationId: string,
): GovernanceRecord {
  const value = resolveExpectedValue(sessionId, organizationId);
  return getOrCreateGovernanceRecord(sessionId, organizationId, value);
}

export function assignExecutiveOwner(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  ownerId: string;
  ownerName?: string;
}): GovernanceRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureGovernanceRecord(input.sessionId, input.organizationId);

  const updated = updateGovernanceRecord(input.sessionId, input.organizationId, {
    executiveOwnerId: input.ownerId,
    executiveOwnerName: input.ownerName ?? input.ownerId,
    status: "assigned",
  });

  appendGovernanceAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "assign_executive_owner",
    note: `高管负责人: ${updated.executiveOwnerName}`,
    meta: { ownerId: input.ownerId },
  });

  return updated;
}

export function scheduleBoardReview(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  scheduledAt: string;
  note?: string;
}): GovernanceRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureGovernanceRecord(input.sessionId, input.organizationId);

  const updated = updateGovernanceRecord(input.sessionId, input.organizationId, {
    scheduledBoardReviewAt: input.scheduledAt,
    status: "board_review",
  });

  appendGovernanceAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "schedule_board_review",
    note: input.note ?? `董事会评审: ${input.scheduledAt}`,
    meta: { scheduledAt: input.scheduledAt },
  });

  return updated;
}

export function recordGovernanceDecision(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  decision?: string;
}): GovernanceRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  const existing = ensureGovernanceRecord(input.sessionId, input.organizationId);

  const updated = updateGovernanceRecord(input.sessionId, input.organizationId, {
    decisionCount: existing.decisionCount + 1,
    status: existing.status === "queued" ? "assigned" : existing.status,
  });

  appendGovernanceAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "record_decision",
    note: input.note ?? `董事会决议 #${updated.decisionCount}`,
    meta: { decision: input.decision, decisionCount: updated.decisionCount },
  });

  return updated;
}

export function markGovernanceApproved(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): GovernanceRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureGovernanceRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateGovernanceRecord(input.sessionId, input.organizationId, {
    status: "approved",
    outcome: "approved",
    approvedAt: now,
  });

  appendGovernanceAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_approved",
    note: input.note ?? "董事会已批准",
    meta: { approvedAt: now },
  });

  return updated;
}

export function markGovernanceDeferred(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): GovernanceRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureGovernanceRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateGovernanceRecord(input.sessionId, input.organizationId, {
    status: "deferred",
    outcome: "deferred",
    deferredAt: now,
  });

  appendGovernanceAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_deferred",
    note: input.note ?? "决策已延期",
    meta: { deferredAt: now },
  });

  return updated;
}

export function markGovernanceBlocked(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  reason?: string;
}): GovernanceRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureGovernanceRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateGovernanceRecord(input.sessionId, input.organizationId, {
    status: "blocked",
    outcome: "blocked",
    blockedAt: now,
  });

  appendGovernanceAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_blocked",
    note: input.note ?? input.reason ?? "决策已阻断",
    meta: { blockedAt: now, reason: input.reason },
  });

  return updated;
}
