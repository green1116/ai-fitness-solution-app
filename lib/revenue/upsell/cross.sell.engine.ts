/**
 * V64 P3 — Cross-sell engine
 */

import { aggregateRevenueMetrics, detectEnterpriseUsage } from "../core/revenue.context";
import { computeRevenueThresholds } from "../revenue.types";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";

const CROSS_SELL_CATALOG = [
  { id: "api-access", label: "API access", minPlan: "ENTERPRISE" as const },
  { id: "enterprise-features", label: "Enterprise features", minPlan: "ENTERPRISE" as const },
  { id: "bulk-generation", label: "Bulk generation", minPlan: "PRO" as const },
  { id: "white-label", label: "White-label system", minPlan: "ENTERPRISE" as const },
];

export function triggerCrossSell(context?: { organizationId?: string }): string[] {
  const metrics = aggregateRevenueMetrics();
  const thresholds = computeRevenueThresholds(metrics);
  const events = getGrowthEventsSnapshot();
  const enterpriseUsage = detectEnterpriseUsage();
  const offers: string[] = [];

  const quoteVolume = events.filter((e) => e.event === "quote.generated").length;
  const tenderVolume = events.filter((e) => e.event === "tender.generated").length;

  if (quoteVolume > 20 || metrics.mrr > 2000) {
    offers.push(`Recommend: ${CROSS_SELL_CATALOG.find((c) => c.id === "bulk-generation")!.label}`);
  }

  if (enterpriseUsage >= thresholds.enterpriseUsageMin || tenderVolume > 5) {
    offers.push(`Recommend: ${CROSS_SELL_CATALOG.find((c) => c.id === "api-access")!.label}`);
    offers.push(`Recommend: ${CROSS_SELL_CATALOG.find((c) => c.id === "enterprise-features")!.label}`);
  }

  if (metrics.arpu > thresholds.arpuLow * 1.5) {
    offers.push(`Recommend: ${CROSS_SELL_CATALOG.find((c) => c.id === "white-label")!.label}`);
  }

  if (context?.organizationId && enterpriseUsage > 0) {
    offers.push("Recommend: Enterprise seat expansion for multi-workspace");
  }

  if (offers.length === 0) {
    offers.push("Monitor usage for cross-sell eligibility");
  }

  return offers;
}
