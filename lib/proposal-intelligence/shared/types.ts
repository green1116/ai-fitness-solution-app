import type { ProjectType } from "@/lib/procurement-intelligence/shared/types";

export const PROPOSAL_INTELLIGENCE_VERSION = "v24-proposal-intelligence-4" as const;
export const PROPOSAL_INTELLIGENCE_TAG = "v24-proposal-intelligence" as const;

export type { ProjectType };

export type RiskLevel = "low" | "medium" | "high";

export interface ProposalIntelligenceInput {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
}

export interface ProposalScoreBreakdown {
  score: number;
  catalogScore: number;
  supplierScore: number;
  procurementScore: number;
  deliveryScore: number;
  coverageScore: number;
}

export interface ProposalRisk {
  category:
    | "inventory"
    | "supplier-concentration"
    | "lead-time"
    | "service-coverage"
    | "pricing";
  level: RiskLevel;
  description: string;
}

export interface ProposalRecommendationOutput {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface ProposalIntelligenceReport {
  score: number;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  recommendations: string[];
  readiness: number;
}

export interface ProposalIntelligenceValidation {
  valid: boolean;
  scoreGenerated: boolean;
  riskGenerated: boolean;
  recommendationGenerated: boolean;
}

export interface ProposalIntelligenceSummaryReport {
  version: typeof PROPOSAL_INTELLIGENCE_VERSION;
  reportId: string;
  input: ProposalIntelligenceInput;
  scoreBreakdown: ProposalScoreBreakdown;
  riskAnalysis: ProposalRisk[];
  intelligence: ProposalIntelligenceReport;
  validation: ProposalIntelligenceValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_PROPOSAL_INTELLIGENCE_QUERY = {
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym" as const,
} satisfies ProposalIntelligenceInput;

export type PressureLevel = "low" | "medium" | "high";

export type WinConfidence = "low" | "medium" | "high";

export interface TenderContextProfile {
  tenderType: string;
  region: string;
  budgetPressure: PressureLevel;
  deliveryPressure: PressureLevel;
  competitionLevel: PressureLevel;
}

export interface CompetitivePositionAnalysis {
  pricePosition: number;
  deliveryPosition: number;
  supplierPosition: number;
  coveragePosition: number;
  riskPosition: number;
  strengths: string[];
  weaknesses: string[];
  competitiveRank: number;
  positionScore: number;
}

export interface WinProbabilityModel {
  baseProbability: number;
  adjustedProbability: number;
  confidence: WinConfidence;
  reasons: string[];
}

export interface WinProbabilityValidation {
  valid: boolean;
  proposalScoreExists: boolean;
  riskAnalysisExists: boolean;
  tenderContextExists: boolean;
  probabilityGenerated: boolean;
  competitivePositionGenerated: boolean;
}

export interface BidWinProbabilityReport {
  version: typeof PROPOSAL_INTELLIGENCE_VERSION;
  reportId: string;
  input: ProposalIntelligenceInput;
  winProbability: number;
  competitivePosition: CompetitivePositionAnalysis;
  keyReasons: string[];
  keyRisks: string[];
  recommendations: string[];
  tenderContext: TenderContextProfile;
  winProbabilityModel: WinProbabilityModel;
  validation: WinProbabilityValidation;
  summary: string;
  generatedAt: string;
}

export type BidStrategyType =
  | "high-confidence"
  | "balanced"
  | "aggressive"
  | "cost-optimized";

export interface BidStrategyInput {
  proposalScore: number;
  risks: ProposalRisk[];
  winProbability: number;
}

export interface BidStrategy {
  strategyType: BidStrategyType;
  expectedWinRate: number;
  pricingAdjustment: string;
  supplierAdjustment: string;
  inventoryAdjustment: string;
  recommendations: string[];
}

export interface BidStrategyValidation {
  valid: boolean;
  strategyGenerated: boolean;
  expectedWinRateGenerated: boolean;
  adjustmentsGenerated: boolean;
  recommendationsGenerated: boolean;
}

export interface BidStrategyReport {
  version: typeof PROPOSAL_INTELLIGENCE_VERSION;
  reportId: string;
  input: ProposalIntelligenceInput;
  proposalScore: number;
  winProbability: number;
  strategy: BidStrategy;
  expectedWinRate: number;
  expectedMargin: string;
  expectedRisk: string;
  rationale: string[];
  validation: BidStrategyValidation;
  summary: string;
  generatedAt: string;
}

export interface ProposalIntelligenceCoverageStats {
  scoreCoverage: number;
  riskCoverage: number;
  recommendationCoverage: number;
  winProbabilityCoverage: number;
  bidStrategyCoverage: number;
  coverageScore: number;
}

export interface ProposalIntelligenceFreezeValidation {
  valid: boolean;
  phase1Valid: boolean;
  phase2Valid: boolean;
  phase3Valid: boolean;
  validationScore: number;
}

export interface ProposalIntelligenceReadiness {
  readinessScore: number;
  validationScore: number;
  coverageScore: number;
  proposalScore: number;
  winProbability: number;
  strategyType: BidStrategyType;
}

export interface ProposalIntelligenceFreezeReport {
  version: typeof PROPOSAL_INTELLIGENCE_VERSION;
  tag: typeof PROPOSAL_INTELLIGENCE_TAG;
  reportId: string;
  status: "frozen";
  coverage: ProposalIntelligenceCoverageStats;
  validation: ProposalIntelligenceFreezeValidation;
  readiness: ProposalIntelligenceReadiness;
  exampleStrategyReport: BidStrategyReport | null;
  moduleStatistics: {
    frozenDomains: number;
    scoringDimensions: number;
    riskCategories: number;
    strategyTypes: number;
    validationGates: number;
    reportBuilders: number;
  };
  canonicalQuery: ProposalIntelligenceInput;
  summary: string;
  generatedAt: string;
}

export interface ProposalIntelligenceFreezeEvidence {
  evidenceId: string;
  version: typeof PROPOSAL_INTELLIGENCE_VERSION;
  tag: typeof PROPOSAL_INTELLIGENCE_TAG;
  freezeManifest: {
    frozenDomains: string[];
    canonicalQuery: ProposalIntelligenceInput;
    proposalScore: number;
    winProbability: number;
    strategyType: BidStrategyType;
  };
  coverage: ProposalIntelligenceCoverageStats;
  readiness: ProposalIntelligenceReadiness;
  validationPassed: boolean;
  generatedAt: string;
  summary: string;
}
