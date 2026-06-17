import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { buildOutcomeRegistry } from "../win-loss-foundation/outcome-registry";
import type { TenderOutcome } from "../shared/types";
import { buildBrandReasonAnalysis } from "./brand-reason-analysis";
import { buildProductReasonAnalysis } from "./product-reason-analysis";
import { buildProcurementReasonAnalysis } from "./procurement-reason-analysis";
import { buildSupplierReasonAnalysis } from "./supplier-reason-analysis";
import type { OutcomeReason, ReasonCategory, RootCauseAnalysis } from "./reason-types";

function buildDecisionReasonAnalysis(): OutcomeReason[] {
  return buildOutcomeRegistry().records.flatMap((outcome) =>
    outcome.reasonCodes.map((reasonCode) => ({
      tenderId: outcome.tenderId,
      outcome: outcome.outcome,
      reasonCategory: "decision" as ReasonCategory,
      reasonCode,
      reasonWeight: Math.min(100, Math.round(outcome.confidence * 0.85)),
      reasonText: `decision-factor=${reasonCode}`,
    })),
  );
}

let cachedReasons: OutcomeReason[] | undefined;
let cachedRootCauses: RootCauseAnalysis[] | undefined;

export function buildOutcomeReasons(): OutcomeReason[] {
  if (cachedReasons) return cachedReasons;

  cachedReasons = [
    ...buildBrandReasonAnalysis(),
    ...buildProductReasonAnalysis(),
    ...buildSupplierReasonAnalysis(),
    ...buildProcurementReasonAnalysis(),
    ...buildDecisionReasonAnalysis(),
  ];

  return cachedReasons;
}

function buildRootCauseForOutcome(
  outcome: TenderOutcome,
  reasons: OutcomeReason[],
): RootCauseAnalysis {
  const procurementById = new Map(
    runProcurementDecisionEngine().map((decision) => [decision.decisionId, decision]),
  );
  const decision = procurementById.get(outcome.decisionId);

  const scopedReasons = reasons.filter((reason) => {
    if (reason.tenderId !== outcome.tenderId || reason.outcome !== outcome.outcome) {
      return false;
    }
    if (!decision) return true;
    return (
      reason.reasonText.includes(decision.productId) ||
      reason.reasonText.includes(decision.supplierId) ||
      reason.reasonText.includes(decision.procurementLevel) ||
      reason.reasonCategory === "decision"
    );
  });

  const ranked = [...scopedReasons].sort((a, b) => b.reasonWeight - a.reasonWeight);
  const topReasons = ranked.slice(0, 3).map((reason) => reason.reasonCode);
  const top = ranked[0];

  return {
    tenderId: outcome.tenderId,
    outcome: outcome.outcome,
    topReasons,
    rootCause: top
      ? `${top.reasonCategory}:${top.reasonCode}`
      : outcome.reasonCodes[0] ?? "unknown-root-cause",
    confidence: top
      ? Math.min(95, Math.round((top.reasonWeight + outcome.confidence) / 2))
      : outcome.confidence,
  };
}

export function buildRootCauseAnalysis(): RootCauseAnalysis[] {
  if (cachedRootCauses) return cachedRootCauses;

  const reasons = buildOutcomeReasons();
  cachedRootCauses = buildOutcomeRegistry().records.map((outcome) =>
    buildRootCauseForOutcome(outcome, reasons),
  );

  return cachedRootCauses;
}
