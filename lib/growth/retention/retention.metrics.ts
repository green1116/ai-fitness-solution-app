/**
 * V60 P1 — Retention metrics
 */

import { getGrowthEventsSnapshot } from "../growth.events.store";

export type RetentionProfile = {
  organizationId: string;
  sessionCount: number;
  projectCount: number;
  quoteCount: number;
  budgetCount: number;
  tenderCount: number;
  lastActiveAt?: number;
  activityFrequency: number;
};

export type UserActivitySummary = {
  userId: string;
  returnSessions: number;
  quoteGenerations: number;
  projectCreations: number;
  lastSeenAt?: number;
};

export function computeRetentionProfile(organizationId: string): RetentionProfile {
  const events = getGrowthEventsSnapshot().filter((e) => e.organizationId === organizationId);

  const sessionCount = events.filter((e) => e.event === "session.return").length;
  const projectCount = events.filter((e) => e.event === "project.created").length;
  const quoteCount = events.filter((e) => e.event === "quote.generated").length;
  const budgetCount = events.filter((e) => e.event === "budget.calculated").length;
  const tenderCount = events.filter((e) => e.event === "tender.generated").length;
  const lastActiveAt = events.reduce((max, e) => Math.max(max, e.timestamp), 0) || undefined;

  const activeDays = new Set(events.map((e) => new Date(e.timestamp).toISOString().slice(0, 10))).size;
  const activityFrequency = activeDays > 0 ? Math.round(events.length / activeDays) : 0;

  return {
    organizationId,
    sessionCount,
    projectCount,
    quoteCount,
    budgetCount,
    tenderCount,
    lastActiveAt,
    activityFrequency,
  };
}

export function summarizeUserActivity(userId: string): UserActivitySummary {
  const events = getGrowthEventsSnapshot().filter((e) => e.userId === userId);
  return {
    userId,
    returnSessions: events.filter((e) => e.event === "session.return").length,
    quoteGenerations: events.filter((e) => e.event === "quote.generated").length,
    projectCreations: events.filter((e) => e.event === "project.created").length,
    lastSeenAt: events.reduce((max, e) => Math.max(max, e.timestamp), 0) || undefined,
  };
}

export function computeRetentionRate(orgIds: string[]): number {
  if (orgIds.length === 0) return 0;
  const retained = orgIds.filter((id) => {
    const profile = computeRetentionProfile(id);
    return profile.sessionCount > 0 || profile.quoteCount > 1;
  }).length;
  return Math.round((retained / orgIds.length) * 100);
}
