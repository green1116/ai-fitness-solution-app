/**
 * V4-A2 Operational Intelligence Runtime — unified entry
 */

export * from "./signals";
export * from "./health";
export * from "./anomaly";
export * from "./trends";
export * from "./bottlenecks";
export * from "./insights";
export * from "./recommendations";
export * from "./decision";
export {
  V4A2_INTELLIGENCE_VERSION,
  OPERATIONAL_SIGNAL_KINDS,
  type OperationalSignalKind,
  type OperationalSignalUnit,
  type OperationalSignal,
  type OperationalSignalBatch,
  type OperationalHealthStatus,
  type OperationalHealthSnapshot,
  type OperationalAnomaly,
  type OperationalTrendDirection,
  type OperationalTrend,
  type OperationalBottleneckType,
  type OperationalBottleneck,
  type OperationalInsightType,
  type OperationalInsightPriority,
  type OperationalInsight,
  type OperationalRecommendationType,
  type OperationalRecommendation,
  type OperationalDecisionStatus,
  type OperationalDecisionType,
  type OperationalDecisionSupport,
  type OperationalIntelligenceSummary,
  type OperationalIntelligenceRuntime,
  type V4OperationalIntelligenceRuntime,
  type OperationalIntelligenceRuntimeSummary,
  type OperationalInsightV2,
} from "./types";
export {
  clampNormalizedScore,
  averageNormalizedScore,
  type RawOperationalSignalInput,
  type NormalizeSignalDefaults,
} from "./signals";

import { warmOperationsReleaseContext } from "../operations-context";
import {
  averageNormalizedScore,
  createOperationalSignalBatch,
} from "./signals";
import { buildOperationalHealthSnapshot } from "./health";
import { detectOperationalAnomalies } from "./anomaly";
import { analyzeOperationalTrends, analyzeExecutionPatterns } from "./trends";
import { identifyOperationalBottlenecks } from "./bottlenecks";
import { deriveOperationalInsights } from "./insights";
import { generateOperationalRecommendations } from "./recommendations";
import { buildOperationalDecisionSupport } from "./decision";
import type { OperationalIntelligenceRuntime, OperationalIntelligenceSummary } from "./types";
import { V4A2_INTELLIGENCE_VERSION } from "./types";

export function warmOperationalIntelligenceContext(deploymentId: string): void {
  warmOperationsReleaseContext(deploymentId);
}

export function summarizeOperationalIntelligenceRuntime(
  runtime: OperationalIntelligenceRuntime,
): OperationalIntelligenceSummary {
  const intelligenceScore = averageNormalizedScore(runtime.signals.signals);
  const detectedAnomalies = runtime.anomalies.filter((a) => a.detected).length;

  return {
    version: V4A2_INTELLIGENCE_VERSION,
    summaryId: `OIS-V4A2-${runtime.runtimeId.slice(-8)}`,
    phase: "full",
    signalCount: runtime.signals.signals.length,
    anomalyCount: detectedAnomalies,
    trendCount: runtime.trends.length,
    bottleneckCount: runtime.bottlenecks.length,
    insightCount: runtime.insights.length,
    recommendationCount: runtime.recommendations.length,
    intelligenceScore,
    healthStatus: runtime.health?.status ?? "watch",
    decisionStatus: runtime.decisionSupport?.status ?? "none",
    explainable: true,
    replayable: true,
    source: "intelligence.runtime",
    traceId: `trace-summary-${runtime.runtimeId}`,
    observedAt: runtime.signals.collectedAt,
    summary: [
      `operational-intelligence phase=full`,
      `health=${runtime.health?.status}`,
      `signals=${runtime.signals.signals.length}`,
      `anomalies=${detectedAnomalies}`,
      `bottlenecks=${runtime.bottlenecks.length}`,
      `insights=${runtime.insights.length}`,
      `recommendations=${runtime.recommendations.length}`,
      `decision=${runtime.decisionSupport?.status ?? "none"}`,
      `score=${intelligenceScore}`,
    ].join(" "),
  };
}

export function buildV4OperationalIntelligenceRuntime(input?: {
  deploymentId?: string;
}): OperationalIntelligenceRuntime {
  const deploymentId = input?.deploymentId ?? "v4-operational-intelligence";
  const runtimeId = `OIR-V4A2-${deploymentId.slice(0, 8)}`;

  const signals = createOperationalSignalBatch({ deploymentId });
  const health = buildOperationalHealthSnapshot({ deploymentId });
  const anomalies = detectOperationalAnomalies({ deploymentId });
  const trends = [
    ...analyzeOperationalTrends({ deploymentId }),
    ...analyzeExecutionPatterns({ deploymentId }),
  ];
  const bottlenecks = identifyOperationalBottlenecks({ deploymentId });
  const insights = deriveOperationalInsights({ deploymentId });
  const recommendations = generateOperationalRecommendations({ deploymentId });
  const decisionSupport = buildOperationalDecisionSupport({ deploymentId });

  const runtime: OperationalIntelligenceRuntime = {
    version: V4A2_INTELLIGENCE_VERSION,
    runtimeId,
    signals,
    health,
    anomalies,
    trends,
    bottlenecks,
    insights,
    recommendations,
    decisionSupport,
    summary: {
      version: V4A2_INTELLIGENCE_VERSION,
      summaryId: `OIS-V4A2-${deploymentId.slice(0, 8)}`,
      phase: "full",
      signalCount: signals.signals.length,
      anomalyCount: 0,
      trendCount: 0,
      bottleneckCount: 0,
      insightCount: 0,
      recommendationCount: 0,
      intelligenceScore: 0,
      healthStatus: health.status,
      decisionStatus: decisionSupport.status,
      explainable: true,
      replayable: true,
      source: "intelligence.runtime",
      traceId: `trace-summary-${runtimeId}`,
      observedAt: signals.collectedAt,
      summary: "",
    },
    runtimeSummary: "",
  };

  runtime.summary = summarizeOperationalIntelligenceRuntime(runtime);
  runtime.runtimeSummary = [
    `v4-operational-intelligence id=${runtimeId}`,
    `health=${health.status}`,
    `score=${runtime.summary.intelligenceScore}`,
    `bottlenecks=${bottlenecks.length}`,
    `insights=${insights.length}`,
    `recommendations=${recommendations.length}`,
    `decision=${decisionSupport.status}`,
  ].join(" ");

  return runtime;
}
