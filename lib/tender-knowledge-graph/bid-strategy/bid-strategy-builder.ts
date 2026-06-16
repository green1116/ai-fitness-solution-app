import type {
  BidDecisionLevel,
  BidStrategyKind,
  BidStrategyScore,
  TenderBidStrategy,
} from "./bid-strategy-types";
import { buildBidGapReasoning } from "./bid-gap-reasoning";
import { buildBidStrategyContext } from "./bid-strategy-context";

const BID_STRATEGY_META: Record<
  BidStrategyKind,
  { title: string; actionSummary: string; baseDecision: BidDecisionLevel }
> = {
  "aggressive-bid": {
    title: "Aggressive Bid",
    actionSummary: "maximize win probability with full capability exposure",
    baseDecision: "bid",
  },
  "balanced-bid": {
    title: "Balanced Bid",
    actionSummary: "balance win probability, cost, and delivery risk",
    baseDecision: "bid",
  },
  "conservative-bid": {
    title: "Conservative Bid",
    actionSummary: "minimize exposure while preserving qualified participation",
    baseDecision: "conditional-bid",
  },
  "cost-optimized-bid": {
    title: "Cost Optimized Bid",
    actionSummary: "optimize equipment mix and cost narrative for budget fit",
    baseDecision: "bid",
  },
  "high-confidence-bid": {
    title: "High Confidence Bid",
    actionSummary: "bid only when evidence and compliance readiness are strong",
    baseDecision: "bid",
  },
  "risk-mitigation-bid": {
    title: "Risk Mitigation Bid",
    actionSummary: "close blockers and reduce competition pressure before bidding",
    baseDecision: "conditional-bid",
  },
};

const ALL_BID_KINDS: BidStrategyKind[] = [
  "aggressive-bid",
  "balanced-bid",
  "conservative-bid",
  "cost-optimized-bid",
  "high-confidence-bid",
  "risk-mitigation-bid",
];

function scoreBidStrategy(
  kind: BidStrategyKind,
  ctx: ReturnType<typeof buildBidStrategyContext>,
): BidStrategyScore {
  const win = ctx.winProbability.winProbability;
  const req = ctx.requirementCoverage;
  const evidence = ctx.evidenceReadiness;
  const brand = ctx.brandStrength;
  const pressure = ctx.competitionPressure;
  const risk = ctx.competition.metrics.riskPressureScore;

  const profiles: Record<
    BidStrategyKind,
    { win: number; readiness: number; competition: number; cost: number; risk: number; confidence: number }
  > = {
    "aggressive-bid": { win: 1.0, readiness: 0.7, competition: 0.8, cost: 0.5, risk: 0.4, confidence: 0.7 },
    "balanced-bid": { win: 0.8, readiness: 0.8, competition: 0.7, cost: 0.7, risk: 0.7, confidence: 0.8 },
    "conservative-bid": { win: 0.5, readiness: 0.6, competition: 0.4, cost: 0.8, risk: 0.9, confidence: 0.6 },
    "cost-optimized-bid": { win: 0.6, readiness: 0.7, competition: 0.6, cost: 1.0, risk: 0.7, confidence: 0.7 },
    "high-confidence-bid": { win: 0.7, readiness: 1.0, competition: 0.7, cost: 0.6, risk: 0.8, confidence: 1.0 },
    "risk-mitigation-bid": { win: 0.4, readiness: 0.5, competition: 0.3, cost: 0.6, risk: 1.0, confidence: 0.5 },
  };

  const p = profiles[kind];
  const winFitScore = Math.min(100, Math.round(win * p.win + (100 - pressure) * p.competition * 0.3));
  const readinessScore = Math.min(100, Math.round((req * 0.4 + evidence * 0.4 + brand * 0.2) * p.readiness));
  const competitionFitScore = Math.min(100, Math.round((100 - pressure) * p.competition + win * 0.2));
  const costFitScore = Math.min(100, Math.round((100 - risk * 0.5) * p.cost));
  const riskFitScore = Math.min(100, Math.round((100 - risk) * p.risk));
  const confidenceScore = Math.min(
    100,
    Math.round((evidence * 0.35 + req * 0.35 + ctx.winProbability.complianceScore * 0.3) * p.confidence),
  );

  const totalScore = Math.round(
    winFitScore * 0.25 +
      readinessScore * 0.2 +
      competitionFitScore * 0.2 +
      costFitScore * 0.15 +
      riskFitScore * 0.1 +
      confidenceScore * 0.1,
  );

  return {
    winFitScore,
    readinessScore,
    competitionFitScore,
    costFitScore,
    riskFitScore,
    confidenceScore,
    totalScore,
  };
}

function resolveDecisionLevel(
  kind: BidStrategyKind,
  score: BidStrategyScore,
  ctx: ReturnType<typeof buildBidStrategyContext>,
): BidDecisionLevel {
  const meta = BID_STRATEGY_META[kind];
  if (ctx.winProbability.winLevel === "blocked") return "no-bid";
  if (score.totalScore < 45) return "defer";
  if (kind === "aggressive-bid" && ctx.competitionPressure >= 80) return "conditional-bid";
  if (kind === "high-confidence-bid" && ctx.evidenceReadiness < 60) return "conditional-bid";
  if (kind === "risk-mitigation-bid" && ctx.competition.metrics.riskPressureScore >= 70)
    return "conditional-bid";
  return meta.baseDecision;
}

function estimateWinDelta(kind: BidStrategyKind, ctx: ReturnType<typeof buildBidStrategyContext>): number {
  const bonus: Record<BidStrategyKind, number> = {
    "aggressive-bid": 8,
    "balanced-bid": 5,
    "conservative-bid": 2,
    "cost-optimized-bid": 4,
    "high-confidence-bid": 6,
    "risk-mitigation-bid": 3,
  };
  return Math.min(100 - ctx.winProbability.winProbability, ctx.optimizationDelta + bonus[kind]);
}

const cachedStrategies = new Map<string, TenderBidStrategy[]>();

export function generateBidStrategies(tenderId: string): TenderBidStrategy[] {
  const cached = cachedStrategies.get(tenderId);
  if (cached) return cached;

  const ctx = buildBidStrategyContext(tenderId);
  const gapReasoning = buildBidGapReasoning(tenderId);
  const optimizationRefs = ctx.optimizationRanking.entries.map((e) => e.strategyId);

  const strategies = ALL_BID_KINDS.map((kind) => {
    const meta = BID_STRATEGY_META[kind];
    const score = scoreBidStrategy(kind, ctx);
    const delta = estimateWinDelta(kind, ctx);

    return {
      bidStrategyId: `tkg-bid-${tenderId}-${kind}`,
      tenderId,
      strategyKind: kind,
      title: meta.title,
      actionSummary: meta.actionSummary,
      decisionLevel: resolveDecisionLevel(kind, score, ctx),
      score,
      estimatedWinProbability: Math.min(100, ctx.winProbability.winProbability + delta),
      estimatedWinProbabilityDelta: delta,
      gapReasoningRefs: gapReasoning.map((r) => r.reasoningId),
      optimizationRefs,
      mode: "tender-knowledge-graph" as const,
    };
  });

  cachedStrategies.set(tenderId, strategies);
  return strategies;
}
