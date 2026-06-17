import { findProductById } from "@/lib/equivalent-product-intelligence";
import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { buildOutcomeRegistry } from "../win-loss-foundation/outcome-registry";
import type { TenderOutcomeStatus } from "../shared/types";
import { type BrandWinRate, computeWinRate } from "./analytics-types";

type OutcomeCounter = {
  winCount: number;
  lossCount: number;
  pendingCount: number;
};

function incrementCounter(counter: OutcomeCounter, outcome: TenderOutcomeStatus): void {
  if (outcome === "win") counter.winCount += 1;
  else if (outcome === "loss") counter.lossCount += 1;
  else counter.pendingCount += 1;
}

function buildOutcomeByDecisionId(): Map<string, TenderOutcomeStatus> {
  return new Map(
    buildOutcomeRegistry().records.map((record) => [record.decisionId, record.outcome]),
  );
}

let cachedAnalytics: BrandWinRate[] | undefined;

export function buildBrandWinRateAnalytics(): BrandWinRate[] {
  if (cachedAnalytics) return cachedAnalytics;

  const outcomeByDecisionId = buildOutcomeByDecisionId();
  const counters = new Map<string, OutcomeCounter>();

  for (const decision of runProcurementDecisionEngine()) {
    const outcome = outcomeByDecisionId.get(decision.decisionId);
    if (!outcome || !decision.productId) continue;

    const brandId = findProductById(decision.productId)?.brandId;
    if (!brandId) continue;

    const counter = counters.get(brandId) ?? { winCount: 0, lossCount: 0, pendingCount: 0 };
    incrementCounter(counter, outcome);
    counters.set(brandId, counter);
  }

  cachedAnalytics = [...counters.entries()]
    .map(([brandId, counter]) => ({
      brandId,
      winCount: counter.winCount,
      lossCount: counter.lossCount,
      pendingCount: counter.pendingCount,
      winRate: computeWinRate(counter.winCount, counter.lossCount, counter.pendingCount),
    }))
    .sort((a, b) => b.winRate - a.winRate);

  return cachedAnalytics;
}
