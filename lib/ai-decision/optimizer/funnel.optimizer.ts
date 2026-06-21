/**
 * V62 P1 — Funnel optimizer
 */

import type { BusinessContext } from "../core/decision.types";
import { DECISION_THRESHOLDS } from "../core/decision.types";
import { analyzeGrowth } from "@/lib/dashboard/analytics/growth.analytics";

export function optimizeGrowthFunnels(context: BusinessContext) {
  const growth = analyzeGrowth();
  const optimizations: string[] = [];

  if (context.conversionRate < DECISION_THRESHOLDS.conversionRateLow) {
    optimizations.push("Reduce steps between signup and first quote generation");
    optimizations.push("Add activation checklist with progress nudges");
  }

  const weakestStage = Object.entries(growth.funnel).sort(([, a], [, b]) => a - b)[0];
  if (weakestStage) {
    optimizations.push(`Strengthen funnel stage: ${weakestStage[0]} (count: ${weakestStage[1]})`);
  }

  return {
    optimizations,
    funnel: growth.funnel,
    targetConversion: Math.min(100, context.conversionRate + 3),
  };
}

export function optimizeFunnel(context: BusinessContext): string[] {
  return optimizeGrowthFunnels(context).optimizations;
}
