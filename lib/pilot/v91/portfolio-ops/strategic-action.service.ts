/**
 * V91 — Strategic actions (minimal write to portfolio ops state only)
 */

import { getIntakeSession } from "@/lib/pilot/v80";
import { buildPortfolioDashboard } from "@/lib/pilot/v90";

import {
  appendPortfolioOpsAction,
  getOrCreatePortfolioOpsRecord,
  updatePortfolioOpsRecord,
} from "./portfolio-ops.store";
import type { PortfolioOpsRecord } from "./portfolio-ops.types";

function assertReleasedSession(sessionId: string, organizationId: string) {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");
  return session;
}

function resolveExpectedValue(sessionId: string, organizationId: string): number {
  const portfolio = buildPortfolioDashboard(organizationId);
  const account = portfolio.rankedAccounts.find((a) => a.sessionId === sessionId);
  return account?.expectedValue ?? 10_000;
}

function ensureOpsRecord(sessionId: string, organizationId: string): PortfolioOpsRecord {
  const value = resolveExpectedValue(sessionId, organizationId);
  return getOrCreatePortfolioOpsRecord(sessionId, organizationId, value);
}

export function assignPortfolioOwner(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  ownerId: string;
  ownerName?: string;
}): PortfolioOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureOpsRecord(input.sessionId, input.organizationId);

  const updated = updatePortfolioOpsRecord(input.sessionId, input.organizationId, {
    ownerId: input.ownerId,
    ownerName: input.ownerName ?? input.ownerId,
    status: "assigned",
  });

  appendPortfolioOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "assign_portfolio_owner",
    note: `组合负责人: ${updated.ownerName}`,
    meta: { ownerId: input.ownerId },
  });

  return updated;
}

export function scheduleStrategicReview(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  scheduledAt: string;
  note?: string;
}): PortfolioOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureOpsRecord(input.sessionId, input.organizationId);

  const updated = updatePortfolioOpsRecord(input.sessionId, input.organizationId, {
    scheduledReviewAt: input.scheduledAt,
    status: "in_review",
  });

  appendPortfolioOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "schedule_strategic_review",
    note: input.note ?? `战略评审: ${input.scheduledAt}`,
    meta: { scheduledAt: input.scheduledAt },
  });

  return updated;
}

export function recordStrategicAction(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): PortfolioOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  const existing = ensureOpsRecord(input.sessionId, input.organizationId);

  const updated = updatePortfolioOpsRecord(input.sessionId, input.organizationId, {
    actionCount: existing.actionCount + 1,
    status: existing.status === "queued" ? "assigned" : existing.status,
  });

  appendPortfolioOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "record_action",
    note: input.note ?? `战略行动 #${updated.actionCount}`,
    meta: { actionCount: updated.actionCount },
  });

  return updated;
}

export function markPortfolioCompleted(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): PortfolioOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureOpsRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updatePortfolioOpsRecord(input.sessionId, input.organizationId, {
    status: "completed",
    outcome: "completed",
    completedAt: now,
  });

  appendPortfolioOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_completed",
    note: input.note ?? "战略行动已完成",
    meta: { completedAt: now },
  });

  return updated;
}

export function markPortfolioDeferred(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): PortfolioOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureOpsRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updatePortfolioOpsRecord(input.sessionId, input.organizationId, {
    status: "deferred",
    outcome: "deferred",
    deferredAt: now,
  });

  appendPortfolioOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_deferred",
    note: input.note ?? "战略行动已延期",
    meta: { deferredAt: now },
  });

  return updated;
}

export function markPortfolioLost(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  reason?: string;
}): PortfolioOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureOpsRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updatePortfolioOpsRecord(input.sessionId, input.organizationId, {
    status: "lost",
    outcome: "lost",
    lostAt: now,
  });

  appendPortfolioOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_lost",
    note: input.note ?? input.reason ?? "战略机会流失",
    meta: { lostAt: now, reason: input.reason },
  });

  return updated;
}
