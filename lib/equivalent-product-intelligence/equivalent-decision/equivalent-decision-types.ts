import type { EquivalentProductIntelligenceMode } from "../shared/constants";
import type {
  CompatibilityLevel,
  SubstitutionRiskLevel,
} from "../substitution/substitution-types";

export type EquivalentDecisionLevel =
  | "substitute"
  | "conditional-substitute"
  | "no-substitute"
  | "defer";

export interface RequirementProductMatch {
  matchId: string;
  requirementId: string;
  primaryProductId: string;
  equivalentProductIds: string[];
  specFitScore: number;
  fitScore: number;
  confidence: number;
  mode: EquivalentProductIntelligenceMode;
}

export interface EquivalentCandidateScore {
  compatibilityScore: number;
  riskScore: number;
  evidenceCoverageScore: number;
  brandFitScore: number;
  commercialFitScore: number;
  confidenceScore: number;
  totalScore: number;
}

export interface EquivalentCandidateRankingEntry {
  rank: number;
  requirementId: string;
  productId: string;
  sourceProductId: string;
  decisionLevel: EquivalentDecisionLevel;
  compatibilityLevel: CompatibilityLevel;
  riskLevel: SubstitutionRiskLevel;
  score: EquivalentCandidateScore;
  mode: EquivalentProductIntelligenceMode;
}

export interface EquivalentCandidateRanking {
  rankingId: string;
  requirementId: string;
  entries: EquivalentCandidateRankingEntry[];
  optimalProductId: string;
  alternativeProductIds: string[];
  mode: EquivalentProductIntelligenceMode;
}

export interface EquivalentSubstitutionSimulation {
  simulationId: string;
  requirementId: string;
  targetProductId: string;
  baselineProductId: string;
  compatibilityDelta: number;
  riskDelta: number;
  evidenceDelta: number;
  readinessDelta: number;
  deltaExplanation: string;
  mode: EquivalentProductIntelligenceMode;
}

export interface EquivalentRecommendation {
  recommendationId: string;
  requirementId: string;
  optimalProductId: string;
  alternativeProductIds: string[];
  decisionLevel: EquivalentDecisionLevel;
  riskSummary: string;
  compatibilitySummary: string;
  recommendationSummary: string;
  mode: EquivalentProductIntelligenceMode;
}

export interface EquivalentDecision {
  decisionId: string;
  requirementId: string;
  optimalProductId: string;
  candidateProductIds: string[];
  decisionLevel: EquivalentDecisionLevel;
  decisionReason: string[];
  riskSummary: string;
  compatibilitySummary: string;
  recommendationSummary: string;
  mode: EquivalentProductIntelligenceMode;
}

export interface EquivalentDecisionValidation {
  valid: boolean;
  matcherReady: boolean;
  rankingReady: boolean;
  simulationReady: boolean;
  recommendationReady: boolean;
  decisionEngineReady: boolean;
  decisionCount: number;
  summary: string;
}

export interface EquivalentProductIntelligencePhase4Validation {
  valid: boolean;
  phase3Valid: boolean;
  equivalentDecision: EquivalentDecisionValidation;
}

export interface EquivalentProductIntelligenceFoundationValidation {
  valid: boolean;
  phase1Valid: boolean;
  phase2Valid: boolean;
  phase3Valid: boolean;
  phase4Valid: boolean;
  foundationValid: boolean;
}

export interface EquivalentProductIntelligencePhase4FreezeMeta {
  tag: string;
  version: string;
  phase: number;
  valid: boolean;
}

export interface EquivalentProductIntelligenceFoundationFreezeMeta {
  tag: string;
  version: string;
  valid: boolean;
}

export interface EquivalentProductIntelligenceFoundationContext {
  contextId: string;
  phase1Valid: boolean;
  phase2Valid: boolean;
  phase3Valid: boolean;
  phase4Valid: boolean;
  foundationValid: boolean;
  decisionCount: number;
  contextReady: boolean;
  mode: EquivalentProductIntelligenceMode;
}
