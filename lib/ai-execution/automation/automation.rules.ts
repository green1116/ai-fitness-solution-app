/**
 * V62 P2 — Automation rules (Growth / Sales / Pricing / CRM)
 */

import type { ExecutionAction } from "../core/execution.types";
import { EXECUTION_THRESHOLDS } from "../core/execution.types";
import { buildExecutionContext } from "../core/execution.context";

let ruleCounter = 0;

function ruleAction(
  partial: Omit<ExecutionAction, "id"> & { id?: string },
): ExecutionAction {
  ruleCounter += 1;
  return {
    id: partial.id ?? `rule-${Date.now()}-${ruleCounter}`,
    ...partial,
  };
}

export function resetRuleCounterForTests(): void {
  ruleCounter = 0;
}

export function evaluateAutomationRules(organizationId: string, traceId: string): ExecutionAction[] {
  const ctx = buildExecutionContext(organizationId, traceId);
  const actions: ExecutionAction[] = [];

  // Growth
  if (ctx.business.churnRate > EXECUTION_THRESHOLDS.churnRateRetention) {
    actions.push(
      ruleAction({
        type: "GROWTH",
        priority: "HIGH",
        payload: { operation: "retention" },
        targetSystem: "V60",
        organizationId,
        label: "Execute retention campaign",
        reversible: true,
        sourceRule: "growth.churn_retention",
      }),
    );
  }

  if (ctx.activationRate < EXECUTION_THRESHOLDS.activationRateLow) {
    actions.push(
      ruleAction({
        type: "GROWTH",
        priority: "MEDIUM",
        payload: { operation: "optimize_onboarding" },
        targetSystem: "V60",
        organizationId,
        label: "Optimize onboarding flow",
        reversible: true,
        sourceRule: "growth.activation_onboarding",
      }),
    );
  }

  // Sales
  if (ctx.leadScore > EXECUTION_THRESHOLDS.leadScoreHot) {
    actions.push(
      ruleAction({
        type: "SALES",
        priority: "HIGH",
        payload: { operation: "auto_opportunity", leadScore: ctx.leadScore },
        targetSystem: "V60",
        organizationId,
        label: "Auto-trigger opportunity",
        reversible: false,
        sourceRule: "sales.lead_score_hot",
      }),
    );
  }

  if (ctx.dealStalled) {
    actions.push(
      ruleAction({
        type: "SALES",
        priority: "MEDIUM",
        payload: { operation: "proposal_reminder" },
        targetSystem: "V60",
        organizationId,
        label: "Send proposal reminder",
        reversible: true,
        sourceRule: "sales.deal_stalled",
      }),
    );
  }

  // Pricing
  if (ctx.business.conversionRate < EXECUTION_THRESHOLDS.conversionRateLow) {
    actions.push(
      ruleAction({
        type: "PRICING",
        priority: "MEDIUM",
        payload: { operation: "adjust" },
        targetSystem: "V60",
        organizationId,
        label: "Adjust pricing strategy",
        reversible: true,
        sourceRule: "pricing.conversion_low",
      }),
    );
  }

  if (ctx.demandHigh) {
    actions.push(
      ruleAction({
        type: "PRICING",
        priority: "LOW",
        payload: { operation: "increase_value" },
        targetSystem: "V60",
        organizationId,
        label: "Increase plan value suggestion",
        reversible: true,
        sourceRule: "pricing.demand_high",
      }),
    );
  }

  // CRM
  if (ctx.customerInactive) {
    actions.push(
      ruleAction({
        type: "CRM",
        priority: "HIGH",
        payload: { operation: "reactivation" },
        targetSystem: "V60",
        organizationId,
        label: "Trigger reactivation flow",
        reversible: true,
        sourceRule: "crm.customer_inactive",
      }),
    );
  }

  if (ctx.opportunityHot) {
    actions.push(
      ruleAction({
        type: "CRM",
        priority: "HIGH",
        payload: { operation: "hot_deal" },
        targetSystem: "V60",
        organizationId,
        label: "Escalate hot deal priority",
        reversible: true,
        sourceRule: "crm.opportunity_hot",
      }),
    );
  }

  return actions;
}
