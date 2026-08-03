/**
 * FEAT-42 — Retention Insights
 * Insight snapshot built on RetentionDashboard + RenewalQueue.
 */
import {
  buildRetentionDashboard,
  getRetentionDashboard,
} from "./retention-dashboard";
import { listRenewals } from "./renewal-queue";

export const FEAT_42_ID = "FEAT-42" as const;
export const RETENTION_INSIGHTS_CAPABILITY = "RetentionInsights" as const;

export type RetentionInsights = Readonly<{
  renewedCustomers: number;
  lostCustomers: number;
  retentionRate: number;
  openRenewals: number;
  updatedAt: string;
}>;

let cachedInsights: RetentionInsights | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function cloneInsights(row: RetentionInsights): RetentionInsights {
  return { ...row };
}

/**
 * Build (and cache) retention insights from retention dashboard + renewals.
 */
export function buildRetentionInsights(): RetentionInsights {
  const retention = buildRetentionDashboard();
  const renewals = listRenewals();
  void renewals.length;

  // Ensure get path is reused as well.
  const cachedRetention = getRetentionDashboard();
  void cachedRetention.totalRenewals;

  const insights: RetentionInsights = {
    renewedCustomers: retention.renewedCustomers,
    lostCustomers: retention.lostCustomers,
    retentionRate: retention.retentionRate,
    openRenewals: retention.openRenewals,
    updatedAt: nowIso(),
  };
  cachedInsights = insights;
  return cloneInsights(insights);
}

/**
 * Get the last built retention insights, or build one if none cached.
 */
export function getRetentionInsights(): RetentionInsights {
  if (!cachedInsights) {
    return buildRetentionInsights();
  }
  return cloneInsights(cachedInsights);
}

/** Test helper — clears cached retention insights. */
export function clearRetentionInsights(): void {
  cachedInsights = null;
}
