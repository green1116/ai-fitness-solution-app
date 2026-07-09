/**
 * V89 — Expansion ops actions (minimal write to expansion ops state only)
 */

import { getIntakeSession } from "@/lib/pilot/v80";
import { buildAccountHealthDashboard } from "@/lib/pilot/v85";
import { resolveExpectedRenewalValue } from "@/lib/pilot/v87";
import {
  buildGrowthPlanningDashboard,
  computeExpansionPotential,
} from "@/lib/pilot/v88";

import {
  appendExpansionOpsAction,
  getOrCreateExpansionOpsRecord,
  updateExpansionOpsRecord,
} from "./expansion-ops.store";
import type { ExpansionOpsRecord } from "./expansion-ops.types";

function assertReleasedSession(sessionId: string, organizationId: string) {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");
  return session;
}

function resolveExpansionOpportunity(sessionId: string, organizationId: string): number {
  const growth = buildGrowthPlanningDashboard(organizationId);
  const item = growth.allItems.find((i) => i.sessionId === sessionId);
  if (item) return item.expansionPotential;

  const health = buildAccountHealthDashboard(organizationId);
  const account = health.accounts.find((a) => a.sessionId === sessionId);
  if (!account) return 5000;
  const base = resolveExpectedRenewalValue(sessionId);
  return computeExpansionPotential(account, base);
}

function ensureExpansionRecord(
  sessionId: string,
  organizationId: string,
): ExpansionOpsRecord {
  const opportunity = resolveExpansionOpportunity(sessionId, organizationId);
  return getOrCreateExpansionOpsRecord(sessionId, organizationId, opportunity);
}

export function assignExpansionOwner(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  ownerId: string;
  ownerName?: string;
}): ExpansionOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureExpansionRecord(input.sessionId, input.organizationId);

  const updated = updateExpansionOpsRecord(input.sessionId, input.organizationId, {
    ownerId: input.ownerId,
    ownerName: input.ownerName ?? input.ownerId,
    status: "qualified",
  });

  appendExpansionOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "assign_owner",
    note: `扩展负责人: ${updated.ownerName}`,
    meta: { ownerId: input.ownerId },
  });

  return updated;
}

export function scheduleExpansionFollowUp(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  scheduledAt: string;
  note?: string;
}): ExpansionOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureExpansionRecord(input.sessionId, input.organizationId);

  const updated = updateExpansionOpsRecord(input.sessionId, input.organizationId, {
    scheduledFollowUpAt: input.scheduledAt,
    status: "qualified",
  });

  appendExpansionOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "schedule_expansion_follow_up",
    note: input.note ?? `扩展跟进: ${input.scheduledAt}`,
    meta: { scheduledAt: input.scheduledAt },
  });

  return updated;
}

export function recordExpansionProposal(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  proposalValue?: number;
}): ExpansionOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  const existing = ensureExpansionRecord(input.sessionId, input.organizationId);
  const now = new Date().toISOString();

  const updated = updateExpansionOpsRecord(input.sessionId, input.organizationId, {
    proposalCount: existing.proposalCount + 1,
    lastProposalAt: now,
    status: "proposing",
  });

  appendExpansionOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "record_proposal",
    note: input.note ?? `第 ${updated.proposalCount} 次扩展提案`,
    meta: { proposalValue: input.proposalValue, proposalCount: updated.proposalCount },
  });

  return updated;
}

export function markExpansionExpanded(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): ExpansionOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureExpansionRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateExpansionOpsRecord(input.sessionId, input.organizationId, {
    status: "expanded",
    outcome: "expanded",
    expandedAt: now,
  });

  appendExpansionOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_expanded",
    note: input.note ?? "扩展成功",
    meta: { expandedAt: now },
  });

  return updated;
}

export function markExpansionRetained(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): ExpansionOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureExpansionRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateExpansionOpsRecord(input.sessionId, input.organizationId, {
    status: "retained",
    outcome: "retained",
    retainedAt: now,
  });

  appendExpansionOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_retained",
    note: input.note ?? "客户已留存",
    meta: { retainedAt: now },
  });

  return updated;
}

export function markExpansionLost(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  reason?: string;
}): ExpansionOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureExpansionRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateExpansionOpsRecord(input.sessionId, input.organizationId, {
    status: "lost",
    outcome: "lost",
    lostAt: now,
  });

  appendExpansionOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_lost",
    note: input.note ?? input.reason ?? "扩展机会流失",
    meta: { lostAt: now, reason: input.reason },
  });

  return updated;
}
