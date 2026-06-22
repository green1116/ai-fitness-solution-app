/**
 * V60 P3 — Quote recommendation engine
 */

import type { SalesRecommendation } from "../sales.types";

export function triggerQuoteRecommendation(input: {
  organizationId: string;
  customerId?: string;
  companyName?: string;
  hasExistingQuote?: boolean;
}): SalesRecommendation {
  if (input.hasExistingQuote) {
    return {
      action: "Send Quote Proposal",
      product: "quote",
      priority: "medium",
      reason: "Customer already has quotes — send polished proposal",
      cta: "Review and send latest quote proposal",
    };
  }

  return {
    action: "Send Quote Proposal",
    product: "quote",
    priority: "high",
    reason: "New lead — generate first quote to demonstrate value",
    cta: "Generate AI fitness solution quote",
  };
}
