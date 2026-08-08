/**
 * V80 Pilot P16 — Organization benchmark platform schema (read-only portfolio analytics)
 */

export const ORG_BENCHMARK_VERSION = "v80-pilot-p16-benchmark-1";

export type BenchmarkCategoryId =
  | "intake_throughput"
  | "quality_confidence"
  | "clarification_discipline"
  | "compliance_hygiene"
  | "knowledge_maturity"
  | "recommendation_effectiveness"
  | "governance_discipline"
  | "improvement_loop";

export type BenchmarkBand = "leading" | "strong" | "average" | "lagging" | "critical";

export type BenchmarkPolarity = "strength" | "weakness" | "neutral";

export type MaturityLevel =
  | "nascent"
  | "developing"
  | "established"
  | "advanced"
  | "leading";

export type CategoryBenchmark = {
  id: BenchmarkCategoryId;
  label: string;
  score: number;
  /** 0–100 vs deterministic reference targets (not cross-tenant) */
  percentile: number;
  band: BenchmarkBand;
  polarity: BenchmarkPolarity;
  weight: number;
  trendDelta: number;
  metrics: Record<string, number | string>;
  summary: string;
};

export type MaturityAssessment = {
  level: MaturityLevel;
  score: number;
  rationale: string;
  criteriaMet: string[];
  criteriaMissed: string[];
};

export type BenchmarkOpportunity = {
  id: string;
  categoryId: BenchmarkCategoryId;
  severity: "high" | "medium" | "low";
  title: string;
  rationale: string;
  recommendedAction: string;
  impactScore: number;
};

export type BenchmarkTrendPoint = {
  date: string;
  overallScoreApprox: number;
  readyRate: number;
  acceptRate: number;
  complianceBlockRate: number;
};

export type OrganizationScorecard = {
  overallScore: number;
  overallPercentile: number;
  overallBand: BenchmarkBand;
  strengths: BenchmarkCategoryId[];
  weaknesses: BenchmarkCategoryId[];
  categories: CategoryBenchmark[];
};

export type OrgBenchmarkReport = {
  version: typeof ORG_BENCHMARK_VERSION;
  organizationId: string;
  generatedAt: string;
  contentHash: string;
  window: { from?: string; to?: string; sessionCount: number };
  scorecard: OrganizationScorecard;
  maturity: MaturityAssessment;
  opportunities: BenchmarkOpportunity[];
  trends: BenchmarkTrendPoint[];
  sources: {
    analyticsHash?: string;
    knowledgePatternCount: number;
    governanceRevision: number;
    improvementSuggestions: number;
    recommendationAcceptRate: number;
  };
};
