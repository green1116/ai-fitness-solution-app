import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { buildOutcomeRegistry } from "../win-loss-foundation/outcome-registry";
import { buildSupplierWinRateAnalytics } from "../analytics/supplier-winrate-analytics";
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
    return decision && decision.supplierId ? [{ outcome, decision }] : [];
  });
}

function resolveSupplierReasonCode(outcome: TenderOutcomeStatus, winRate: number): string {
  if (outcome === "win") return "supplier-delivery-fit";
  if (outcome === "loss") return winRate < 50 ? "supplier-coverage-gap" : "supplier-risk";
  return "supplier-evaluation-pending";
}

let cachedReasons: OutcomeReason[] | undefined;

export function buildSupplierReasonAnalysis(): OutcomeReason[] {
  if (cachedReasons) return cachedReasons;

  const supplierWinRates = new Map(
    buildSupplierWinRateAnalytics().map((record) => [record.supplierId, record.winRate]),
  );

  cachedReasons = collectLinkedPairs().map(({ outcome, decision }) => {
    const winRate = supplierWinRates.get(decision.supplierId) ?? 50;

    return {
      tenderId: outcome.tenderId,
      outcome: outcome.outcome,
      reasonCategory: "supplier",
      reasonCode: resolveSupplierReasonCode(outcome.outcome, winRate),
      reasonWeight: Math.min(100, Math.round(winRate * 0.6 + outcome.confidence * 0.4)),
      reasonText: `supplier=${decision.supplierId} winRate=${winRate}% outcome=${outcome.outcome}`,
    };
  });

  return cachedReasons;
}
