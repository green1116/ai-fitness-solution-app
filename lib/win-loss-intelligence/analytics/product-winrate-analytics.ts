import { runProcurementDecisionEngine } from "@/lib/procurement-intelligence";
import { buildOutcomeRegistry } from "../win-loss-foundation/outcome-registry";
import type { TenderOutcomeStatus } from "../shared/types";
import { type ProductWinRate, computeWinRate } from "./analytics-types";

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

let cachedAnalytics: ProductWinRate[] | undefined;

export function buildProductWinRateAnalytics(): ProductWinRate[] {
  if (cachedAnalytics) return cachedAnalytics;

  const outcomeByDecisionId = buildOutcomeByDecisionId();
  const counters = new Map<string, OutcomeCounter>();

  for (const decision of runProcurementDecisionEngine()) {
    const outcome = outcomeByDecisionId.get(decision.decisionId);
    if (!outcome || !decision.productId) continue;

    const counter = counters.get(decision.productId) ?? {
      winCount: 0,
      lossCount: 0,
      pendingCount: 0,
    };
    incrementCounter(counter, outcome);
    counters.set(decision.productId, counter);
  }

  cachedAnalytics = [...counters.entries()]
    .map(([productId, counter]) => ({
      productId,
      winCount: counter.winCount,
      lossCount: counter.lossCount,
      pendingCount: counter.pendingCount,
      winRate: computeWinRate(counter.winCount, counter.lossCount, counter.pendingCount),
    }))
    .sort((a, b) => b.winRate - a.winRate);

  return cachedAnalytics;
}
