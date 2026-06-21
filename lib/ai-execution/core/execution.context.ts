/**
 * V62 P2 — Execution context (V62 P1 decision + V61 metrics)
 */

import { buildBusinessContext, runBusinessDecision } from "@/lib/ai-decision/decision.service";
import { analyzeGrowth } from "@/lib/dashboard/analytics/growth.analytics";
import { analyzeSales } from "@/lib/dashboard/analytics/sales.analytics";
import type { BusinessContext } from "@/lib/ai-decision/core/decision.types";

export type ExecutionContext = {
  organizationId: string;
  traceId: string;
  business: BusinessContext;
  activationRate: number;
  leadScore: number;
  dealStalled: boolean;
  customerInactive: boolean;
  opportunityHot: boolean;
  demandHigh: boolean;
  decisionSummary?: ReturnType<typeof runBusinessDecision>;
};

export function createTraceId(): string {
  return `exec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildExecutionContext(organizationId: string, traceId?: string): ExecutionContext {
  const tid = traceId ?? createTraceId();
  const business = buildBusinessContext(organizationId);
  const growth = analyzeGrowth();
  const sales = analyzeSales(organizationId);

  const leadScore = Math.min(
    100,
    sales.conversion.aiSuccessRate + sales.signals.repeatedQuotes * 5,
  );

  return {
    organizationId,
    traceId: tid,
    business,
    activationRate: growth.activationRate,
    leadScore,
    dealStalled: sales.pipeline.quotes > 2 && sales.pipeline.hotDeals === 0,
    customerInactive: business.churnRate > 10 && business.activeUsers > 0,
    opportunityHot: sales.pipeline.hotDeals > 0,
    demandHigh: business.mrr >= 500 || business.activeUsers > 20,
    decisionSummary: runBusinessDecision(organizationId),
  };
}
