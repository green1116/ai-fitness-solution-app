/**
 * E12-P7 — Revenue Analytics
 * Integrates billing commercial metrics and API usage
 */

import { getApiUsageCount } from "../api/api.usage";
import { computeCommercialMetrics } from "../billing/billing.metrics";
import type { RevenueAnalytics } from "./commercial.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function computeRevenueAnalytics(filter?: {
  productId?: string;
  productTenantId?: string;
}): RevenueAnalytics {
  const billing = computeCommercialMetrics(
    filter?.productId ? { productId: filter.productId } : undefined,
  );

  const apiUsageCount = getApiUsageCount(
    filter?.productTenantId
      ? { productTenantId: filter.productTenantId }
      : filter?.productId
        ? undefined
        : undefined,
  );

  return {
    productId: filter?.productId,
    mrr: billing.monthlyRecurringRevenue,
    arr: Math.round(billing.monthlyRecurringRevenue * 12 * 100) / 100,
    totalPaid: billing.totalPaid,
    totalInvoiced: billing.totalInvoiced,
    activeSubscriptions: billing.activeSubscriptions,
    overageSubscriptions: billing.overageSubscriptions,
    apiUsageCount,
    computedAt: nowIso(),
  };
}
