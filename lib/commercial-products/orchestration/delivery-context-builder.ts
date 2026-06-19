import { CP_DEFAULT_BRIDGE_PLAN_ID } from "@/lib/commercial-products/access-layer/shared/deliverable-types";
import { buildDeliverableRoutingContext } from "@/lib/commercial-products/access-layer/pdf/deliverable-pdf-router";
import { getQuoteSnapshotById } from "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry";
import type { DeliveryContext, DeliveryRequest } from "./delivery-orchestrator-types";

export function buildDeliveryContext(request: DeliveryRequest): DeliveryContext {
  const mode = request.mode ?? "full";
  const snapshot = getQuoteSnapshotById(request.quoteId);
  const routing = buildDeliverableRoutingContext({
    type: "summary",
    quoteId: request.quoteId,
    planId: request.planId,
    budgetId: request.budgetId,
    snapshot,
  });

  const hasPlanId = Boolean(request.planId?.trim());
  const hasBudgetId = Boolean(request.budgetId?.trim());

  return {
    quoteId: request.quoteId,
    planId: routing.planId,
    budgetId: routing.budgetId,
    mode,
    hasPlanId,
    hasBudgetId,
    hasSnapshot: routing.hasSnapshot,
    projectName: routing.projectName,
    sku: routing.sku,
    availability: {
      summary: true,
      plan: true,
      budget: true,
      package: mode !== "fast" || Boolean(request.include?.zip ?? true),
    },
    fallbackRules: {
      planBridge: hasPlanId ? request.planId!.trim() : CP_DEFAULT_BRIDGE_PLAN_ID,
      budgetBridge: hasBudgetId ? request.budgetId!.trim() : routing.planId,
    },
  };
}
