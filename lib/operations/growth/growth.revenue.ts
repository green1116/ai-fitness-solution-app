/**
 * Post-Launch P5 — Revenue Insights
 * Integrates commercial revenue analytics + billing
 */

import { computeRevenueAnalytics } from "../../product/e12/commercial/commercial.revenue";
import { GROWTH_TRENDS } from "./growth.constants";
import type {
  ComputeRevenueInsightsInput,
  GrowthTrend,
  RevenueInsights,
} from "./growth.types";

const insightsStore = new Map<string, RevenueInsights>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneInsights(insights: RevenueInsights): RevenueInsights {
  return { ...insights };
}

function deriveTrend(mrr: number, apiUsageCount: number): GrowthTrend {
  if (mrr <= 0 && apiUsageCount <= 0) return "UNKNOWN";
  if (mrr >= 50 || apiUsageCount >= 20) return "UP";
  if (mrr > 0) return "FLAT";
  return "DOWN";
}

export function computeRevenueInsights(
  input: ComputeRevenueInsightsInput,
): RevenueInsights {
  const productId = input.productId?.trim();
  const productTenantId = input.productTenantId?.trim();

  const revenue = computeRevenueAnalytics({
    productId,
    productTenantId,
  });

  const revenuePerApiCall =
    revenue.apiUsageCount > 0
      ? Math.round((revenue.mrr / revenue.apiUsageCount) * 100) / 100
      : undefined;

  const trend = deriveTrend(revenue.mrr, revenue.apiUsageCount);
  if (!(GROWTH_TRENDS as readonly string[]).includes(trend)) {
    throw new Error(`invalid growth trend: ${trend}`);
  }

  const id = input.id?.trim() || createId("revins");
  if (insightsStore.has(id)) {
    throw new Error(`revenue insights already exist: ${id}`);
  }

  const insights: RevenueInsights = {
    id,
    productId,
    productTenantId,
    mrr: revenue.mrr,
    arr: revenue.arr,
    totalPaid: revenue.totalPaid,
    totalInvoiced: revenue.totalInvoiced,
    activeSubscriptions: revenue.activeSubscriptions,
    apiUsageCount: revenue.apiUsageCount,
    revenuePerApiCall,
    trend,
    detail: `mrr=${revenue.mrr} arr=${revenue.arr} subs=${revenue.activeSubscriptions}`,
    computedAt: nowIso(),
  };
  insightsStore.set(id, insights);
  return cloneInsights(insights);
}

export function getRevenueInsights(id: string): RevenueInsights | undefined {
  const insights = insightsStore.get(id.trim());
  return insights ? cloneInsights(insights) : undefined;
}

export function listRevenueInsights(filter?: {
  productId?: string;
}): RevenueInsights[] {
  let result = [...insightsStore.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((i) => i.productId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneInsights);
}

export function clearRevenueInsights(): void {
  insightsStore.clear();
}
