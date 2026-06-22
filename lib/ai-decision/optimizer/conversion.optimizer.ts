/**
 * V62 P1 — Conversion optimizer
 */

import type { BusinessContext } from "../core/decision.types";
import { DECISION_THRESHOLDS } from "../core/decision.types";

export function optimizeConversion(context: BusinessContext) {
  const tactics: string[] = [];

  if (context.conversionRate < DECISION_THRESHOLDS.conversionRateLow) {
    tactics.push("Surface social proof on upgrade paywall");
    tactics.push("Offer first-month incentive for PRO upgrade");
    tactics.push("Retarget users who generated quote but did not pay");
  } else {
    tactics.push("Test premium feature gating to lift conversion without hurting activation");
  }

  return {
    currentRate: context.conversionRate,
    targetRate: Math.min(100, context.conversionRate + 5),
    tactics,
  };
}
