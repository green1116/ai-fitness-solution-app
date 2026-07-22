/**
 * Post-Launch P5 — Growth Dashboard
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { computeGrowthAdoptionMetrics } from "./growth.adoption";
import { GROWTH_TRENDS } from "./growth.constants";
import { detectExpansionSignals } from "./growth.expansion";
import { computeRevenueInsights } from "./growth.revenue";
import { computeUsageAnalytics } from "./growth.usage";
import type {
  BuildGrowthDashboardInput,
  GrowthDashboard,
  GrowthTrend,
} from "./growth.types";

const dashboards = new Map<string, GrowthDashboard>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDashboard(dashboard: GrowthDashboard): GrowthDashboard {
  return {
    ...dashboard,
    usage: { ...dashboard.usage },
    adoption: { ...dashboard.adoption },
    expansionSignals: dashboard.expansionSignals.map((s) => ({ ...s })),
    revenue: { ...dashboard.revenue },
  };
}

function combineTrend(trends: GrowthTrend[]): GrowthTrend {
  if (trends.includes("UP")) return "UP";
  if (trends.every((t) => t === "UNKNOWN")) return "UNKNOWN";
  if (trends.includes("DOWN") && !trends.includes("FLAT")) return "DOWN";
  if (trends.includes("FLAT") || trends.includes("DOWN")) return "FLAT";
  return "UNKNOWN";
}

export function buildGrowthDashboard(
  input: BuildGrowthDashboardInput,
): GrowthDashboard {
  const productId = input.productId.trim();
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const id = input.id?.trim() || createId("growdash");
  if (dashboards.has(id)) {
    throw new Error(`growth dashboard already exists: ${id}`);
  }

  const productTenantId = input.productTenantId?.trim();
  const customerHealthProfileId = input.customerHealthProfileId?.trim();

  const usage = computeUsageAnalytics({
    id: `${id}.usage`,
    productId,
    productTenantId,
    customerHealthProfileId,
  });
  const adoption = computeGrowthAdoptionMetrics({
    id: `${id}.adoption`,
    productId,
    customerHealthProfileId,
  });
  const expansionSignals = detectExpansionSignals({
    idPrefix: `${id}.exp`,
    productId,
    productTenantId,
    customerHealthProfileId,
  });
  const revenue = computeRevenueInsights({
    id: `${id}.revenue`,
    productId,
    productTenantId,
  });

  const signalBoost = expansionSignals.reduce(
    (sum, s) => sum + Math.round(s.score * 0.1),
    0,
  );
  const growthScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        usage.apiCallCount * 0.5 +
          usage.billingUsageQuantity * 0.05 +
          adoption.engagementScore * 0.35 +
          revenue.mrr * 0.2 +
          signalBoost,
      ),
    ),
  );

  const trend = combineTrend([
    usage.trend,
    adoption.trend,
    revenue.trend,
  ]);
  if (!(GROWTH_TRENDS as readonly string[]).includes(trend)) {
    throw new Error(`invalid growth trend: ${trend}`);
  }

  const dashboard: GrowthDashboard = {
    id,
    productId,
    productTenantId,
    customerHealthProfileId,
    usage,
    adoption,
    expansionSignals,
    revenue,
    growthScore,
    trend,
    summary: `growthScore=${growthScore} trend=${trend} signals=${expansionSignals.length} mrr=${revenue.mrr}`,
    builtAt: nowIso(),
  };
  dashboards.set(id, dashboard);
  return cloneDashboard(dashboard);
}

export function getGrowthDashboard(id: string): GrowthDashboard | undefined {
  const dashboard = dashboards.get(id.trim());
  return dashboard ? cloneDashboard(dashboard) : undefined;
}

export function listGrowthDashboards(filter?: {
  productId?: string;
}): GrowthDashboard[] {
  let result = [...dashboards.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((d) => d.productId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDashboard);
}

export function clearGrowthDashboards(): void {
  dashboards.clear();
}
