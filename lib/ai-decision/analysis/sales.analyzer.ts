/**
 * V62 P1 — Sales analyzer
 */

import type { BusinessContext } from "../core/decision.types";
import { DECISION_THRESHOLDS } from "../core/decision.types";
import { analyzeSales } from "@/lib/dashboard/analytics/sales.analytics";

export function analyzeSalesState(context: BusinessContext, organizationId: string) {
  const sales = analyzeSales(organizationId);
  const leadQuality =
    sales.signals.quoteGenerations > 0
      ? Math.min(100, sales.conversion.aiSuccessRate + sales.signals.repeatedQuotes * 5)
      : 0;

  const opportunityDrop =
    sales.pipeline.tenders === 0 && sales.pipeline.quotes > 3;

  return {
    pipeline: sales.pipeline,
    conversion: sales.conversion,
    leadQuality,
    opportunityDrop,
    dealPrediction: sales.dealPrediction,
    isLeadQualityLow: leadQuality < DECISION_THRESHOLDS.leadQualityLow,
    isDealCountLow: context.dealCount < DECISION_THRESHOLDS.dealCountLow,
  };
}

export function detectSalesIssues(context: BusinessContext, organizationId: string): string[] {
  const state = analyzeSalesState(context, organizationId);
  const issues: string[] = [];

  if (state.isLeadQualityLow) {
    issues.push("Lead quality below threshold — scoring model may need adjustment");
  }
  if (state.opportunityDrop) {
    issues.push("Opportunity creation dropped despite quote activity");
  }
  if (state.isDealCountLow) {
    issues.push("Deal count low — pipeline acceleration recommended");
  }

  return issues;
}
