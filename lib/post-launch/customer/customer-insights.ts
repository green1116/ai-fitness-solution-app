/**
 * FEAT-41 — Customer Insights
 * Insight snapshot built on Analytics + RetentionDashboard.
 */
import {
  buildCustomerAnalytics,
  getCustomerAnalytics,
} from "./customer-analytics";
import {
  buildRetentionDashboard,
  getRetentionDashboard,
} from "./retention-dashboard";

export const FEAT_41_ID = "FEAT-41" as const;
export const CUSTOMER_INSIGHTS_CAPABILITY = "CustomerInsights" as const;

export type CustomerInsights = Readonly<{
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomers: number;
  healthyCustomers: number;
  churnedCustomers: number;
  updatedAt: string;
}>;

let cachedInsights: CustomerInsights | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function cloneInsights(row: CustomerInsights): CustomerInsights {
  return { ...row };
}

/**
 * Build (and cache) customer insights from analytics + retention.
 */
export function buildCustomerInsights(): CustomerInsights {
  const analytics = buildCustomerAnalytics();
  const retention = buildRetentionDashboard();
  void retention.totalRenewals;

  // Ensure get paths are reused as well.
  const cachedAnalytics = getCustomerAnalytics();
  const cachedRetention = getRetentionDashboard();
  void cachedAnalytics.totalCustomers;
  void cachedRetention.retentionRate;

  const insights: CustomerInsights = {
    totalCustomers: analytics.totalCustomers,
    activeCustomers: analytics.activeCustomers,
    atRiskCustomers: analytics.atRiskCustomers,
    healthyCustomers: analytics.healthyCustomers,
    churnedCustomers: analytics.churnedCustomers,
    updatedAt: nowIso(),
  };
  cachedInsights = insights;
  return cloneInsights(insights);
}

/**
 * Get the last built insights, or build one if none cached.
 */
export function getCustomerInsights(): CustomerInsights {
  if (!cachedInsights) {
    return buildCustomerInsights();
  }
  return cloneInsights(cachedInsights);
}

/** Test helper — clears cached insights. */
export function clearCustomerInsights(): void {
  cachedInsights = null;
}
