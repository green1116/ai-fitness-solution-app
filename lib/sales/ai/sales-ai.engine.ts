/**
 * V60 P3 — Sales AI engine (core orchestrator)
 */

import { analyzeLeadIntent, type IntentAnalysis } from "../signals/intent.detector";
import { scoreLeadQuality, type LeadQualityTier } from "../ai/lead-scoring.ai";
import { predictDealProbability, type DealPrediction } from "../ai/deal-predictor.ai";
import { triggerQuoteRecommendation } from "../recommendation/quote.recommender";
import { triggerBudgetRecommendation } from "../recommendation/budget.recommender";
import { triggerTenderRecommendation } from "../recommendation/tender.recommender";

import type { SalesRecommendation } from "../sales.types";

export type SalesSuggestion = {
  summary: string;
  recommendations: SalesRecommendation[];
  intent: IntentAnalysis;
  leadQuality: { score: number; tier: LeadQualityTier };
  dealPrediction?: DealPrediction;
};

export { analyzeLeadIntent, scoreLeadQuality, predictDealProbability };
export { triggerQuoteRecommendation, triggerBudgetRecommendation, triggerTenderRecommendation };

export function recommendNextAction(input: {
  organizationId: string;
  customerId?: string;
  companyName?: string;
  leadScore?: number;
  stage?: string;
}): SalesRecommendation {
  const intent = analyzeLeadIntent({
    organizationId: input.organizationId,
    customerId: input.customerId,
    leadScore: input.leadScore,
  });

  const tenderRec = triggerTenderRecommendation(input);
  if (tenderRec) return tenderRec;

  const budgetRec = triggerBudgetRecommendation({
    organizationId: input.organizationId,
    customerId: input.customerId,
    quoteGenerated: intent.signals.includes("quote_interaction"),
  });
  if (budgetRec) return budgetRec;

  if (intent.intent === "hot" || intent.intent === "ready_to_buy") {
    return {
      action: "Upgrade Plan Recommendation",
      product: "upgrade",
      priority: "high",
      reason: "High intent detected — upsell to PRO/ENTERPRISE",
      cta: "Present plan upgrade options",
    };
  }

  if (intent.score < 30) {
    return {
      action: "Schedule Follow-up",
      product: "follow_up",
      priority: "low",
      reason: "Low engagement — schedule nurture follow-up",
      cta: "Send follow-up email in 7 days",
    };
  }

  return triggerQuoteRecommendation({
    organizationId: input.organizationId,
    customerId: input.customerId,
    companyName: input.companyName,
    hasExistingQuote: intent.signals.includes("quote_interaction"),
  });
}

export function generateSalesSuggestion(input: {
  organizationId: string;
  customerId?: string;
  companyName?: string;
  leadScore?: number;
  stage?: string;
}): SalesSuggestion {
  const intent = analyzeLeadIntent({
    organizationId: input.organizationId,
    customerId: input.customerId,
    leadScore: input.leadScore,
  });

  const leadQuality = scoreLeadQuality({
    organizationId: input.organizationId,
    customerId: input.customerId,
    hasQuote: intent.signals.includes("quote_interaction"),
  });

  const dealPrediction =
    leadQuality.tier !== "LOW"
      ? predictDealProbability({
          organizationId: input.organizationId,
          customerId: input.customerId,
          leadScore: leadQuality.score,
          stage: input.stage,
        })
      : undefined;

  const recommendations: SalesRecommendation[] = [];
  const quoteRec = triggerQuoteRecommendation({
    organizationId: input.organizationId,
    customerId: input.customerId,
    companyName: input.companyName,
    hasExistingQuote: intent.signals.includes("quote_interaction"),
  });
  recommendations.push(quoteRec);

  const budgetRec = triggerBudgetRecommendation({
    organizationId: input.organizationId,
    customerId: input.customerId,
    quoteGenerated: true,
  });
  if (budgetRec) recommendations.push(budgetRec);

  const tenderRec = triggerTenderRecommendation(input);
  if (tenderRec) recommendations.push(tenderRec);

  const nextAction = recommendNextAction(input);
  if (!recommendations.some((r) => r.action === nextAction.action)) {
    recommendations.unshift(nextAction);
  }

  const summary = `Intent: ${intent.intent} (${intent.confidence}% confidence). Lead tier: ${leadQuality.tier}. Next: ${nextAction.action}.`;

  return { summary, recommendations, intent, leadQuality, dealPrediction };
}
