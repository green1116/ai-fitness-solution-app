/**
 * V60 P3 — Stage automation rules
 */

import type { OpportunityStageName } from "@/lib/crm/opportunity/opportunity.stage";

export type AutomationRuleResult = {
  shouldAdvance: boolean;
  targetStage?: OpportunityStageName;
  reason: string;
};

export function evaluateStageAutomation(input: {
  leadScore: number;
  budgetViews: number;
  tenderGenerated: boolean;
  currentStage?: string;
}): AutomationRuleResult {
  if (input.tenderGenerated) {
    return {
      shouldAdvance: true,
      targetStage: "NEGOTIATION",
      reason: "Tender generated — advance to negotiation",
    };
  }

  if (input.budgetViews >= 3 && (input.currentStage === "INIT" || input.currentStage === "PROPOSAL")) {
    return {
      shouldAdvance: true,
      targetStage: "PROPOSAL",
      reason: "Budget engagement threshold met — advance to proposal",
    };
  }

  if (input.leadScore > 70 && input.currentStage === "INIT") {
    return {
      shouldAdvance: true,
      targetStage: "PROPOSAL",
      reason: "High lead score — auto-advance to proposal",
    };
  }

  return { shouldAdvance: false, reason: "No stage automation triggered" };
}
