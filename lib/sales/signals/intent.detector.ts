/**
 * V60 P3 — Intent detection from behavioral signals
 */

import { countSignal, getSalesSignals } from "../sales.events.store";

export type LeadIntent = "low" | "exploring" | "evaluating" | "ready_to_buy" | "hot";

export type IntentAnalysis = {
  intent: LeadIntent;
  confidence: number;
  signals: string[];
  score: number;
};

export function analyzeLeadIntent(input: {
  organizationId: string;
  customerId?: string;
  leadScore?: number;
  quoteCount?: number;
  budgetViews?: number;
  tenderGenerated?: boolean;
}): IntentAnalysis {
  const signals: string[] = [];
  let score = input.leadScore ?? 0;

  const quoteSignals =
    input.quoteCount ??
    countSignal(input.organizationId, "quote.generated", input.customerId) +
      countSignal(input.organizationId, "quote.repeated", input.customerId);

  const budgetViews =
    input.budgetViews ?? countSignal(input.organizationId, "budget.viewed", input.customerId);

  const tenderGen =
    input.tenderGenerated ??
    countSignal(input.organizationId, "tender.generated", input.customerId) > 0;

  if (quoteSignals > 0) {
    signals.push("quote_interaction");
    score += Math.min(25, quoteSignals * 8);
  }
  if (quoteSignals >= 2) {
    signals.push("repeated_quote_generation");
    score += 15;
  }
  if (budgetViews > 0) {
    signals.push("budget_engagement");
    score += Math.min(20, budgetViews * 5);
  }
  if (budgetViews >= 3) {
    signals.push("budget_export_behavior");
    score += 20;
  }
  if (tenderGen) {
    signals.push("tender_generated");
    score += 25;
  }
  if (countSignal(input.organizationId, "pricing.page_visit", input.customerId) > 0) {
    signals.push("pricing_page_visit");
    score += 10;
  }
  if (countSignal(input.organizationId, "api.usage_spike", input.customerId) > 0) {
    signals.push("api_usage_spike");
    score += 15;
  }

  const normalized = Math.min(100, score);
  let intent: LeadIntent = "low";
  if (normalized >= 80 || tenderGen) intent = "hot";
  else if (normalized >= 70) intent = "ready_to_buy";
  else if (normalized >= 40) intent = "evaluating";
  else if (normalized >= 20) intent = "exploring";

  const confidence = Math.min(95, 40 + signals.length * 12);

  return { intent, confidence, signals, score: normalized };
}

export function detectIntentFromSignals(organizationId: string, customerId?: string): IntentAnalysis {
  const all = getSalesSignals({ organizationId, customerId });
  return analyzeLeadIntent({
    organizationId,
    customerId,
    quoteCount: all.filter((s) => s.signal.startsWith("quote")).reduce((n, s) => n + s.count, 0),
    budgetViews: all.filter((s) => s.signal === "budget.viewed").reduce((n, s) => n + s.count, 0),
    tenderGenerated: all.some((s) => s.signal === "tender.generated"),
  });
}
