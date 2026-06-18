import type {
  OptimizationOpportunitySource,
  OptimizationOpportunityType,
  OptimizationPriority,
  OptimizationRecommendationType,
  PerformanceIntelligenceMode,
} from "../shared/constants";
import type { BenchmarkContext } from "../benchmark-layer/benchmark-types";
import type { PerformanceRegistry } from "../shared/types";

export type {
  OptimizationOpportunitySource,
  OptimizationOpportunityType,
  OptimizationPriority,
  OptimizationRecommendationType,
};

export interface OptimizationOpportunityRecord {
  opportunityId: string;
  type: OptimizationOpportunityType;
  source: OptimizationOpportunitySource;
  priority: OptimizationPriority;
  description: string;
  expectedImpact: number;
  entityId?: string;
  projectId?: string;
}

export interface OptimizationRecommendationRecord {
  recommendationId: string;
  opportunityId: string;
  recommendationType: OptimizationRecommendationType;
  confidence: number;
  expectedScoreIncrease: number;
}

export interface OptimizationOpportunityRegistry {
  registryId: string;
  records: OptimizationOpportunityRecord[];
  count: number;
  highPriorityCount: number;
  mode: PerformanceIntelligenceMode;
}

export interface OptimizationRecommendationRegistry {
  registryId: string;
  records: OptimizationRecommendationRecord[];
  count: number;
  averageConfidence: number;
  mode: PerformanceIntelligenceMode;
}

export interface OptimizationReasoning {
  reasoningId: string;
  opportunityId: string;
  reasonCodes: string[];
  mode: PerformanceIntelligenceMode;
}

export interface OptimizationContext {
  contextId: string;
  performance: PerformanceRegistry;
  benchmark: BenchmarkContext;
  opportunities: OptimizationOpportunityRegistry;
  recommendations: OptimizationRecommendationRegistry;
  reasoning: OptimizationReasoning[];
  highPriorityCount: number;
  averageConfidence: number;
  mode: PerformanceIntelligenceMode;
}

export interface OptimizationLayerValidation {
  valid: boolean;
  opportunityCount: number;
  recommendationCount: number;
  highPriorityCount: number;
  averageConfidence: number;
  summary: string;
}

export const OPTIMIZATION_REASON_CODES = {
  supplierDelay: "supplier-delay",
  highRisk: "high-risk",
  lowPerformance: "low-performance",
  acceptanceGap: "acceptance-gap",
  benchmarkGap: "benchmark-gap",
  issueOpen: "issue-open",
  winLossGap: "win-loss-gap",
} as const;

export function mapOpportunityTypeToRecommendationType(
  type: OptimizationOpportunityType,
): OptimizationRecommendationType {
  if (type === "supplier") return "supplier-change";
  if (type === "brand") return "brand-change";
  if (type === "product") return "product-change";
  return "process-improvement";
}
