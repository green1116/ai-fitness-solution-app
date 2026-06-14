import type { ProjectType } from "@/lib/procurement-intelligence/shared/types";

export const TENDER_KNOWLEDGE_VERSION = "v25-tender-knowledge-4" as const;
export const TENDER_KNOWLEDGE_TAG = "v25-tender-knowledge-layer" as const;

export type TenderKnowledgeDataMode = "tender-knowledge";

export type ProjectIndustry = ProjectType;

export type BidOutcomeStatus = "won" | "lost" | "pending" | "withdrawn";

export type TenderArchiveStatus = "completed" | "active" | "archived";

export interface HistoricalTender {
  tenderId: string;
  projectName: string;
  city: string;
  industry: ProjectIndustry;
  budgetMin: number;
  budgetMax: number;
  tenderDate: string;
  status: TenderArchiveStatus;
  mode: TenderKnowledgeDataMode;
}

export interface HistoricalProposal {
  proposalId: string;
  tenderId: string;
  sku: string;
  brand: string;
  quantity: number;
  finalPrice: number;
  proposalScore: number;
  winProbability: number;
  strategyType: string;
  submittedAt: string;
  mode: TenderKnowledgeDataMode;
}

export interface HistoricalBidOutcome {
  outcomeId: string;
  tenderId: string;
  proposalId: string;
  outcome: BidOutcomeStatus;
  winPrice: number | null;
  competitorCount: number;
  marginPercent: number | null;
  recordedAt: string;
  mode: TenderKnowledgeDataMode;
}

export interface BenchmarkProfile {
  benchmarkId: string;
  industry: ProjectIndustry;
  city: string;
  avgWinProbability: number;
  avgProposalScore: number;
  avgMarginPercent: number;
  sampleSize: number;
  mode: TenderKnowledgeDataMode;
}

export interface IndustryDistributionEntry {
  industry: ProjectIndustry;
  count: number;
}

export interface CityDistributionEntry {
  city: string;
  count: number;
}

export interface TenderKnowledgeValidation {
  valid: boolean;
  projectArchiveValid: boolean;
  proposalArchiveValid: boolean;
  bidOutcomeValid: boolean;
  benchmarkValid: boolean;
}

export interface TenderKnowledgeReport {
  version: typeof TENDER_KNOWLEDGE_VERSION;
  reportId: string;
  projectCount: number;
  proposalCount: number;
  winCount: number;
  industryDistribution: IndustryDistributionEntry[];
  cityDistribution: CityDistributionEntry[];
  validation: TenderKnowledgeValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_TENDER_KNOWLEDGE_QUERY = {
  tenderId: "tender-sh-commercial-gym-2025-001",
} as const;

export interface SimilarProjectMatchInput {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectIndustry;
  quantityRangePercent?: number;
}

export interface SimilarProjectMatchDimensions {
  industry: boolean;
  city: boolean;
  sku: boolean;
  projectType: boolean;
  quantityRange: boolean;
}

export interface SimilarHistoricalProject {
  tender: HistoricalTender;
  proposal: HistoricalProposal;
  outcome: HistoricalBidOutcome | null;
  matchScore: number;
  matchedDimensions: SimilarProjectMatchDimensions;
}

export interface BenchmarkAdjustmentInput {
  baselineProbability: number;
  industry: ProjectIndustry;
  city: string;
}

export interface BenchmarkAdjustment {
  industryAdjustment: number;
  cityAdjustment: number;
  confidenceAdjustment: number;
  industryBenchmarkRate: number;
  cityBenchmarkRate: number;
  industryBenchmark: BenchmarkProfile | null;
  cityBenchmark: BenchmarkProfile | null;
}

export interface KnowledgeAssistedWinProbabilityInput {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectIndustry;
  quantityRangePercent?: number;
}

export interface KnowledgeAssistedWinProbability {
  baselineProbability: number;
  historicalWinRate: number;
  historicalAdjustment: number;
  benchmarkAdjustment: number;
  benchmarkDetails: BenchmarkAdjustment;
  calibratedProbability: number;
  confidence: "low" | "medium" | "high";
  similarProjects: SimilarHistoricalProject[];
}

export interface KnowledgeAssistedWinProbabilityValidation {
  valid: boolean;
  historicalMatchExists: boolean;
  benchmarkExists: boolean;
  calibratedProbabilityExists: boolean;
}

export interface KnowledgeAssistedWinProbabilityReport {
  version: typeof TENDER_KNOWLEDGE_VERSION;
  reportId: string;
  input: KnowledgeAssistedWinProbabilityInput;
  similarProjects: SimilarHistoricalProject[];
  benchmarkDetails: BenchmarkAdjustment;
  winProbability: KnowledgeAssistedWinProbability;
  validation: KnowledgeAssistedWinProbabilityValidation;
  summary: string;
  generatedAt: string;
}

export const CANONICAL_KNOWLEDGE_ASSISTED_QUERY = {
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym" as const,
} satisfies KnowledgeAssistedWinProbabilityInput;

export interface TenderKnowledgeCoverageStats {
  projectArchiveCoverage: number;
  proposalArchiveCoverage: number;
  bidOutcomeCoverage: number;
  benchmarkCoverage: number;
  knowledgeCoverage: number;
  coverageScore: number;
}

export interface TenderKnowledgeFreezeValidation {
  valid: boolean;
  phase1Valid: boolean;
  phase2Valid: boolean;
  validationScore: number;
}

export interface TenderKnowledgeReadiness {
  readinessScore: number;
  validationScore: number;
  coverageScore: number;
  baselineProbability: number;
  calibratedProbability: number;
  confidence: KnowledgeAssistedWinProbability["confidence"];
}

export interface TenderKnowledgeFreezeReport {
  version: typeof TENDER_KNOWLEDGE_VERSION;
  tag: typeof TENDER_KNOWLEDGE_TAG;
  reportId: string;
  status: "frozen";
  coverage: TenderKnowledgeCoverageStats;
  validation: TenderKnowledgeFreezeValidation;
  readiness: TenderKnowledgeReadiness;
  exampleKnowledgeReport: KnowledgeAssistedWinProbabilityReport | null;
  moduleStatistics: {
    frozenDomains: number;
    archiveCatalogs: number;
    matchingDimensions: number;
    validationGates: number;
    reportBuilders: number;
  };
  canonicalQuery: typeof CANONICAL_KNOWLEDGE_ASSISTED_QUERY;
  summary: string;
  generatedAt: string;
}

export interface TenderKnowledgeFreezeEvidence {
  evidenceId: string;
  version: typeof TENDER_KNOWLEDGE_VERSION;
  tag: typeof TENDER_KNOWLEDGE_TAG;
  freezeManifest: {
    frozenDomains: string[];
    canonicalQuery: typeof CANONICAL_KNOWLEDGE_ASSISTED_QUERY;
    baselineProbability: number;
    calibratedProbability: number;
    confidence: KnowledgeAssistedWinProbability["confidence"];
  };
  coverage: TenderKnowledgeCoverageStats;
  readiness: TenderKnowledgeReadiness;
  validationPassed: boolean;
  generatedAt: string;
  summary: string;
}
