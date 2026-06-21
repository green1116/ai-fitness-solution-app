/**
 * V64 P3 — Upsell engine
 */

import type { SaasPlan } from "@/lib/saas/types";
import { getPricingTier, buildUpgradeMessage } from "@/lib/growth/conversion/pricing.strategy";
import { aggregateRevenueMetrics } from "../core/revenue.context";
import { computeRevenueThresholds } from "../revenue.types";
import type { UpsellTrigger } from "../revenue.types";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { recordUpgradeEvent } from "./upgrade.tracker";

const UPSELL_PATHS: { id: string; fromFeature: string; fromPlan: SaasPlan | "FREE"; toPlan: SaasPlan }[] = [
  { id: "quote-budget", fromFeature: "Quote", fromPlan: "BASIC", toPlan: "PRO" },
  { id: "budget-tender", fromFeature: "Budget", fromPlan: "PRO", toPlan: "ENTERPRISE" },
  { id: "basic-pro", fromFeature: "Basic", fromPlan: "BASIC", toPlan: "PRO" },
  { id: "pro-enterprise", fromFeature: "Pro", fromPlan: "PRO", toPlan: "ENTERPRISE" },
];

export function triggerUpsell(context?: { feature?: string; currentPlan?: SaasPlan | "FREE" }): UpsellTrigger[] {
  const metrics = aggregateRevenueMetrics();
  const thresholds = computeRevenueThresholds(metrics);
  const events = getGrowthEventsSnapshot();
  const triggers: UpsellTrigger[] = [];

  for (const path of UPSELL_PATHS) {
    if (context?.feature && !path.fromFeature.toLowerCase().includes(context.feature.toLowerCase())) {
      continue;
    }
    if (context?.currentPlan && context.currentPlan !== path.fromPlan) continue;

    const tier = getPricingTier(path.toPlan);
    let priority = 50;

    if (path.id === "quote-budget" && events.some((e) => e.event === "quote.generated")) {
      priority = 90;
    }
    if (path.id === "budget-tender" && events.some((e) => e.event === "budget.calculated")) {
      priority = 85;
    }
    if (metrics.ltv < thresholds.ltvLow) priority += 10;
    if (metrics.arpu < thresholds.arpuLow) priority += 8;

    triggers.push({
      id: path.id,
      fromFeature: path.fromFeature,
      toPlan: path.toPlan,
      message: buildUpgradeMessage(
        path.fromPlan === "FREE" ? "BASIC" : path.fromPlan,
        path.toPlan,
      ) + ` — ${tier.headline}`,
      priority,
    });
  }

  return triggers.sort((a, b) => b.priority - a.priority);
}

export function fireUpsellImpression(triggerId: string, fromPlan: SaasPlan | "FREE", toPlan: SaasPlan) {
  recordUpgradeEvent({ triggerId, fromPlan, toPlan, eventType: "impression" });
}

export function triggerUpsellFlow(): UpsellTrigger[] {
  const metrics = aggregateRevenueMetrics();
  const thresholds = computeRevenueThresholds(metrics);
  if (metrics.ltv < thresholds.ltvLow || metrics.upgradeRate < thresholds.upgradeRateLow) {
    return triggerUpsell();
  }
  return triggerUpsell().slice(0, 2);
}
