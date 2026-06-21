/**
 * V62 P3 — Sales: deal closer AI
 */

import type { CompanyState } from "../core/company.state";
import { predictDealProbability } from "@/lib/sales/ai/deal-predictor.ai";
import { recommendNextAction } from "@/lib/sales/sales.service";

export function runDealCloserAI(state: CompanyState): {
  probability: number;
  label: string;
  nextAction: string;
} {
  const prediction = predictDealProbability({
    organizationId: state.organizationId,
    stage: "PROPOSAL",
  });

  const next = recommendNextAction({ organizationId: state.organizationId });

  return {
    probability: prediction.probability,
    label: prediction.label,
    nextAction: String(next.action),
  };
}
