/**
 * V62 P3 — Economy: cost reducer (operational efficiency)
 */

import type { CompanyState } from "../core/company.state";
import { analyzeOperations } from "@/lib/dashboard/analytics/operations.analytics";

export function reduceOperationalCost(state: CompanyState): string[] {
  const ops = analyzeOperations();
  const tactics: string[] = [];

  if (ops.errorRate > 5) {
    tactics.push("Reduce retry storms on failing API paths");
  }
  if (ops.avgLatencyMs > 500) {
    tactics.push("Optimize slow execution paths to reduce compute cost");
  }
  if (state.metrics.errorRate > 10) {
    tactics.push("Throttle non-critical automation during high error periods");
  }

  if (tactics.length === 0) {
    tactics.push("Operational costs within bounds — maintain efficiency monitoring");
  }

  return tactics;
}
