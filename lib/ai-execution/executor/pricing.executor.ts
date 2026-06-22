/**
 * V62 P2 — Pricing executor (read-only strategy — no Stripe / billing mutation)
 */

import type { ExecutionAction, ExecutionResult } from "../core/execution.types";
import { optimizePricingStrategy } from "@/lib/ai-decision/strategy/pricing.strategy.engine";
import { buildBusinessContext } from "@/lib/ai-decision/decision.service";
import { getPricingTier, buildUpgradeMessage } from "@/lib/growth/conversion/pricing.strategy";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

const DELEGATE = "lib/growth/conversion/pricing.strategy";

export async function adjustPricingStrategy(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const context = buildBusinessContext(action.organizationId);
  const suggestions = optimizePricingStrategy(context);

  appendGrowthEvent({
    event: "execution.pricing_adjusted",
    organizationId: action.organizationId,
    meta: { actionId: action.id, suggestions, readOnly: true },
  });

  return {
    actionId: action.id,
    type: "PRICING",
    status: "executed",
    message: suggestions.join(" · "),
    targetSystem: "V60",
    delegatedTo: DELEGATE,
    traceId,
    reversible: true,
    executedAt: new Date().toISOString(),
  };
}

export async function increasePlanValueSuggestion(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const tier = getPricingTier("ENTERPRISE");
  const message = buildUpgradeMessage("PRO", "ENTERPRISE");

  appendGrowthEvent({
    event: "execution.plan_value_suggestion",
    organizationId: action.organizationId,
    meta: { actionId: action.id, tier: tier.plan, headline: tier.headline },
  });

  return {
    actionId: action.id,
    type: "PRICING",
    status: "executed",
    message: message,
    targetSystem: "V60",
    delegatedTo: DELEGATE,
    traceId,
    reversible: true,
    executedAt: new Date().toISOString(),
  };
}

export async function executePricingAction(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const op = String((action.payload as { operation?: string })?.operation ?? "adjust");

  if (op === "increase_value" || op === "upsell") {
    return increasePlanValueSuggestion(action, traceId);
  }

  return adjustPricingStrategy(action, traceId);
}
