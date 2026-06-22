/**
 * V60 P3 — AI deal probability predictor
 */

import { analyzeLeadIntent } from "../signals/intent.detector";
import { scoreOpportunity } from "../scoring/opportunity.scoring.engine";
import { countSignal } from "../sales.events.store";

export type DealPrediction = {
  probability: number;
  label: "low" | "medium" | "high" | "very_high";
  factors: string[];
  estimatedCloseDays: number;
};

export function predictDealProbability(input: {
  organizationId: string;
  customerId?: string;
  opportunityValue?: number;
  stage?: string;
  leadScore?: number;
}): DealPrediction {
  const factors: string[] = [];
  let probability = 20;

  const intent = analyzeLeadIntent({
    organizationId: input.organizationId,
    customerId: input.customerId,
    leadScore: input.leadScore,
  });
  probability += Math.round(intent.confidence * 0.3);
  factors.push(...intent.signals);

  const oppScore = scoreOpportunity({
    engagementLevel: intent.signals.length,
    companySize: 100,
    quoteInteractions: countSignal(input.organizationId, "quote.generated", input.customerId),
    budgetInteractions: countSignal(input.organizationId, "budget.viewed", input.customerId),
    tenderInteractions: countSignal(input.organizationId, "tender.generated", input.customerId),
  });
  probability += Math.round(oppScore.score * 0.4);
  if (oppScore.signals.length) factors.push(...oppScore.signals);

  const stage = (input.stage ?? "INIT").toUpperCase();
  if (stage === "PROPOSAL") probability += 10;
  if (stage === "NEGOTIATION") probability += 20;
  if (stage === "WON") probability = 100;

  if (countSignal(input.organizationId, "tender.generated", input.customerId) > 0) {
    probability += 15;
    factors.push("tender_milestone");
  }
  if (countSignal(input.organizationId, "hot_deal", input.customerId) > 0) {
    probability += 10;
    factors.push("hot_deal_flag");
  }

  probability = Math.min(98, Math.max(5, probability));

  const label: DealPrediction["label"] =
    probability >= 80 ? "very_high" : probability >= 60 ? "high" : probability >= 35 ? "medium" : "low";

  const estimatedCloseDays =
    label === "very_high" ? 7 : label === "high" ? 14 : label === "medium" ? 30 : 60;

  return { probability, label, factors: [...new Set(factors)], estimatedCloseDays };
}
