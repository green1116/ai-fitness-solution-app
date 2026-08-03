/**
 * FEAT-44 — Optimization Dashboard
 * Aggregates Customer / Retention / Expansion Insights into one snapshot.
 */
import {
  buildCustomerInsights,
  getCustomerInsights,
  type CustomerInsights,
} from "./customer-insights";
import {
  buildRetentionInsights,
  getRetentionInsights,
  type RetentionInsights,
} from "./retention-insights";
import {
  buildExpansionInsights,
  getExpansionInsights,
  type ExpansionInsights,
} from "./expansion-insights";

export const FEAT_44_ID = "FEAT-44" as const;
export const OPTIMIZATION_DASHBOARD_CAPABILITY =
  "OptimizationDashboard" as const;

export type OptimizationDashboard = Readonly<{
  customerInsights: CustomerInsights;
  retentionInsights: RetentionInsights;
  expansionInsights: ExpansionInsights;
  optimizationScore: number;
  updatedAt: string;
}>;

let cachedDashboard: OptimizationDashboard | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function cloneDashboard(row: OptimizationDashboard): OptimizationDashboard {
  return {
    customerInsights: { ...row.customerInsights },
    retentionInsights: { ...row.retentionInsights },
    expansionInsights: { ...row.expansionInsights },
    optimizationScore: row.optimizationScore,
    updatedAt: row.updatedAt,
  };
}

function computeOptimizationScore(
  customer: CustomerInsights,
  retention: RetentionInsights,
  expansion: ExpansionInsights,
): number {
  const customerScore =
    customer.totalCustomers === 0
      ? 0
      : (customer.healthyCustomers / customer.totalCustomers) * 100;
  const retentionScore = retention.retentionRate * 100;
  const expansionScore = expansion.expansionRate * 100;
  return Math.round((customerScore + retentionScore + expansionScore) / 3);
}

/**
 * Build (and cache) the optimization dashboard from insights trio.
 */
export function buildOptimizationDashboard(): OptimizationDashboard {
  const customerInsights = buildCustomerInsights();
  const retentionInsights = buildRetentionInsights();
  const expansionInsights = buildExpansionInsights();

  // Ensure get paths are reused as well.
  void getCustomerInsights().totalCustomers;
  void getRetentionInsights().retentionRate;
  void getExpansionInsights().expansionRate;

  const dashboard: OptimizationDashboard = {
    customerInsights,
    retentionInsights,
    expansionInsights,
    optimizationScore: computeOptimizationScore(
      customerInsights,
      retentionInsights,
      expansionInsights,
    ),
    updatedAt: nowIso(),
  };
  cachedDashboard = dashboard;
  return cloneDashboard(dashboard);
}

/**
 * Get the last built optimization dashboard, or build one if none cached.
 */
export function getOptimizationDashboard(): OptimizationDashboard {
  if (!cachedDashboard) {
    return buildOptimizationDashboard();
  }
  return cloneDashboard(cachedDashboard);
}

/** Test helper — clears cached optimization dashboard. */
export function clearOptimizationDashboard(): void {
  cachedDashboard = null;
}
