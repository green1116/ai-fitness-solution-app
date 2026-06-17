import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { buildOutcomeRegistry } from "../win-loss-foundation/outcome-registry";
import { buildProductWinRateAnalytics } from "../analytics/product-winrate-analytics";
import type { OutcomeReason, TenderOutcomeStatus } from "./reason-types";
import type { TenderOutcome } from "../shared/types";
import type { ProcurementDecisionRecord } from "@/lib/procurement-intelligence";

function collectLinkedPairs(): Array<{
  outcome: TenderOutcome;
  decision: ProcurementDecisionRecord;
}> {
  const procurementById = new Map(
    runProcurementDecisionEngine().map((decision) => [decision.decisionId, decision]),
  );

  return buildOutcomeRegistry().records.flatMap((outcome) => {
    const decision = procurementById.get(outcome.decisionId);
    return decision ? [{ outcome, decision }] : [];
  });
}

function resolveProductReasonCode(outcome: TenderOutcomeStatus, winRate: number): string {
  if (outcome === "win") return winRate >= 70 ? "product-strong-fit" : "product-acceptable-fit";
  if (outcome === "loss") return "product-fit-gap";
  return "product-evaluation-pending";
}

let cachedReasons: OutcomeReason[] | undefined;

export function buildProductReasonAnalysis(): OutcomeReason[] {
  if (cachedReasons) return cachedReasons;

  const productWinRates = new Map(
    buildProductWinRateAnalytics().map((record) => [record.productId, record.winRate]),
  );

  cachedReasons = collectLinkedPairs().map(({ outcome, decision }) => {
    const winRate = productWinRates.get(decision.productId) ?? 50;

    return {
      tenderId: outcome.tenderId,
      outcome: outcome.outcome,
      reasonCategory: "product",
      reasonCode: resolveProductReasonCode(outcome.outcome, winRate),
      reasonWeight: Math.min(100, Math.round(winRate * 0.65 + outcome.confidence * 0.35)),
      reasonText: `product=${decision.productId} winRate=${winRate}% outcome=${outcome.outcome}`,
    };
  });

  return cachedReasons;
}
