/**
 * V64 P3 — ARPU optimizer
 */

import { analyzeARPU } from "./arpu.analyzer";
import { aggregateRevenueMetrics } from "../core/revenue.context";
import { computeRevenueThresholds } from "../revenue.types";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";

export function increaseARPU(): {
  actions: string[];
  upsellPressure: "low" | "medium" | "high";
} {
  const analysis = analyzeARPU();
  const metrics = aggregateRevenueMetrics();
  const thresholds = computeRevenueThresholds(metrics);
  const events = getGrowthEventsSnapshot();
  const highUsage = events.filter(
    (e) => e.event === "quote.generated" || e.event === "budget.calculated",
  ).length;

  const actions: string[] = [];
  let upsellPressure: "low" | "medium" | "high" = "low";

  if (metrics.arpu < thresholds.arpuLow) {
    upsellPressure = "high";
    actions.push("increaseUpsellPressure: show Pro highlight after 3rd quote");
    actions.push("Bundle annual plan framing to lift effective ARPU");
  } else if (metrics.arpu < thresholds.arpuLow * 1.3) {
    upsellPressure = "medium";
    actions.push("Test PRO feature gate copy on Budget preview");
  }

  if (highUsage > metrics.mrr && analysis.paidUsers > 0) {
    actions.push("recommendUpgrade: high usage detected vs current MRR");
  }

  if (analysis.planMix.BASIC > analysis.planMix.PRO) {
    actions.push("Shift Basic users to Pro via Budget unlock prompt");
  }

  if (actions.length === 0) {
    actions.push("ARPU within target — maintain current upsell cadence");
  }

  return { actions, upsellPressure };
}
