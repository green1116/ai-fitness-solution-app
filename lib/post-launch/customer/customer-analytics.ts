/**
 * FEAT-37 — Customer Analytics
 * Analytics snapshot built on Registry→Dashboard domains.
 */
import { listCustomerLifecycle } from "./customer-lifecycle";
import {
  buildCustomerSuccessDashboard,
  getCustomerSuccessDashboard,
} from "./customer-success-dashboard";

export const FEAT_37_ID = "FEAT-37" as const;
export const CUSTOMER_ANALYTICS_CAPABILITY = "CustomerAnalytics" as const;

export type CustomerAnalytics = Readonly<{
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomers: number;
  churnedCustomers: number;
  healthyCustomers: number;
  openSupportCases: number;
  recentEngagements: number;
  updatedAt: string;
}>;

let cachedAnalytics: CustomerAnalytics | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function cloneAnalytics(row: CustomerAnalytics): CustomerAnalytics {
  return { ...row };
}

/**
 * Build (and cache) customer analytics from dashboard + lifecycle.
 */
export function buildCustomerAnalytics(): CustomerAnalytics {
  const dashboard = buildCustomerSuccessDashboard();
  const lifecycles = listCustomerLifecycle();
  const churnedCustomers = lifecycles.filter(
    (l) => l.stage === "CHURNED",
  ).length;

  // Ensure dashboard get path is reused as well.
  const cachedDash = getCustomerSuccessDashboard();
  void cachedDash.totalCustomers;

  const analytics: CustomerAnalytics = {
    totalCustomers: dashboard.totalCustomers,
    activeCustomers: dashboard.activeCustomers,
    atRiskCustomers: dashboard.atRiskCustomers,
    churnedCustomers,
    healthyCustomers: dashboard.healthyCustomers,
    openSupportCases: dashboard.openSupportCases,
    recentEngagements: dashboard.recentEngagements,
    updatedAt: nowIso(),
  };
  cachedAnalytics = analytics;
  return cloneAnalytics(analytics);
}

/**
 * Get the last built analytics, or build one if none cached.
 */
export function getCustomerAnalytics(): CustomerAnalytics {
  if (!cachedAnalytics) {
    return buildCustomerAnalytics();
  }
  return cloneAnalytics(cachedAnalytics);
}

/** Test helper — clears cached analytics. */
export function clearCustomerAnalytics(): void {
  cachedAnalytics = null;
}
