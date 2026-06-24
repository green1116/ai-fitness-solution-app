/**
 * V62 P2 — Real user feedback loop
 */

import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  listPilotFeedback,
  type FeedbackCategory,
  type FeedbackStatus,
  type PilotFeedbackRecord,
} from "../store/pilot-feedback.store";

export type FeedbackLoopReport = {
  items: PilotFeedbackRecord[];
  byCategory: Record<FeedbackCategory, number>;
  byStatus: Record<FeedbackStatus, number>;
  openCount: number;
  resolvedCount: number;
  score: number;
  generatedAt: string;
};

export function buildFeedbackLoopReport(organizationId?: string): FeedbackLoopReport {
  const items = listPilotFeedback(organizationId);

  const byCategory = Object.fromEntries(
    FEEDBACK_CATEGORIES.map((c) => [c, 0]),
  ) as Record<FeedbackCategory, number>;
  const byStatus = Object.fromEntries(
    FEEDBACK_STATUSES.map((s) => [s, 0]),
  ) as Record<FeedbackStatus, number>;

  for (const item of items) {
    byCategory[item.category]++;
    byStatus[item.status]++;
  }

  const openCount = items.filter((i) =>
    ["new", "triaged", "in_progress"].includes(i.status),
  ).length;
  const resolvedCount = items.filter((i) =>
    ["resolved", "closed"].includes(i.status),
  ).length;

  const responseRate =
    items.length === 0 ? 100 : Math.round((resolvedCount / items.length) * 100);
  const score = Math.min(100, 50 + responseRate * 0.5);

  return {
    items,
    byCategory,
    byStatus,
    openCount,
    resolvedCount,
    score,
    generatedAt: new Date().toISOString(),
  };
}

export { FEEDBACK_CATEGORIES, FEEDBACK_STATUSES };
export type { FeedbackCategory, FeedbackStatus, PilotFeedbackRecord };
