/**
 * V62 P3 — Company brain (wraps V62 P1 Decision Engine)
 */

import {
  analyzeBusinessState,
  generateStrategyPlan,
  runBusinessDecision,
  buildBusinessContext,
  detectGrowthBottlenecks,
  detectRevenueLeaks,
} from "@/lib/ai-decision/decision.service";
import type { CompanyState } from "./company.state";
import { analyzeOperations } from "@/lib/dashboard/analytics/operations.analytics";

export function observeBusinessMetrics(organizationId: string, traceId: string): CompanyState["metrics"] {
  const business = buildBusinessContext(organizationId);
  const ops = analyzeOperations();

  const growthStagnant = business.activeUsers > 5 && business.conversionRate < 5;
  const revenueFlat = business.mrr > 0 && business.revenue <= business.mrr;
  const conversionDropping = business.conversionRate < 5 && business.leadCount > 10;

  return {
    mrr: business.mrr,
    arr: business.arr,
    churnRate: business.churnRate,
    conversionRate: business.conversionRate,
    revenue: business.revenue,
    activeUsers: business.activeUsers,
    errorRate: ops.errorRate,
    growthStagnant,
    revenueFlat,
    conversionDropping,
  };
}

export function analyzeCompanyState(organizationId: string, traceId: string): CompanyState {
  const business = buildBusinessContext(organizationId);
  const analysis = analyzeBusinessState(business);
  const metrics = observeBusinessMetrics(organizationId, traceId);

  let health: CompanyState["health"] = "stable";
  if (analysis.health === "strong") health = "thriving";
  else if (analysis.health === "at_risk") health = "stressed";
  else if (analysis.health === "critical") health = "critical";

  if (metrics.errorRate > 15) health = "stressed";
  if (metrics.churnRate > 20) health = "critical";

  return {
    organizationId,
    traceId,
    running: true,
    health,
    business,
    analysis,
    cycleCount: 0,
    metrics,
  };
}

export function generateBusinessStrategy(state: CompanyState): CompanyState {
  const strategy = generateStrategyPlan(state.business, state.organizationId);
  const bottlenecks = detectGrowthBottlenecks(state.business);
  const leaks = detectRevenueLeaks(state.business);

  return {
    ...state,
    strategy: {
      growth: [...strategy.growth, ...bottlenecks.slice(0, 2)],
      pricing: [...strategy.pricing, ...leaks.slice(0, 1)],
      sales: strategy.sales,
    },
  };
}

export function thinkCompanyDecision(organizationId: string) {
  return runBusinessDecision(organizationId);
}
