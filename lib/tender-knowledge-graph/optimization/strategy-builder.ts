import type {
  TenderOptimizationGap,
  TenderStrategyKind,
  TenderStrategyPriority,
  TenderStrategyScoreBreakdown,
} from "./optimization-types";
import { buildTenderOptimizationGaps } from "./optimization-gap";
import { buildTenderStrategyContext } from "./strategy-context";

const GAP_TO_STRATEGY: Record<string, TenderStrategyKind> = {
  "requirement-coverage": "requirement-gap-fill",
  "evidence-readiness": "evidence-boost",
  "compliance-score": "compliance-boost",
  "requirement-vs-competitor": "requirement-gap-fill",
  "evidence-vs-competitor": "evidence-boost",
  "compliance-vs-competitor": "compliance-boost",
  "competition-pressure": "competition-pressure-mitigation",
  "alternative-solution-risk": "solution-replacement",
  "compliance-blockers": "compliance-boost",
  "maintain-position": "low-score-fix",
};

const STRATEGY_META: Record<
  TenderStrategyKind,
  { title: string; actionSummary: string; baseEffort: number; baseFeasibility: number }
> = {
  "evidence-boost": {
    title: "Evidence Readiness Boost",
    actionSummary: "attach missing evidence and improve freshness coverage",
    baseEffort: 35,
    baseFeasibility: 80,
  },
  "compliance-boost": {
    title: "Compliance Gap Closure",
    actionSummary: "resolve compliance blockers and raise pass rate",
    baseEffort: 45,
    baseFeasibility: 75,
  },
  "brand-alternative": {
    title: "Brand Alternative Alignment",
    actionSummary: "realign primary brand with stronger evidence-backed alternative",
    baseEffort: 55,
    baseFeasibility: 65,
  },
  "requirement-gap-fill": {
    title: "Requirement Coverage Fill",
    actionSummary: "close uncovered requirements and raise tender coverage",
    baseEffort: 40,
    baseFeasibility: 78,
  },
  "low-score-fix": {
    title: "Low Score Remediation",
    actionSummary: "target lowest scoring compliance factors for quick uplift",
    baseEffort: 30,
    baseFeasibility: 85,
  },
  "competition-pressure-mitigation": {
    title: "Competition Pressure Mitigation",
    actionSummary: "differentiate against dominant competitor pressure points",
    baseEffort: 50,
    baseFeasibility: 70,
  },
  "solution-replacement": {
    title: "Alternative Solution Replacement",
    actionSummary: "replace high-risk alternative paths with preferred solution stack",
    baseEffort: 48,
    baseFeasibility: 72,
  },
  "cost-optimization": {
    title: "Cost Efficiency Optimization",
    actionSummary: "optimize equipment mix for budget fit without compliance loss",
    baseEffort: 25,
    baseFeasibility: 88,
  },
  "delivery-risk-reduction": {
    title: "Delivery Risk Reduction",
    actionSummary: "strengthen supplier authorization and delivery readiness",
    baseEffort: 38,
    baseFeasibility: 82,
  },
};

function resolvePriority(gap: TenderOptimizationGap): TenderStrategyPriority {
  if (gap.severity === "critical") return "critical";
  if (gap.severity === "high") return "high";
  if (gap.severity === "medium") return "medium";
  return "low";
}

export function buildStrategyScoreBreakdown(
  gap: TenderOptimizationGap,
  strategyKind: TenderStrategyKind,
  competitionPressure: number,
): TenderStrategyScoreBreakdown {
  const meta = STRATEGY_META[strategyKind];
  const impactScore = Math.min(100, gap.gapScore + 10);
  const feasibilityScore = meta.baseFeasibility;
  const costEfficiencyScore = Math.min(100, 100 - meta.baseEffort);
  const riskReductionScore = Math.min(100, Math.round(gap.gapScore * 0.8));
  const competitorPressureReductionScore =
    strategyKind === "competition-pressure-mitigation"
      ? Math.min(100, competitionPressure)
      : Math.min(100, Math.round(competitionPressure * 0.35));

  const strategyScore = Math.round(
    impactScore * 0.3 +
      feasibilityScore * 0.2 +
      costEfficiencyScore * 0.15 +
      riskReductionScore * 0.2 +
      competitorPressureReductionScore * 0.15,
  );

  return {
    impactScore,
    feasibilityScore,
    costEfficiencyScore,
    riskReductionScore,
    competitorPressureReductionScore,
    strategyScore,
  };
}

export function estimateWinProbabilityDeltaFromGap(
  gap: TenderOptimizationGap,
  strategyKind: TenderStrategyKind,
  baselineWinProbability: number,
): { delta: number; explanation: string } {
  const upliftBase = Math.min(18, Math.round(gap.gapScore * 0.15));
  const kindBonus: Partial<Record<TenderStrategyKind, number>> = {
    "evidence-boost": 4,
    "compliance-boost": 5,
    "requirement-gap-fill": 4,
    "competition-pressure-mitigation": 6,
    "solution-replacement": 3,
    "delivery-risk-reduction": 2,
    "cost-optimization": 2,
    "low-score-fix": 3,
    "brand-alternative": 4,
  };
  const delta = Math.min(
    100 - baselineWinProbability,
    upliftBase + (kindBonus[strategyKind] ?? 2),
  );
  return {
    delta,
    explanation: `gap=${gap.gapKind} severity=${gap.severity} uplift=${delta} from baseline=${baselineWinProbability}`,
  };
}

export function buildStrategyCandidatesForTender(tenderId: string) {
  const context = buildTenderStrategyContext(tenderId);
  const gaps = buildTenderOptimizationGaps(tenderId);
  const seen = new Set<TenderStrategyKind>();

  return gaps
    .map((gap) => {
      const strategyKind = GAP_TO_STRATEGY[gap.gapKind] ?? "low-score-fix";
      if (seen.has(strategyKind) && gap.gapKind !== "maintain-position") return undefined;
      seen.add(strategyKind);

      const meta = STRATEGY_META[strategyKind];
      const scoreBreakdown = buildStrategyScoreBreakdown(
        gap,
        strategyKind,
        context.competitionPressure,
      );
      const { delta, explanation } = estimateWinProbabilityDeltaFromGap(
        gap,
        strategyKind,
        context.baselineWinProbability,
      );

      return {
        strategyId: `tkg-strategy-${tenderId}-${strategyKind}`,
        tenderId,
        strategyKind,
        priority: resolvePriority(gap),
        title: meta.title,
        actionSummary: meta.actionSummary,
        estimatedWinProbabilityDelta: delta,
        estimatedEffortCost: meta.baseEffort,
        expectedImpact: scoreBreakdown.impactScore,
        scoreBreakdown,
        gapRefs: [gap.gapId],
        riskMitigation: `mitigate:${gap.gapKind}`,
        deltaExplanation: explanation,
        mode: "tender-knowledge-graph" as const,
      };
    })
    .filter(Boolean);
}

export { STRATEGY_META, GAP_TO_STRATEGY };
