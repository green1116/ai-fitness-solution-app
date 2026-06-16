import type { TenderKnowledgeGraphMode } from "../shared/types";
import type { CompetitionAnalysisResult } from "../competition/competition-types";
import type { TenderWinProbabilityResult } from "../shared/types";

export type TenderStrategyKind =
  | "evidence-boost"
  | "compliance-boost"
  | "brand-alternative"
  | "requirement-gap-fill"
  | "low-score-fix"
  | "competition-pressure-mitigation"
  | "solution-replacement"
  | "cost-optimization"
  | "delivery-risk-reduction";

export type TenderStrategyPriority = "critical" | "high" | "medium" | "low";

export interface TenderStrategyScoreBreakdown {
  impactScore: number;
  feasibilityScore: number;
  costEfficiencyScore: number;
  riskReductionScore: number;
  competitorPressureReductionScore: number;
  strategyScore: number;
}

export interface TenderStrategyContext {
  contextId: string;
  tenderId: string;
  winProbability: TenderWinProbabilityResult;
  competition: CompetitionAnalysisResult;
  baselineWinProbability: number;
  competitionPressure: number;
  requirementCoverage: number;
  evidenceReadiness: number;
  brandAlignment: number;
  complianceScore: number;
  contextReady: boolean;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderOptimizationGap {
  gapId: string;
  tenderId: string;
  gapKind: string;
  severity: "critical" | "high" | "medium" | "low";
  gapScore: number;
  summary: string;
  traceRef: string;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderStrategyRecommendation {
  strategyId: string;
  tenderId: string;
  strategyKind: TenderStrategyKind;
  priority: TenderStrategyPriority;
  title: string;
  actionSummary: string;
  estimatedWinProbabilityDelta: number;
  estimatedEffortCost: number;
  expectedImpact: number;
  scoreBreakdown: TenderStrategyScoreBreakdown;
  gapRefs: string[];
  riskMitigation: string;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderStrategyRankingEntry {
  rank: number;
  strategyId: string;
  strategyKind: TenderStrategyKind;
  strategyScore: number;
  estimatedWinProbabilityDelta: number;
  priority: TenderStrategyPriority;
}

export interface TenderStrategyRanking {
  rankingId: string;
  tenderId: string;
  entries: TenderStrategyRankingEntry[];
  topRecommendation: TenderStrategyRecommendation;
  secondaryRecommendations: TenderStrategyRecommendation[];
  gapSummary: string;
  riskSummary: string;
  estimatedWinProbabilityDelta: number;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderSimulationResult {
  simulationId: string;
  tenderId: string;
  strategyId: string;
  strategyKind: TenderStrategyKind;
  baselineWinProbability: number;
  simulatedWinProbability: number;
  winProbabilityDelta: number;
  deltaExplanation: string;
  strategyScore: number;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderOptimizationValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface TenderKnowledgeGraphPhase3Validation {
  valid: boolean;
  strategyContext: TenderOptimizationValidation;
  optimizationGaps: TenderOptimizationValidation;
  recommendations: TenderOptimizationValidation;
  strategyRanking: TenderOptimizationValidation;
  simulation: TenderOptimizationValidation;
  winProbabilityDelta: TenderOptimizationValidation;
  compatibility: TenderOptimizationValidation;
}
