/**
 * V62 P3 — Economy: revenue optimizer
 */

import type { CompanyState } from "../core/company.state";
import { optimizeRevenue } from "@/lib/ai-decision/optimizer/revenue.optimizer";
import { analyzeRevenue } from "@/lib/dashboard/analytics/revenue.analytics";

export function optimizeRevenueAutomatically(state: CompanyState): string[] {
  const revenueOpt = optimizeRevenue(state.business);
  const revenue = analyzeRevenue();
  const tactics: string[] = [...revenueOpt.optimizations];

  if (state.metrics.revenueFlat) {
    tactics.push("Activate funnel + upsell loop for flat revenue");
    tactics.push(`Target MRR lift: +$${revenueOpt.projectedMrrLift}`);
  }

  if (revenue.usageRevenue < revenue.mrr * 0.1) {
    tactics.push("Increase usage-based revenue capture");
  }

  return tactics;
}
