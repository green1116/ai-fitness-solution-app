/**
 * V60 P3 — Budget recommendation engine
 */

import type { SalesRecommendation } from "../sales.types";
import { countSignal } from "../sales.events.store";

export function triggerBudgetRecommendation(input: {
  organizationId: string;
  customerId?: string;
  quoteGenerated?: boolean;
}): SalesRecommendation | null {
  const quoteCount =
    countSignal(input.organizationId, "quote.generated", input.customerId) +
    countSignal(input.organizationId, "quote.repeated", input.customerId);

  if (!input.quoteGenerated && quoteCount === 0) {
    return null;
  }

  return {
    action: "Suggest Budget Optimization",
    product: "budget",
    priority: quoteCount >= 2 ? "high" : "medium",
    reason: "Quote engagement detected — budget analysis increases close rate",
    cta: "Run budget calculation for client proposal",
  };
}
