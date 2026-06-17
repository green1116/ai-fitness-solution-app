import { findProductById } from "@/lib/equivalent-product-intelligence";
import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { buildOutcomeRegistry } from "../win-loss-foundation/outcome-registry";
import { buildBrandWinRateAnalytics } from "../analytics/brand-winrate-analytics";
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

function resolveBrandReasonCode(outcome: TenderOutcomeStatus, winRate: number): string {
  if (outcome === "win") return winRate >= 70 ? "brand-strong-fit" : "brand-positive-fit";
  if (outcome === "loss") return winRate < 50 ? "brand-weak-fit" : "brand-mismatch";
  return "brand-evaluation-pending";
}

let cachedReasons: OutcomeReason[] | undefined;

export function buildBrandReasonAnalysis(): OutcomeReason[] {
  if (cachedReasons) return cachedReasons;

  const brandWinRates = new Map(
    buildBrandWinRateAnalytics().map((record) => [record.brandId, record.winRate]),
  );

  cachedReasons = collectLinkedPairs().flatMap(({ outcome, decision }) => {
    const brandId = findProductById(decision.productId)?.brandId;
    if (!brandId) return [];

    const winRate = brandWinRates.get(brandId) ?? 50;

    return [
      {
        tenderId: outcome.tenderId,
        outcome: outcome.outcome,
        reasonCategory: "brand",
        reasonCode: resolveBrandReasonCode(outcome.outcome, winRate),
        reasonWeight: Math.min(100, Math.round(winRate * 0.7 + outcome.confidence * 0.3)),
        reasonText: `brand=${brandId} winRate=${winRate}% outcome=${outcome.outcome}`,
      },
    ];
  });

  return cachedReasons;
}
