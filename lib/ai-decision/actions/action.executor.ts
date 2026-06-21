/**
 * V62 P1 — Action executor (delegates to V60/V61 — no direct business logic)
 */

import type { DecisionAction, DecisionActionResult } from "../core/decision.types";
import { buildReactivationCampaign } from "@/lib/growth/retention/reactivation.engine";
import { runSalesAutomation } from "@/lib/sales/sales.service";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import { recommendNextAction } from "@/lib/sales/sales.service";

export class DecisionExecutionError extends Error {
  readonly code = "DECISION_EXECUTION_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "DecisionExecutionError";
  }
}

/** Registered V60/V61 delegation targets — never bypass feature gate or billing */
const DELEGATION_TARGETS = {
  retention_campaign: "lib/growth/retention/reactivation.engine",
  funnel_optimization: "lib/growth/growth.events.store",
  pricing_review: "lib/growth/conversion/pricing.strategy",
  sales_automation: "lib/sales/sales.service",
  lead_scoring_adjustment: "lib/sales/ai/sales-ai.engine",
  growth_experiment: "lib/growth/analytics.events",
} as const;

export function getDelegationTarget(type: DecisionAction["type"]): string {
  return DELEGATION_TARGETS[type];
}

export async function executeDecisionAction(action: DecisionAction): Promise<DecisionActionResult> {
  switch (action.type) {
    case "retention_campaign": {
      const campaign = buildReactivationCampaign(action.organizationId);
      appendGrowthEvent({
        event: "decision.retention_scheduled",
        organizationId: action.organizationId,
        meta: { actionId: action.id, churnRisk: campaign.churnRisk },
      });
      return {
        actionId: action.id,
        type: action.type,
        status: "delegated",
        message: campaign.message,
        delegatedTo: getDelegationTarget(action.type),
      };
    }

    case "funnel_optimization": {
      appendGrowthEvent({
        event: "decision.funnel_optimization",
        organizationId: action.organizationId,
        meta: { actionId: action.id, ...action.payload },
      });
      return {
        actionId: action.id,
        type: action.type,
        status: "scheduled",
        message: "Funnel optimization experiment scheduled via growth layer",
        delegatedTo: getDelegationTarget(action.type),
      };
    }

    case "pricing_review": {
      return {
        actionId: action.id,
        type: action.type,
        status: "scheduled",
        message: "Pricing review queued — no billing mutation (read-only strategy)",
        delegatedTo: getDelegationTarget(action.type),
      };
    }

    case "sales_automation": {
      const customerId = String(action.payload?.customerId ?? "").trim();
      if (!customerId) {
        const suggestion = recommendNextAction({
          organizationId: action.organizationId,
        });
        return {
          actionId: action.id,
          type: action.type,
          status: "scheduled",
          message: suggestion.action ?? "Sales automation ready — provide customerId to execute",
          delegatedTo: getDelegationTarget(action.type),
        };
      }

      await runSalesAutomation({
        organizationId: action.organizationId,
        customerId,
        leadId: action.payload?.leadId as string | undefined,
        opportunityId: action.payload?.opportunityId as string | undefined,
      });

      return {
        actionId: action.id,
        type: action.type,
        status: "delegated",
        message: "Sales automation delegated to V60 sales engine",
        delegatedTo: getDelegationTarget(action.type),
      };
    }

    case "lead_scoring_adjustment": {
      return {
        actionId: action.id,
        type: action.type,
        status: "scheduled",
        message: "Lead scoring adjustment recommendation recorded for sales AI engine",
        delegatedTo: getDelegationTarget(action.type),
      };
    }

    case "growth_experiment": {
      appendGrowthEvent({
        event: "decision.growth_experiment",
        organizationId: action.organizationId,
        meta: { actionId: action.id },
      });
      return {
        actionId: action.id,
        type: action.type,
        status: "scheduled",
        message: "Growth experiment registered",
        delegatedTo: getDelegationTarget(action.type),
      };
    }

    default:
      throw new DecisionExecutionError(`Unknown action type: ${(action as DecisionAction).type}`);
  }
}

export async function executeActionPlan(actions: DecisionAction[]): Promise<DecisionActionResult[]> {
  const results: DecisionActionResult[] = [];
  for (const action of actions) {
    results.push(await executeDecisionAction(action));
  }
  return results;
}
