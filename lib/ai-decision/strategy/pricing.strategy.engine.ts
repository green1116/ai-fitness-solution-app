/**
 * V62 P1 — Pricing strategy engine
 */

import type { BusinessContext } from "../core/decision.types";
import { DECISION_THRESHOLDS } from "../core/decision.types";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

export function suggestPricingOptimization(context: BusinessContext): string[] {
  const suggestions: string[] = [];

  if (context.mrr <= DECISION_THRESHOLDS.mrrStagnationDelta && context.activeUsers > 0) {
    suggestions.push("Introduce annual plan discount to lift ARPU");
    suggestions.push("Bundle PRO features for mid-market segment");
  }

  const proTier = getPricingTier("PRO");
  suggestions.push(`Review ${proTier.label} positioning (${proTier.headline}) for conversion lift`);

  if (context.conversionRate < DECISION_THRESHOLDS.conversionRateLow) {
    suggestions.push("Test limited-time trial extension on BASIC tier");
  }

  return suggestions;
}

export function optimizePricingStrategy(context: BusinessContext): string[] {
  if (context.mrr <= DECISION_THRESHOLDS.mrrStagnationDelta && context.activeUsers > 5) {
    return suggestPricingOptimization(context);
  }
  return ["Pricing stable — monitor plan mix quarterly"];
}
