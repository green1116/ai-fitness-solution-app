import type { TenderKnowledgeGraphMode } from "../shared/types";
import type { TenderStrategyRanking } from "../optimization/optimization-types";
import type { CompetitionAnalysisResult } from "../competition/competition-types";
import type { TenderWinProbabilityResult } from "../shared/types";

export type BidStrategyKind =
  | "aggressive-bid"
  | "balanced-bid"
  | "conservative-bid"
  | "cost-optimized-bid"
  | "high-confidence-bid"
  | "risk-mitigation-bid";

export type BidDecisionLevel = "bid" | "conditional-bid" | "no-bid" | "defer";

export interface BidStrategyScore {
  winFitScore: number;
  readinessScore: number;
  competitionFitScore: number;
  costFitScore: number;
  riskFitScore: number;
  confidenceScore: number;
  totalScore: number;
}

export interface BidStrategyContext {
  contextId: string;
  tenderId: string;
  winProbability: TenderWinProbabilityResult;
  competition: CompetitionAnalysisResult;
  optimizationRanking: TenderStrategyRanking;
  requirementCoverage: number;
  evidenceReadiness: number;
  brandStrength: number;
  competitionPressure: number;
  optimizationDelta: number;
  contextReady: boolean;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderBidStrategy {
  bidStrategyId: string;
  tenderId: string;
  strategyKind: BidStrategyKind;
  title: string;
  actionSummary: string;
  decisionLevel: BidDecisionLevel;
  score: BidStrategyScore;
  estimatedWinProbability: number;
  estimatedWinProbabilityDelta: number;
  gapReasoningRefs: string[];
  optimizationRefs: string[];
  mode: TenderKnowledgeGraphMode;
}

export interface BidStrategyRankingEntry {
  rank: number;
  bidStrategyId: string;
  strategyKind: BidStrategyKind;
  totalScore: number;
  decisionLevel: BidDecisionLevel;
  estimatedWinProbability: number;
}

export interface BidStrategyRanking {
  rankingId: string;
  tenderId: string;
  entries: BidStrategyRankingEntry[];
  optimalStrategy: TenderBidStrategy;
  alternativeStrategies: TenderBidStrategy[];
  mode: TenderKnowledgeGraphMode;
}

export interface BidSimulationResult {
  simulationId: string;
  tenderId: string;
  bidStrategyId: string;
  strategyKind: BidStrategyKind;
  baselineWinProbability: number;
  simulatedWinProbability: number;
  winProbabilityDelta: number;
  decisionLevel: BidDecisionLevel;
  deltaExplanation: string;
  totalScore: number;
  mode: TenderKnowledgeGraphMode;
}

export interface BidRecommendation {
  recommendationId: string;
  tenderId: string;
  optimalBidStrategy: TenderBidStrategy;
  decisionLevel: BidDecisionLevel;
  decisionSummary: string;
  gapSummary: string;
  riskSummary: string;
  estimatedWinProbability: number;
  estimatedWinProbabilityDelta: number;
  counterBidHints: string[];
  mode: TenderKnowledgeGraphMode;
}

export interface BidDecisionResult {
  decisionId: string;
  tenderId: string;
  recommendation: BidRecommendation;
  ranking: BidStrategyRanking;
  strategies: TenderBidStrategy[];
  decisionLevel: BidDecisionLevel;
  mode: TenderKnowledgeGraphMode;
}

export interface BidGapReasoning {
  reasoningId: string;
  tenderId: string;
  gapKind: string;
  severity: string;
  reasoning: string;
  bidImpact: string;
  traceRef: string;
  mode: TenderKnowledgeGraphMode;
}

export interface BidStrategyValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface TenderKnowledgeGraphPhase4Validation {
  valid: boolean;
  bidStrategyContext: BidStrategyValidation;
  bidStrategies: BidStrategyValidation;
  bidRanking: BidStrategyValidation;
  bidSimulation: BidStrategyValidation;
  bidDecision: BidStrategyValidation;
  compatibility: BidStrategyValidation;
}
