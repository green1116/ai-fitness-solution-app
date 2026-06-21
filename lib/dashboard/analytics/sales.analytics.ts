/**
 * V61 P2 — Sales analytics (V60 P3 Sales Engine)
 */

import { getSignalSummary } from "@/lib/sales/signals/sales.signal.engine";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { predictDealProbability } from "@/lib/sales/ai/deal-predictor.ai";

export function analyzeSales(organizationId?: string) {
  const orgId = organizationId ?? "global";
  const signals = getSignalSummary(orgId === "global" ? "org-sales-aggregate" : orgId);

  const events = getGrowthEventsSnapshot();
  const upgrades = events.filter((e) => e.event === "upgrade.clicked").length;
  const payments = events.filter((e) => e.event === "payment.completed").length;
  const leadToDealRate = upgrades > 0 ? Math.round((payments / upgrades) * 100) : 0;

  const prediction = predictDealProbability({
    organizationId: orgId === "global" ? "org-sales-aggregate" : orgId,
    stage: "PROPOSAL",
  });

  return {
    pipeline: {
      quotes: signals.quoteGenerations + signals.repeatedQuotes,
      budgets: signals.budgetViews,
      tenders: signals.tenderGenerated,
      hotDeals: signals.hotDeals,
    },
    conversion: {
      leadToDealRate,
      aiSuccessRate: prediction.probability,
      predictedCloseDays: prediction.estimatedCloseDays,
    },
    signals,
    dealPrediction: prediction,
  };
}
