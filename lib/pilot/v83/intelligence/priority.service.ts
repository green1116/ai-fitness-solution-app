/**
 * V83 — Priority scoring (read-only)
 */

import type { DeliveryAlert, SessionSlaStatus, SlaThresholds } from "@/lib/pilot/v82";
import { DEFAULT_SLA_THRESHOLDS } from "@/lib/pilot/v82";

import type { DueBucket, InsightPattern, PriorityLevel } from "./intelligence.types";

export type PriorityScore = {
  score: number;
  priority: PriorityLevel;
  due: DueBucket;
  patterns: InsightPattern[];
};

export function scoreSessionPriority(input: {
  sla: SessionSlaStatus;
  alerts: DeliveryAlert[];
  patterns: InsightPattern[];
  now?: Date;
  thresholds?: SlaThresholds;
}): PriorityScore {
  const now = input.now ?? new Date();
  const thresholds = input.thresholds ?? DEFAULT_SLA_THRESHOLDS;
  const nowMs = now.getTime();
  const releaseMs = new Date(input.sla.signedOffAt).getTime();
  const elapsed = nowMs - releaseMs;

  let score = 0;
  const patterns = [...input.patterns];

  if (input.sla.overallStatus === "breached") score += 90;
  else if (input.sla.overallStatus === "at_risk") score += 60;
  else score += 10;

  if (input.alerts.some((a) => a.severity === "critical")) score += 25;
  if (input.alerts.some((a) => a.kind === "download_failure")) score += 30;
  if (input.alerts.some((a) => a.kind === "no_open_after_release")) score += 20;
  if (input.alerts.some((a) => a.kind === "pending_action_too_long")) score += 15;
  if (input.alerts.some((a) => a.kind === "sla_breach")) score += 20;

  if (patterns.includes("failed_delivery")) score += 15;
  if (patterns.includes("slow_open")) score += 10;
  if (patterns.includes("slow_download")) score += 8;

  score = Math.min(100, score);

  let priority: PriorityLevel;
  if (score >= 70) priority = "high";
  else if (score >= 40) priority = "medium";
  else priority = "low";

  let due: DueBucket;
  if (
    priority === "high" ||
    input.sla.failedDeliveryOverdue ||
    input.sla.overallStatus === "breached"
  ) {
    due = "due_now";
  } else if (
    priority === "medium" ||
    elapsed > thresholds.firstOpenMs * 0.5 ||
    input.sla.overallStatus === "at_risk"
  ) {
    due = "soon";
  } else {
    due = "later";
  }

  return { score, priority, due, patterns };
}

export function comparePriority(a: PriorityScore, b: PriorityScore): number {
  const dueOrder = { due_now: 0, soon: 1, later: 2 };
  const priOrder = { high: 0, medium: 1, low: 2 };
  if (dueOrder[a.due] !== dueOrder[b.due]) return dueOrder[a.due] - dueOrder[b.due];
  if (priOrder[a.priority] !== priOrder[b.priority]) {
    return priOrder[a.priority] - priOrder[b.priority];
  }
  return b.score - a.score;
}
