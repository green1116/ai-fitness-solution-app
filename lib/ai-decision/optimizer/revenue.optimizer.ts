/**
 * V62 P1 — Revenue optimizer
 */

import type { BusinessContext } from "../core/decision.types";
import { detectRevenueLeaks } from "../analysis/revenue.analyzer";
import { suggestPricingOptimization } from "../strategy/pricing.strategy.engine";

export function optimizeRevenue(context: BusinessContext) {
  const leaks = detectRevenueLeaks(context);
  const pricing = suggestPricingOptimization(context);

  const actions: string[] = [];
  if (leaks.length > 0) {
    actions.push("Address identified revenue leaks before scaling acquisition");
  }
  actions.push(...pricing.slice(0, 2));

  return {
    leaks,
    optimizations: actions,
    projectedMrrLift: context.mrr > 0 ? Math.round(context.mrr * 0.08) : 0,
  };
}
