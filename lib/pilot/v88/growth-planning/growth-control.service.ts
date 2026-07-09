/**
 * V88 — Growth ops actions (minimal write to growth ops state only)
 */

import { getIntakeSession } from "@/lib/pilot/v80";
import { buildAccountHealthDashboard } from "@/lib/pilot/v85";
import { resolveExpectedRenewalValue } from "@/lib/pilot/v87";

import { computeExpansionPotential } from "./growth-forecast.service";
import { buildGrowthPlanningPipeline } from "./growth-pipeline.service";
import {
  appendGrowthOpsAction,
  getOrCreateGrowthOpsRecord,
  updateGrowthOpsRecord,
} from "./growth-ops.store";
import type { GrowthOpsRecord } from "./growth-ops.types";

function assertReleasedSession(sessionId: string, organizationId: string) {
  const session = getIntakeSession(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  if (session.organizationId !== organizationId) throw new Error("ORG_MISMATCH");
  if (!session.signedOff) throw new Error("NOT_RELEASED");
  return session;
}

function ensureGrowthRecord(sessionId: string, organizationId: string): GrowthOpsRecord {
  const baseValue = resolveExpectedRenewalValue(sessionId);
  const health = buildAccountHealthDashboard(organizationId);
  const account = health.accounts.find((a) => a.sessionId === sessionId);
  const expansion = account
    ? computeExpansionPotential(account, baseValue)
    : Math.round(baseValue * 0.1);
  return getOrCreateGrowthOpsRecord(sessionId, organizationId, baseValue, expansion);
}

export function assignGrowthOwner(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  ownerId: string;
  ownerName?: string;
}): GrowthOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureGrowthRecord(input.sessionId, input.organizationId);

  const updated = updateGrowthOpsRecord(input.sessionId, input.organizationId, {
    ownerId: input.ownerId,
    ownerName: input.ownerName ?? input.ownerId,
    status: "planning",
  });

  appendGrowthOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "assign_growth_owner",
    note: `增长负责人: ${updated.ownerName}`,
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
}): GrowthOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureGrowthRecord(input.sessionId, input.organizationId);

  const updated = updateGrowthOpsRecord(input.sessionId, input.organizationId, {
    scheduledExpansionFollowUpAt: input.scheduledAt,
    status: "active",
  });

  appendGrowthOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "schedule_expansion_follow_up",
    note: input.note ?? `扩展跟进计划: ${input.scheduledAt}`,
    meta: { scheduledAt: input.scheduledAt },
  });

  return updated;
}

export function markGrowthRetained(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): GrowthOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureGrowthRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateGrowthOpsRecord(input.sessionId, input.organizationId, {
    status: "retained",
    outcome: "retained",
    retainedAt: now,
  });

  appendGrowthOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_retained",
    note: input.note ?? "客户已留存",
    meta: { retainedAt: now },
  });

  return updated;
}

export function markGrowthExpanded(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
}): GrowthOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureGrowthRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateGrowthOpsRecord(input.sessionId, input.organizationId, {
    status: "expanded",
    outcome: "expanded",
    expandedAt: now,
  });

  appendGrowthOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_expanded",
    note: input.note ?? "收入已扩展",
    meta: { expandedAt: now },
  });

  return updated;
}

export function markGrowthLost(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note?: string;
  reason?: string;
}): GrowthOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  ensureGrowthRecord(input.sessionId, input.organizationId);

  const now = new Date().toISOString();
  const updated = updateGrowthOpsRecord(input.sessionId, input.organizationId, {
    status: "lost",
    outcome: "lost",
    lostAt: now,
  });

  appendGrowthOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "mark_lost",
    note: input.note ?? input.reason ?? "增长机会流失",
    meta: { lostAt: now, reason: input.reason },
  });

  return updated;
}

export function logGrowthOutcome(input: {
  sessionId: string;
  organizationId: string;
  actorId: string;
  note: string;
  meta?: Record<string, unknown>;
}): GrowthOpsRecord {
  assertReleasedSession(input.sessionId, input.organizationId);
  const record = ensureGrowthRecord(input.sessionId, input.organizationId);

  appendGrowthOpsAction({
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "log_outcome",
    note: input.note,
    meta: input.meta,
  });

  return record;
}

export function classifyPlanningQueueForOrg(
  sessionId: string,
  organizationId: string,
): ReturnType<typeof buildGrowthPlanningPipeline>["allItems"][number] | null {
  const pipeline = buildGrowthPlanningPipeline(organizationId);
  return pipeline.allItems.find((i) => i.sessionId === sessionId) ?? null;
}
