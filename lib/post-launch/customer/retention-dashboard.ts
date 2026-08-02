/**
 * FEAT-40 — Retention Dashboard
 * Aggregates Registry→ExpansionQueue domains into a retention snapshot.
 */
import { listSupportCase } from "./support-case";
import { getCustomerSuccessDashboard } from "./customer-success-dashboard";
import { getCustomerAnalytics } from "./customer-analytics";
import { listRenewals } from "./renewal-queue";
import { listExpansions } from "./expansion-queue";

export const FEAT_40_ID = "FEAT-40" as const;
export const RETENTION_DASHBOARD_CAPABILITY = "RetentionDashboard" as const;

export type RetentionDashboard = Readonly<{
  totalRenewals: number;
  renewedCustomers: number;
  lostCustomers: number;
  openRenewals: number;
  openExpansions: number;
  wonExpansions: number;
  retentionRate: number;
  updatedAt: string;
}>;

let cachedDashboard: RetentionDashboard | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function cloneDashboard(row: RetentionDashboard): RetentionDashboard {
  return { ...row };
}

const OPEN_PIPELINE = new Set(["OPEN", "CONTACTED", "NEGOTIATING"]);

/**
 * Build (and cache) the retention dashboard from renewal + expansion queues.
 */
export function buildRetentionDashboard(): RetentionDashboard {
  // Touch Registry→Analytics / Support stack for reuse.
  const dash = getCustomerSuccessDashboard();
  const analytics = getCustomerAnalytics();
  const supportCases = listSupportCase();
  void dash.totalCustomers;
  void analytics.churnedCustomers;
  void supportCases.length;

  const renewals = listRenewals();
  const expansions = listExpansions();

  const totalRenewals = renewals.length;
  const renewedCustomers = renewals.filter(
    (r) => r.renewalStatus === "RENEWED",
  ).length;
  const lostCustomers = renewals.filter(
    (r) => r.renewalStatus === "LOST",
  ).length;
  const openRenewals = renewals.filter((r) =>
    OPEN_PIPELINE.has(r.renewalStatus),
  ).length;
  const openExpansions = expansions.filter((e) =>
    OPEN_PIPELINE.has(e.expansionStatus),
  ).length;
  const wonExpansions = expansions.filter(
    (e) => e.expansionStatus === "WON",
  ).length;

  const closed = renewedCustomers + lostCustomers;
  const retentionRate = closed === 0 ? 0 : renewedCustomers / closed;

  const dashboard: RetentionDashboard = {
    totalRenewals,
    renewedCustomers,
    lostCustomers,
    openRenewals,
    openExpansions,
    wonExpansions,
    retentionRate,
    updatedAt: nowIso(),
  };
  cachedDashboard = dashboard;
  return cloneDashboard(dashboard);
}

/**
 * Get the last built retention dashboard, or build one if none cached.
 */
export function getRetentionDashboard(): RetentionDashboard {
  if (!cachedDashboard) {
    return buildRetentionDashboard();
  }
  return cloneDashboard(cachedDashboard);
}

/** Test helper — clears cached retention dashboard. */
export function clearRetentionDashboard(): void {
  cachedDashboard = null;
}
