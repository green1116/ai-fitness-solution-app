/**
 * V4-A1 Production Operations Runtime — unified foundation
 */

export * from "./shared";
export * from "./operations-context";
export * from "./registry";
export * from "./stability";
export * from "./a1-intelligence";
export {
  V4A2_INTELLIGENCE_VERSION,
  OPERATIONAL_SIGNAL_KINDS,
  normalizeOperationalSignal,
  normalizeSignalBatch,
  createOperationalSignalBatch,
  buildOperationalSignalBatch,
  groupSignalsByKind,
  groupSignalsBySource,
  getSignalByKind,
  buildOperationalHealthSnapshot,
  detectOperationalAnomalies,
  analyzeOperationalTrends,
  analyzeExecutionPatterns,
  identifyOperationalBottlenecks,
  summarizeOperationalBottlenecks,
  deriveOperationalInsights,
  summarizeOperationalInsights,
  generateOperationalRecommendations,
  summarizeOperationalRecommendations,
  buildOperationalDecisionSupport,
  summarizeOperationalDecisionSupport,
  buildV4OperationalIntelligenceRuntime,
  summarizeOperationalIntelligenceRuntime,
  warmOperationalIntelligenceContext,
  averageNormalizedScore,
  clampNormalizedScore,
} from "./intelligence/index";
export type {
  OperationalSignalKind,
  OperationalSignalUnit,
  OperationalSignal,
  OperationalSignalBatch,
  RawOperationalSignalInput,
  OperationalHealthSnapshot,
  OperationalAnomaly,
  OperationalTrendDirection,
  OperationalTrend,
  OperationalBottleneckType,
  OperationalBottleneck,
  OperationalInsightType,
  OperationalInsightPriority,
  OperationalIntelligenceRuntime,
  OperationalIntelligenceSummary as V4A2OperationalIntelligenceSummary,
  OperationalInsight as V4A2OperationalInsight,
  OperationalRecommendationType,
  OperationalRecommendation as V4A2OperationalRecommendation,
  OperationalDecisionStatus,
  OperationalDecisionType,
  OperationalDecisionSupport as V4A2OperationalDecisionSupport,
} from "./intelligence/index";
export * from "./governance";
export * from "./execution";
export * from "./change";
export * from "./incident";
export * from "./recovery";
export * from "./center";
export * from "./command";
export * from "./command/api";
export * from "./command/gated-orchestrator";
export * from "./command/platform-baseline";
export * from "./sustainability";

import { V4_OPERATIONS_VERSION } from "./shared";
import { buildProductionOperationsRegistry } from "./registry";
import { buildOperationalStabilityReport } from "./stability";
import { buildOperationalIntelligenceSummary } from "./a1-intelligence";
import { buildOperationalSustainabilityReport } from "./sustainability";

export const V4_PRODUCTION_OPERATIONS_FOUNDATION_VERSION = V4_OPERATIONS_VERSION;

export type V4ProductionOperationsFoundation = {
  version: typeof V4_PRODUCTION_OPERATIONS_FOUNDATION_VERSION;
  foundationId: string;
  registry: ReturnType<typeof buildProductionOperationsRegistry>;
  stability: ReturnType<typeof buildOperationalStabilityReport>;
  intelligence: ReturnType<typeof buildOperationalIntelligenceSummary>;
  sustainability: ReturnType<typeof buildOperationalSustainabilityReport>;
  operationallyReady: boolean;
  foundationSummary: string;
};

export function buildV4ProductionOperationsFoundation(input?: {
  deploymentId?: string;
}): V4ProductionOperationsFoundation {
  const deploymentId = input?.deploymentId ?? "v4-production-operations";
  const foundationId = `V4POF-${deploymentId.slice(0, 8)}`;
  const registry = buildProductionOperationsRegistry({ deploymentId });
  const stability = buildOperationalStabilityReport({ deploymentId });
  const intelligence = buildOperationalIntelligenceSummary({ deploymentId });
  const sustainability = buildOperationalSustainabilityReport({ deploymentId });

  const operationallyReady =
    intelligence.operationalReadiness &&
    sustainability.sustainable &&
    stability.stabilityIndex >= 80;

  return {
    version: V4_PRODUCTION_OPERATIONS_FOUNDATION_VERSION,
    foundationId,
    registry,
    stability,
    intelligence,
    sustainability,
    operationallyReady,
    foundationSummary: `v4-production-operations id=${foundationId} records=${registry.records.length} stability=${stability.stabilityIndex} confidence=${intelligence.confidenceScore} sustainable=${sustainability.sustainable} operationallyReady=${operationallyReady}`,
  };
}
