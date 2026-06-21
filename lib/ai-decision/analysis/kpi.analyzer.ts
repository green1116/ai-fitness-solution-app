/**
 * V62 P1 — KPI analyzer
 */

import type { BusinessContext, BusinessAnalysis } from "../core/decision.types";
import { DECISION_THRESHOLDS } from "../core/decision.types";

export function analyzeKpiHealth(context: BusinessContext): BusinessAnalysis {
  const bottlenecks: string[] = [];
  const revenueLeaks: string[] = [];
  const kpiSummary: string[] = [];

  kpiSummary.push(`MRR: $${context.mrr} · ARR: $${context.arr}`);
  kpiSummary.push(`Active users: ${context.activeUsers} · Revenue: $${context.revenue}`);
  kpiSummary.push(`Churn: ${context.churnRate}% · Conversion: ${context.conversionRate}%`);

  if (context.churnRate > DECISION_THRESHOLDS.churnRateHigh) {
    bottlenecks.push("High churn rate eroding recurring revenue base");
  }
  if (context.conversionRate < DECISION_THRESHOLDS.conversionRateLow) {
    bottlenecks.push("Low visitor-to-paid conversion blocking growth");
  }
  if (context.dealCount < DECISION_THRESHOLDS.dealCountLow) {
    bottlenecks.push("Insufficient closed deals in pipeline");
  }
  if (context.leadCount < context.activeUsers * 0.5 && context.activeUsers > 0) {
    bottlenecks.push("Lead volume not keeping pace with active user base");
  }

  if (context.mrr > 0 && context.churnRate > 10) {
    revenueLeaks.push(`Estimated monthly churn impact: ~$${Math.round(context.mrr * (context.churnRate / 100))}`);
  }
  if (context.conversionRate < 3 && context.leadCount > 10) {
    revenueLeaks.push("Funnel drop-off between signup and payment");
  }

  let health: BusinessAnalysis["health"] = "strong";
  if (context.churnRate > DECISION_THRESHOLDS.churnRateHigh || context.mrr === 0) {
    health = context.mrr === 0 ? "critical" : "at_risk";
  } else if (
    context.conversionRate < DECISION_THRESHOLDS.conversionRateLow ||
    bottlenecks.length >= 2
  ) {
    health = "stable";
  }
  if (bottlenecks.length >= 3) health = "at_risk";

  return { health, bottlenecks, revenueLeaks, kpiSummary };
}

export function summarizeKpiTrends(context: BusinessContext): string[] {
  const insights: string[] = [];
  if (context.arr > context.mrr * 12) {
    insights.push("ARR tracking above baseline MRR annualization");
  }
  if (context.dealCount > 0 && context.leadCount > 0) {
    const ratio = Math.round((context.dealCount / context.leadCount) * 100);
    insights.push(`Lead-to-deal ratio at ${ratio}%`);
  }
  return insights;
}
