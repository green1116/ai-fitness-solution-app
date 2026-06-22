/**
 * V60 P3 — Sales signal engine
 */

import { appendSalesSignal, countSignal, getSalesSignals, type SalesSignalType } from "../sales.events.store";

export function recordSalesSignal(input: {
  organizationId: string;
  customerId?: string;
  userId?: string;
  signal: SalesSignalType;
  meta?: Record<string, unknown>;
}) {
  return appendSalesSignal(input);
}

export function recordQuoteSignal(input: {
  organizationId: string;
  customerId?: string;
  userId?: string;
  quoteId?: string;
  isRepeat?: boolean;
}) {
  const signal: SalesSignalType = input.isRepeat ? "quote.repeated" : "quote.generated";
  return recordSalesSignal({
    organizationId: input.organizationId,
    customerId: input.customerId,
    userId: input.userId,
    signal,
    meta: { quoteId: input.quoteId },
  });
}

export function recordBudgetView(input: {
  organizationId: string;
  customerId?: string;
  userId?: string;
  exported?: boolean;
}) {
  recordSalesSignal({
    organizationId: input.organizationId,
    customerId: input.customerId,
    userId: input.userId,
    signal: "budget.viewed",
  });
  if (input.exported) {
    recordSalesSignal({
      organizationId: input.organizationId,
      customerId: input.customerId,
      signal: "budget.exported",
    });
  }
}

export function recordTenderSignal(input: {
  organizationId: string;
  customerId?: string;
  userId?: string;
  tenderId?: string;
  viewed?: boolean;
}) {
  recordSalesSignal({
    organizationId: input.organizationId,
    customerId: input.customerId,
    userId: input.userId,
    signal: input.viewed ? "tender.viewed" : "tender.generated",
    meta: { tenderId: input.tenderId },
  });
}

export function recordPricingPageVisit(input: { organizationId: string; userId?: string }) {
  return recordSalesSignal({
    organizationId: input.organizationId,
    userId: input.userId,
    signal: "pricing.page_visit",
  });
}

export function recordApiUsageSpike(input: { organizationId: string; userId?: string; calls?: number }) {
  return recordSalesSignal({
    organizationId: input.organizationId,
    userId: input.userId,
    signal: "api.usage_spike",
    meta: { calls: input.calls },
  });
}

export function markHotDeal(input: { organizationId: string; customerId: string; dealId?: string }) {
  return recordSalesSignal({
    organizationId: input.organizationId,
    customerId: input.customerId,
    signal: "hot_deal",
    meta: { dealId: input.dealId },
  });
}

export function getSignalSummary(organizationId: string, customerId?: string) {
  const signals = getSalesSignals({ organizationId, customerId });
  return {
    quoteGenerations: countSignal(organizationId, "quote.generated", customerId),
    repeatedQuotes: countSignal(organizationId, "quote.repeated", customerId),
    budgetViews: countSignal(organizationId, "budget.viewed", customerId),
    budgetExports: countSignal(organizationId, "budget.exported", customerId),
    tenderViews: countSignal(organizationId, "tender.viewed", customerId),
    tenderGenerated: countSignal(organizationId, "tender.generated", customerId),
    pricingVisits: countSignal(organizationId, "pricing.page_visit", customerId),
    apiSpikes: countSignal(organizationId, "api.usage_spike", customerId),
    hotDeals: countSignal(organizationId, "hot_deal", customerId),
    totalSignals: signals.length,
  };
}

export { getSalesSignals, countSignal };
