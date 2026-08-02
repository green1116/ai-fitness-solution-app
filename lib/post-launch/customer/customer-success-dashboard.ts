/**
 * FEAT-36 — Customer Success Dashboard
 * Aggregates Registry / Profile / Lifecycle / Health / Engagement / SupportCase.
 */
import { listCustomers } from "./customer-registry";
import { listCustomerProfiles } from "./customer-profile";
import { listCustomerLifecycle } from "./customer-lifecycle";
import { listCustomerHealth } from "./customer-health";
import {
  listCustomerEngagement,
  hasRecentEngagement,
} from "./customer-engagement";
import { listSupportCase } from "./support-case";

export const FEAT_36_ID = "FEAT-36" as const;
export const CUSTOMER_SUCCESS_DASHBOARD_CAPABILITY =
  "CustomerSuccessDashboard" as const;

export type CustomerSuccessDashboard = Readonly<{
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomers: number;
  healthyCustomers: number;
  openSupportCases: number;
  recentEngagements: number;
  updatedAt: string;
}>;

let cachedDashboard: CustomerSuccessDashboard | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function cloneDashboard(
  row: CustomerSuccessDashboard,
): CustomerSuccessDashboard {
  return { ...row };
}

/**
 * Build (and cache) the customer success dashboard from existing domains.
 */
export function buildCustomerSuccessDashboard(): CustomerSuccessDashboard {
  const customers = listCustomers();
  const profiles = listCustomerProfiles();
  const lifecycles = listCustomerLifecycle();
  const healthRows = listCustomerHealth();
  const engagements = listCustomerEngagement();
  const supportCases = listSupportCase();

  const profiledIds = new Set(profiles.map((p) => p.customerId));
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c) => c.status === "ACTIVE" && profiledIds.has(c.customerId),
  ).length;
  const atRiskCustomers = lifecycles.filter((l) => l.stage === "RISK").length;
  const healthyCustomers = healthRows.filter((h) => h.level === "GOOD").length;

  const openSupportCases = supportCases.filter(
    (c) => c.status === "OPEN" || c.status === "IN_PROGRESS",
  ).length;

  const recentWindowMs = 7 * 24 * 60 * 60 * 1000;
  const recentEngagements = engagements.filter((e) => {
    const ts = Date.parse(e.occurredAt);
    return (
      Number.isFinite(ts) &&
      ts >= Date.now() - recentWindowMs &&
      hasRecentEngagement(e.customerId, recentWindowMs)
    );
  }).length;

  const dashboard: CustomerSuccessDashboard = {
    totalCustomers,
    activeCustomers,
    atRiskCustomers,
    healthyCustomers,
    openSupportCases,
    recentEngagements,
    updatedAt: nowIso(),
  };
  cachedDashboard = dashboard;
  return cloneDashboard(dashboard);
}

/**
 * Get the last built dashboard, or build one if none cached.
 */
export function getCustomerSuccessDashboard(): CustomerSuccessDashboard {
  if (!cachedDashboard) {
    return buildCustomerSuccessDashboard();
  }
  return cloneDashboard(cachedDashboard);
}

/** Test helper — clears cached dashboard. */
export function clearCustomerSuccessDashboard(): void {
  cachedDashboard = null;
}
