/**
 * V62 P1 — Sales strategy engine
 */

import type { BusinessContext } from "../core/decision.types";
import { DECISION_THRESHOLDS } from "../core/decision.types";
import { analyzeSalesState } from "../analysis/sales.analyzer";

export function adjustLeadScoringRecommendations(context: BusinessContext, organizationId: string): string[] {
  const state = analyzeSalesState(context, organizationId);
  if (!state.isLeadQualityLow) {
    return ["Lead scoring thresholds appear healthy"];
  }
  return [
    "Lower quote-repeat weight; increase budget-view signal weight",
    "Re-calibrate intent detector for low-engagement leads",
    `Raise qualification bar above score ${DECISION_THRESHOLDS.leadQualityLow}`,
  ];
}

export function enhanceSalesStrategy(context: BusinessContext, organizationId: string): string[] {
  const strategies: string[] = [];
  const state = analyzeSalesState(context, organizationId);

  if (context.dealCount < DECISION_THRESHOLDS.dealCountLow) {
    strategies.push("Prioritize hot deals with AI-assisted follow-up sequences");
    strategies.push("Auto-create opportunities for leads scoring above 70");
  }

  if (state.opportunityDrop) {
    strategies.push(...triggerSalesAutomationRecommendations());
  }

  if (state.isLeadQualityLow) {
    strategies.push(...adjustLeadScoringRecommendations(context, organizationId));
  }

  if (strategies.length === 0) {
    strategies.push("Pipeline healthy — focus on deal velocity and forecast accuracy");
  }

  return strategies;
}

export function triggerSalesAutomationRecommendations(): string[] {
  return [
    "Trigger V60 sales automation for qualified leads",
    "Enable stage-based pipeline advancement rules",
    "Deploy tender hot-deal alerts to account owners",
  ];
}

export function generateSalesStrategy(context: BusinessContext, organizationId: string): string[] {
  return enhanceSalesStrategy(context, organizationId);
}
