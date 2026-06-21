/**
 * V60 P3 — Tender recommendation engine
 */

import type { SalesRecommendation } from "../sales.types";
import { countSignal } from "../sales.events.store";

export function triggerTenderRecommendation(input: {
  organizationId: string;
  customerId?: string;
}): SalesRecommendation | null {
  const budgetViews = countSignal(input.organizationId, "budget.viewed", input.customerId);

  if (budgetViews < 3) {
    return null;
  }

  return {
    action: "Trigger Tender Generation",
    product: "tender",
    priority: "high",
    reason: `Budget viewed ${budgetViews} times — ready for tender package`,
    cta: "Generate tender response documents",
  };
}
