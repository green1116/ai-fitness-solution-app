/**
 * V62 P1 — AI Decision Engine (Business Brain)
 */

import type { BusinessContext, BusinessAnalysis, StrategyPlan } from "./decision.types";
import { analyzeKpiHealth, summarizeKpiTrends } from "../analysis/kpi.analyzer";
import { analyzeRevenueState, detectRevenueLeaks } from "../analysis/revenue.analyzer";
import { detectGrowthBottlenecks as detectGrowthBottlenecksAnalysis } from "../analysis/growth.analyzer";
import { detectSalesIssues } from "../analysis/sales.analyzer";
import { generateGrowthStrategy } from "../strategy/growth.strategy.engine";
import { optimizePricingStrategy } from "../strategy/pricing.strategy.engine";
import {
  enhanceSalesStrategy,
  generateSalesStrategy,
  triggerSalesAutomationRecommendations,
} from "../strategy/sales.strategy.engine";
import { optimizeGrowthFunnels, optimizeFunnel } from "../optimizer/funnel.optimizer";
import { generateActionPlan as buildActionPlan, buildDecisionOutput } from "../actions/action.generator";
import { generateRecommendations } from "../actions/recommendation.engine";
import { buildBusinessContext } from "./decision.context";

export function analyzeBusinessState(context: BusinessContext): BusinessAnalysis {
  const kpi = analyzeKpiHealth(context);
  const revenue = analyzeRevenueState(context);
  const trends = summarizeKpiTrends(context);

  return {
    ...kpi,
    revenueLeaks: [...kpi.revenueLeaks, ...revenue.leaks],
    kpiSummary: [...kpi.kpiSummary, ...trends, ...revenue.insights.slice(0, 2)],
  };
}

export function detectGrowthBottlenecks(context: BusinessContext): string[] {
  return detectGrowthBottlenecksAnalysis(context);
}

export { detectRevenueLeaks, optimizePricingStrategy, optimizeGrowthFunnels };

export function generateStrategyPlan(context: BusinessContext, organizationId: string): StrategyPlan {
  return {
    growth: generateGrowthStrategy(context),
    pricing: optimizePricingStrategy(context),
    sales: generateSalesStrategy(context, organizationId),
  };
}

export function optimizeSalesPipeline(context: BusinessContext, organizationId: string): string[] {
  const issues = detectSalesIssues(context, organizationId);
  const strategies = enhanceSalesStrategy(context, organizationId);
  if (issues.some((i) => i.includes("Opportunity"))) {
    strategies.push(...triggerSalesAutomationRecommendations());
  }
  return strategies;
}

export function generateActionPlan(context: BusinessContext, organizationId: string) {
  const analysis = analyzeBusinessState(context);
  const strategy = generateStrategyPlan(context, organizationId);
  return buildActionPlan(context, organizationId, strategy, analysis);
}

export function runBusinessDecision(organizationId: string) {
  const context = buildBusinessContext(organizationId);
  const analysis = analyzeBusinessState(context);
  const strategy = generateStrategyPlan(context, organizationId);
  const actions = generateActionPlan(context, organizationId);
  const output = buildDecisionOutput(context, analysis, strategy, actions);

  return {
    context,
    analysis,
    strategy,
    actions,
    output,
    recommendations: generateRecommendations(context, organizationId),
    funnelOptimizations: optimizeFunnel(context),
    generatedAt: new Date().toISOString(),
  };
}

export { buildBusinessContext, generateRecommendations };
