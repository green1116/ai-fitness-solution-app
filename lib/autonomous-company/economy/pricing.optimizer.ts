/**
 * V62 P3 — Economy: pricing optimizer
 */

import type { CompanyState } from "../core/company.state";
import { optimizePricingStrategy } from "@/lib/ai-decision/strategy/pricing.strategy.engine";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

export function optimizePricingAutomatically(state: CompanyState): string[] {
  const suggestions = optimizePricingStrategy(state.business);

  if (state.metrics.conversionDropping) {
    suggestions.push("Adjust pricing strategy for conversion recovery (read-only)");
    suggestions.push(`Review ${getPricingTier("PRO").label} tier positioning`);
  }

  if (state.metrics.growthStagnant && state.business.mrr > 0) {
    suggestions.push("Bundle annual discount to lift ARPU without billing mutation");
  }

  return suggestions;
}
