/**
 * V60 P1 — Churn prediction (heuristic model)
 */

import { computeRetentionProfile } from "./retention.metrics";

export type ChurnRisk = "low" | "medium" | "high";

export type ChurnPrediction = {
  organizationId: string;
  churnRisk: ChurnRisk;
  churnScore: number;
  signals: string[];
};

const INACTIVE_MS = 14 * 24 * 60 * 60 * 1000;

export function predictChurn(organizationId: string): ChurnPrediction {
  const profile = computeRetentionProfile(organizationId);
  const signals: string[] = [];
  let score = 0;

  if (!profile.lastActiveAt || Date.now() - profile.lastActiveAt > INACTIVE_MS) {
    score += 40;
    signals.push("inactive_14d");
  }
  if (profile.quoteCount === 0) {
    score += 30;
    signals.push("no_quotes");
  }
  if (profile.sessionCount === 0) {
    score += 20;
    signals.push("no_return_sessions");
  }
  if (profile.activityFrequency < 1) {
    score += 10;
    signals.push("low_activity_frequency");
  }

  const churnRisk: ChurnRisk = score >= 60 ? "high" : score >= 30 ? "medium" : "low";

  return { organizationId, churnRisk, churnScore: Math.min(100, score), signals };
}

export function computeChurnRate(orgIds: string[]): number {
  if (orgIds.length === 0) return 0;
  const atRisk = orgIds.filter((id) => predictChurn(id).churnRisk === "high").length;
  return Math.round((atRisk / orgIds.length) * 100);
}
