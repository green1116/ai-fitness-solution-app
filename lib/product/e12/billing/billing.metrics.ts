/**
 * E12-P4 — Commercial Metrics
 */

import { getPricingPlan } from "./billing.plan";
import { evaluateAllQuotaBilling } from "./billing.quota";
import { listBillingSubscriptions } from "./billing.subscription";
import { listInvoices } from "./billing.invoice";
import { listUsageRecords } from "./billing.usage";
import type { CommercialMetrics } from "./billing.types";

function nowIso(): string {
  return new Date().toISOString();
}

function monthlyPrice(basePrice: number, cycle: "MONTHLY" | "ANNUAL"): number {
  return cycle === "ANNUAL" ? basePrice / 12 : basePrice;
}

export function computeCommercialMetrics(filter?: {
  productId?: string;
}): CommercialMetrics {
  const subs = listBillingSubscriptions(
    filter?.productId ? { productId: filter.productId } : undefined,
  );
  const activeSubs = subs.filter((s) => s.status === "ACTIVE");

  let mrr = 0;
  for (const sub of activeSubs) {
    const plan = getPricingPlan(sub.pricingPlanId);
    if (plan) mrr += monthlyPrice(plan.basePrice, plan.billingCycle);
  }

  const usageRecords = listUsageRecords();
  let filteredUsage = usageRecords;
  if (filter?.productId) {
    const tenantIds = new Set(subs.map((s) => s.productTenantId));
    filteredUsage = usageRecords.filter((r) => tenantIds.has(r.productTenantId));
  }

  const invoices = listInvoices();
  let filteredInvoices = invoices;
  if (filter?.productId) {
    const tenantIds = new Set(subs.map((s) => s.productTenantId));
    filteredInvoices = invoices.filter((i) => tenantIds.has(i.productTenantId));
  }

  let overageCount = 0;
  for (const sub of activeSubs) {
    const results = evaluateAllQuotaBilling(sub.id);
    if (results.some((r) => r.status === "OVERAGE")) overageCount += 1;
  }

  return {
    productId: filter?.productId,
    activeSubscriptions: activeSubs.length,
    monthlyRecurringRevenue: Math.round(mrr * 100) / 100,
    totalUsageRecords: filteredUsage.length,
    totalInvoiced: filteredInvoices
      .filter((i) => i.status === "ISSUED" || i.status === "PAID")
      .reduce((sum, i) => sum + i.total, 0),
    totalPaid: filteredInvoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.total, 0),
    overageSubscriptions: overageCount,
    computedAt: nowIso(),
  };
}
