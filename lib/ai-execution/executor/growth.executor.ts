/**
 * V62 P2 — Growth executor (delegates to V60 growth layer)
 */

import type { ExecutionAction, ExecutionResult } from "../core/execution.types";
import {
  buildReactivationCampaign,
  trackReactivationSent,
} from "@/lib/growth/retention/reactivation.engine";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import { advanceOnboardingStep } from "@/lib/growth/activation/onboarding.flow";
import { optimizeFunnel } from "@/lib/ai-decision/optimizer/funnel.optimizer";
import { buildBusinessContext } from "@/lib/ai-decision/decision.service";

const DELEGATE = "lib/growth";

export async function executeRetentionCampaign(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const campaign = buildReactivationCampaign(action.organizationId);
  trackReactivationSent({
    organizationId: action.organizationId,
    campaignType: "ai_execution_retention",
    churnRisk: campaign.churnRisk,
  });

  return {
    actionId: action.id,
    type: "GROWTH",
    status: "executed",
    message: campaign.message,
    targetSystem: "V60",
    delegatedTo: `${DELEGATE}/retention/reactivation.engine`,
    traceId,
    reversible: true,
    executedAt: new Date().toISOString(),
  };
}

export async function optimizeOnboardingFlow(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const userId = String((action.payload as { userId?: string })?.userId ?? "system-user");
  advanceOnboardingStep(userId, "generate_first_quote", action.organizationId);

  appendGrowthEvent({
    event: "execution.onboarding_optimized",
    organizationId: action.organizationId,
    userId,
    meta: { actionId: action.id },
  });

  return {
    actionId: action.id,
    type: "GROWTH",
    status: "executed",
    message: "Onboarding flow optimization applied via V60 growth",
    targetSystem: "V60",
    delegatedTo: `${DELEGATE}/activation/onboarding.flow`,
    traceId,
    reversible: true,
    executedAt: new Date().toISOString(),
  };
}

export async function executeGrowthAction(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const op = String((action.payload as { operation?: string })?.operation ?? "retention");

  if (op === "onboarding" || op === "optimize_onboarding") {
    return optimizeOnboardingFlow(action, traceId);
  }

  if (op === "funnel") {
    const context = buildBusinessContext(action.organizationId);
    const optimizations = optimizeFunnel(context);
    appendGrowthEvent({
      event: "execution.funnel_optimized",
      organizationId: action.organizationId,
      meta: { actionId: action.id, stages: optimizations },
    });
    return {
      actionId: action.id,
      type: "GROWTH",
      status: "executed",
      message: `Funnel optimization: ${optimizations.join("; ")}`,
      targetSystem: "V60",
      delegatedTo: `${DELEGATE}/funnel`,
      traceId,
      reversible: true,
      executedAt: new Date().toISOString(),
    };
  }

  return executeRetentionCampaign(action, traceId);
}
