/**
 * V4-A2 Operational Intelligence — type definitions
 */

export const V4A2_INTELLIGENCE_VERSION = "4-a2-operational-intelligence-2" as const;

export const OPERATIONAL_SIGNAL_KINDS = [
  "throughput",
  "latency",
  "errorRate",
  "retryCount",
  "fallbackCount",
  "successRatio",
  "queuePressure",
  "resourcePressure",
  "executionDrift",
  "recoveryFrequency",
] as const;

export type OperationalSignalKind = (typeof OPERATIONAL_SIGNAL_KINDS)[number];

export type OperationalSignalUnit = "ratio" | "count" | "score" | "pressure";

export type OperationalSignal = {
  id: string;
  kind: OperationalSignalKind;
  label: string;
  value: number;
  unit: OperationalSignalUnit;
  normalizedScore: number;
  source: string;
  traceId: string;
  observedAt: string;
};

export type OperationalSignalBatch = {
  version: typeof V4A2_INTELLIGENCE_VERSION;
  batchId: string;
  deploymentId: string;
  signals: OperationalSignal[];
  collectedAt: string;
  timeWindow: string;
  summary: string;
};

export type OperationalHealthStatus = "healthy" | "watch" | "degraded" | "critical";

export type OperationalHealthSnapshot = {
  version: typeof V4A2_INTELLIGENCE_VERSION;
  snapshotId: string;
  healthScore: number;
  stabilityScore: number;
  releaseScore: number;
  governanceScore: number;
  operationalScore: number;
  status: OperationalHealthStatus;
  source: string;
  traceId: string;
  observedAt: string;
  summary: string;
};

export type OperationalAnomaly = {
  anomalyId: string;
  kind: OperationalSignalKind | "composite";
  severity: "low" | "medium" | "high";
  detected: boolean;
  explanation: string;
  source: string;
  traceId: string;
  observedAt: string;
  evidence: string[];
  confidence: number;
  /** @deprecated use anomalyId */
  id?: string;
};

export type OperationalTrendDirection = "improving" | "stable" | "declining" | "unknown";

export type OperationalTrend = {
  trendId: string;
  metric: string;
  direction: OperationalTrendDirection;
  delta: number;
  explanation: string;
  source: string;
  traceId: string;
  observedAt: string;
  evidence: string[];
  confidence: number;
  /** @deprecated use trendId */
  id?: string;
};

export type OperationalBottleneckType =
  | "throughputBottleneck"
  | "latencyBottleneck"
  | "errorBottleneck"
  | "retryBottleneck"
  | "fallbackBottleneck"
  | "queueBottleneck"
  | "resourceBottleneck"
  | "recoveryBottleneck"
  | "executionDriftBottleneck"
  | "stabilityBottleneck";

export type OperationalBottleneck = {
  bottleneckId: string;
  bottleneckType: OperationalBottleneckType;
  severity: "low" | "medium" | "high";
  affectedSignals: OperationalSignalKind[];
  source: string;
  traceId: string;
  observedAt: string;
  evidence: string[];
  explanation: string;
  confidence: number;
};

export type OperationalInsightType =
  | "stabilityInsight"
  | "riskInsight"
  | "recoveryInsight"
  | "bottleneckInsight"
  | "anomalyInsight"
  | "trendInsight"
  | "optimizationInsight"
  | "escalationInsight";

export type OperationalInsightPriority = "low" | "medium" | "high" | "critical";

export type OperationalInsight = {
  insightId: string;
  insightType: OperationalInsightType;
  priority: OperationalInsightPriority;
  title: string;
  summary: string;
  source: string;
  traceId: string;
  observedAt: string;
  evidence: string[];
  explanation: string;
  confidence: number;
  relatedAnomalies: string[];
  relatedTrends: string[];
  relatedBottlenecks: string[];
};

export type OperationalRecommendationType =
  | "monitor"
  | "investigate"
  | "optimize"
  | "recover"
  | "escalate"
  | "stabilize"
  | "reducePressure"
  | "improveThroughput"
  | "reduceErrorRate"
  | "reduceRetryFrequency"
  | "reduceFallbackUsage";

export type OperationalRecommendation = {
  recommendationId: string;
  recommendationType: OperationalRecommendationType;
  priority: "low" | "medium" | "high";
  action: string;
  rationale: string;
  source: string;
  traceId: string;
  observedAt: string;
  evidence: string[];
  expectedOutcome: string;
  confidence: number;
  relatedInsights: string[];
};

export type OperationalDecisionStatus =
  | "proceed"
  | "monitor"
  | "investigate"
  | "mitigate"
  | "escalate"
  | "hold";

export type OperationalDecisionType =
  | "operationalReview"
  | "riskMitigation"
  | "recoveryPlanning"
  | "stabilityHold";

export type OperationalDecisionSupport = {
  version: typeof V4A2_INTELLIGENCE_VERSION;
  decisionSupportId: string;
  decisionType: OperationalDecisionType;
  status: OperationalDecisionStatus;
  recommendedAction: string;
  rationale: string;
  source: string;
  traceId: string;
  observedAt: string;
  confidence: number;
  evidence: string[];
  relatedRecommendations: string[];
  explanation: string;
  summary: string;
};

export type OperationalIntelligenceSummary = {
  version: typeof V4A2_INTELLIGENCE_VERSION;
  summaryId: string;
  phase: "signals" | "full";
  signalCount: number;
  anomalyCount: number;
  trendCount: number;
  bottleneckCount: number;
  insightCount: number;
  recommendationCount: number;
  intelligenceScore: number;
  healthStatus: OperationalHealthStatus;
  decisionStatus: OperationalDecisionStatus | "none";
  explainable: boolean;
  replayable: boolean;
  source: string;
  traceId: string;
  observedAt: string;
  summary: string;
};

export type OperationalIntelligenceRuntime = {
  version: typeof V4A2_INTELLIGENCE_VERSION;
  runtimeId: string;
  signals: OperationalSignalBatch;
  health: OperationalHealthSnapshot | null;
  anomalies: OperationalAnomaly[];
  trends: OperationalTrend[];
  bottlenecks: OperationalBottleneck[];
  insights: OperationalInsight[];
  recommendations: OperationalRecommendation[];
  decisionSupport: OperationalDecisionSupport | null;
  summary: OperationalIntelligenceSummary;
  runtimeSummary: string;
};

export type V4OperationalIntelligenceRuntime = OperationalIntelligenceRuntime;
export type OperationalIntelligenceRuntimeSummary = OperationalIntelligenceSummary;
export type OperationalInsightV2 = OperationalInsight;
