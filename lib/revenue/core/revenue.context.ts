/**
 * V64 P3 — Revenue context from V60 growth events (read-only)
 */

import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";
import type { RevenueMetrics } from "../revenue.types";
import type { SaasPlan } from "@/lib/saas/types";

export function countPaidUsersByPlan(): Record<SaasPlan, number> {
  const events = getGrowthEventsSnapshot().filter((e) => e.event === "payment.completed");
  const counts: Record<SaasPlan, number> = { BASIC: 0, PRO: 0, ENTERPRISE: 0 };
  const seen = new Set<string>();

  for (const e of events) {
    const orgId = e.organizationId;
    if (!orgId || seen.has(orgId)) continue;
    seen.add(orgId);
    const plan = String((e.meta as { plan?: string })?.plan ?? "PRO").toUpperCase() as SaasPlan;
    if (plan in counts) counts[plan] += 1;
    else counts.PRO += 1;
  }

  return counts;
}

export function aggregateRevenueMetrics(): RevenueMetrics {
  const growth = aggregateGrowthMetrics();
  const planCounts = countPaidUsersByPlan();
  const paidUsers = Math.max(
    growth.paidUsers,
    planCounts.BASIC + planCounts.PRO + planCounts.ENTERPRISE,
    1,
  );

  const mrr =
    planCounts.BASIC * getPricingTier("BASIC").monthlyPriceCny +
    planCounts.PRO * getPricingTier("PRO").monthlyPriceCny +
    planCounts.ENTERPRISE * getPricingTier("ENTERPRISE").monthlyPriceCny;

  const events = getGrowthEventsSnapshot();
  const upgrades = events.filter((e) => e.event === "upgrade.clicked").length;
  const visitors = Math.max(growth.visitors, 1);
  const signups = Math.max(growth.signups, 0);

  const arpu = paidUsers > 0 ? Math.round(mrr / paidUsers) : 0;
  const conversionRate = Math.round((signups / visitors) * 100);
  const upgradeRate = paidUsers > 0 ? Math.round((upgrades / paidUsers) * 100) : 0;

  const churn = growth.churnRate / 100;
  const ltv = churn > 0 ? Math.round(arpu / churn) : arpu * 24;

  return {
    mrr,
    arr: mrr * 12,
    arpu,
    ltv,
    conversionRate,
    upgradeRate,
  };
}

export function detectEnterpriseUsage(): number {
  const events = getGrowthEventsSnapshot();
  return events.filter((e) => {
    if (e.event === "tender.generated") return true;
    return (
      e.event === "quote.generated" &&
      (e.meta as { plan?: string })?.plan === "ENTERPRISE"
    );
  }).length;
}
