/**
 * V62 P1 — Action generator (decision → actionable items)
 */

import type {
  BusinessContext,
  DecisionAction,
  DecisionOutput,
  StrategyPlan,
  BusinessAnalysis,
} from "../core/decision.types";
import { DECISION_THRESHOLDS } from "../core/decision.types";

let actionCounter = 0;

function nextActionId(): string {
  actionCounter += 1;
  return `dec-action-${Date.now()}-${actionCounter}`;
}

export function resetActionCounterForTests(): void {
  actionCounter = 0;
}

export function generateActionPlan(
  context: BusinessContext,
  organizationId: string,
  strategy: StrategyPlan,
  analysis: BusinessAnalysis,
): DecisionAction[] {
  const actions: DecisionAction[] = [];

  if (context.churnRate > DECISION_THRESHOLDS.churnRateHigh) {
    actions.push({
      id: nextActionId(),
      type: "retention_campaign",
      label: "Launch retention / reactivation campaign",
      priority: "high",
      organizationId,
      payload: { churnRate: context.churnRate },
    });
  }

  if (context.conversionRate < DECISION_THRESHOLDS.conversionRateLow) {
    actions.push({
      id: nextActionId(),
      type: "funnel_optimization",
      label: "Optimize conversion funnel",
      priority: "high",
      organizationId,
      payload: { conversionRate: context.conversionRate },
    });
  }

  if (context.mrr <= DECISION_THRESHOLDS.mrrStagnationDelta && context.activeUsers > 5) {
    actions.push({
      id: nextActionId(),
      type: "pricing_review",
      label: "Review pricing and plan mix",
      priority: "medium",
      organizationId,
    });
  }

  if (context.dealCount < DECISION_THRESHOLDS.dealCountLow) {
    actions.push({
      id: nextActionId(),
      type: "sales_automation",
      label: "Accelerate sales pipeline automation",
      priority: "high",
      organizationId,
      payload: { dealCount: context.dealCount },
    });
  }

  if (analysis.bottlenecks.some((b) => b.toLowerCase().includes("lead"))) {
    actions.push({
      id: nextActionId(),
      type: "lead_scoring_adjustment",
      label: "Adjust lead scoring model",
      priority: "medium",
      organizationId,
    });
  }

  if (strategy.growth.length > 2) {
    actions.push({
      id: nextActionId(),
      type: "growth_experiment",
      label: "Run growth experiment on top bottleneck",
      priority: "low",
      organizationId,
    });
  }

  return actions;
}

export function buildDecisionOutput(
  context: BusinessContext,
  analysis: BusinessAnalysis,
  strategy: StrategyPlan,
  actions: DecisionAction[],
): DecisionOutput {
  const insights = [
    ...analysis.kpiSummary,
    `Business health: ${analysis.health}`,
    ...analysis.bottlenecks.map((b) => `Bottleneck: ${b}`),
  ];

  const recommendations = [
    ...strategy.growth.slice(0, 3),
    ...strategy.pricing.slice(0, 2),
    ...strategy.sales.slice(0, 3),
  ];

  const actionLabels = actions.map((a) => a.label);
  const priorityActions = actions.filter((a) => a.priority === "high").map((a) => a.label);

  const riskAlerts: string[] = [];
  if (context.churnRate > DECISION_THRESHOLDS.churnRateHigh) {
    riskAlerts.push(`Churn rate ${context.churnRate}% exceeds threshold`);
  }
  if (analysis.health === "critical" || analysis.health === "at_risk") {
    riskAlerts.push(`Business health status: ${analysis.health}`);
  }
  riskAlerts.push(...analysis.revenueLeaks.map((l) => `Revenue leak: ${l}`));

  return {
    insights,
    recommendations,
    actions: actionLabels,
    priorityActions,
    riskAlerts,
  };
}
