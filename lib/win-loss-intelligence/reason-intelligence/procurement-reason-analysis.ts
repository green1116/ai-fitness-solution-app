import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { buildOutcomeRegistry } from "../win-loss-foundation/outcome-registry";
import { buildProcurementWinRateAnalytics } from "../analytics/procurement-winrate-analytics";
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

function resolveProcurementReasonCode(
  outcome: TenderOutcomeStatus,
  procurementLevel: string,
): string {
  if (outcome === "win") {
    return procurementLevel === "preferred" ? "procurement-preferred" : "procurement-acceptable";
  }
  if (outcome === "loss") return "procurement-fallback-risk";
  return "procurement-defer-pending";
}

let cachedReasons: OutcomeReason[] | undefined;

export function buildProcurementReasonAnalysis(): OutcomeReason[] {
  if (cachedReasons) return cachedReasons;

  const procurementWinRates = new Map(
    buildProcurementWinRateAnalytics().map((record) => [
      record.procurementLevel,
      record.winRate,
    ]),
  );

  cachedReasons = collectLinkedPairs().map(({ outcome, decision }) => {
    const winRate = procurementWinRates.get(decision.procurementLevel) ?? 50;

    return {
      tenderId: outcome.tenderId,
      outcome: outcome.outcome,
      reasonCategory: "procurement",
      reasonCode: resolveProcurementReasonCode(outcome.outcome, decision.procurementLevel),
      reasonWeight: Math.min(100, Math.round(winRate * 0.55 + decision.totalScore * 0.45)),
      reasonText: `procurementLevel=${decision.procurementLevel} score=${decision.totalScore} outcome=${outcome.outcome}`,
    };
  });

  return cachedReasons;
}
