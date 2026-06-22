/**
 * V65 — Ads performance optimizer
 */

import { aggregateGrowthMetrics } from "@/lib/growth/funnel/funnel.analytics";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { buildAdsStrategy, generateAdCopyVariants } from "./ads.strategy.engine";
import { deriveSignupRate } from "../growth-metrics.util";

export function optimizeAdPerformance(): {
  actions: string[];
  roiEstimate: number;
  winningVariant?: string;
} {
  const metrics = aggregateGrowthMetrics();
  const events = getGrowthEventsSnapshot();
  const upgrades = events.filter((e) => e.event === "upgrade.clicked").length;
  const signups = metrics.signups;

  const actions: string[] = [];
  const strategy = buildAdsStrategy();

  const signupRate = deriveSignupRate(metrics);

  if (signupRate < 5) {
    actions.push("Pause broad match keywords; focus on high-intent fitness procurement terms");
    actions.push("Increase retargeting budget for demo abandoners");
  } else {
    actions.push("Scale top-performing ad groups by 15%");
  }

  for (const [ch, pct] of Object.entries(strategy.budgetAllocation)) {
    actions.push(`Allocate ${pct}% to ${ch}`);
  }

  const variants = generateAdCopyVariants();
  const winningVariant = variants[0]?.variant;
  const roiEstimate = signups > 0 ? Math.round((upgrades / signups) * 100 + signupRate) : signupRate;

  return { actions, roiEstimate, winningVariant };
}

export function optimizeAdsROI(): string[] {
  return optimizeAdPerformance().actions;
}
