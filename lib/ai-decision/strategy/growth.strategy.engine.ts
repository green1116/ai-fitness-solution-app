/**
 * V62 P1 — Growth strategy engine
 */

import type { BusinessContext } from "../core/decision.types";
import { DECISION_THRESHOLDS } from "../core/decision.types";
import { detectGrowthBottlenecks } from "../analysis/growth.analyzer";

export function generateRetentionStrategy(context: BusinessContext): string[] {
  return [
    `Launch reactivation campaign for orgs with churn risk above ${DECISION_THRESHOLDS.churnRateHigh}%`,
    "Enable win-back offers on downgrade signals",
    "Increase onboarding touchpoints for at-risk cohorts",
    `Target churn reduction from ${context.churnRate}% to ${Math.max(5, context.churnRate - 5)}%`,
  ];
}

export function generateGrowthStrategy(context: BusinessContext): string[] {
  const strategies: string[] = [];
  const bottlenecks = detectGrowthBottlenecks(context);

  if (context.churnRate > DECISION_THRESHOLDS.churnRateHigh) {
    strategies.push(...generateRetentionStrategy(context));
  }

  if (context.conversionRate < DECISION_THRESHOLDS.conversionRateLow) {
    strategies.push(
      "Optimize signup-to-activation funnel with guided first quote",
      "A/B test paywall placement for upgrade intent",
    );
  }

  if (bottlenecks.some((b) => b.includes("acquisition"))) {
    strategies.push("Expand top-of-funnel via UTM campaigns and landing experiments");
  }

  if (strategies.length === 0) {
    strategies.push("Maintain growth velocity — monitor weekly activation metrics");
  }

  return strategies;
}
