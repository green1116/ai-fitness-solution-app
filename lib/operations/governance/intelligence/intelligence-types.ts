import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";
import type { FederationRuntimeResult } from "../federation/federation-types";
import type { LifecycleContinuityRuntimeResult } from "../federation-lifecycle/continuity-types";

export const GOVERNANCE_INTELLIGENCE_RUNTIME_VERSION =
  "v4-a3-r11-governance-intelligence-runtime-1" as const;
export type GovernanceIntelligenceRuntimeVersion = typeof GOVERNANCE_INTELLIGENCE_RUNTIME_VERSION;

export type GovernanceIntelligenceStatus = "stable" | "advisory" | "elevated" | "critical";
export type GovernanceAnomalySeverity = "low" | "medium" | "high" | "critical";
export type GovernanceRecommendationPriority = "low" | "medium" | "high" | "urgent";
export type GovernanceSimulationScenario =
  | "policy_change"
  | "node_loss"
  | "consensus_degradation"
  | "propagation_failure"
  | "recovery_escalation";

export type GovernanceSignal = {
  signalId: string;
  source: string;
  metric: string;
  value: number;
  weight: number;
};

export type GovernanceSignalBundle = {
  bundleId: string;
  federationId: string;
  signals: GovernanceSignal[];
  collectedAt: string;
};

export type GovernanceAnalysisResult = {
  analysisId: string;
  summary: string;
  dominantFactors: string[];
  trendDirection: "improving" | "stable" | "degrading";
};

export type GovernanceAnomaly = {
  anomalyId: string;
  category:
    | "consensus_instability"
    | "propagation_degradation"
    | "lifecycle_abnormality"
    | "recovery_failure_trend"
    | "federation_fragmentation";
  severity: GovernanceAnomalySeverity;
  description: string;
  detectedAt: string;
};

export type GovernancePrediction = {
  predictionId: string;
  healthTrend: number;
  stabilityTrend: number;
  recoveryTrend: number;
  federationDegradationProbability: number;
  consensusFailureProbability: number;
  horizon: string;
};

export type GovernanceRecommendation = {
  recommendationId: string;
  category: "recovery" | "topology" | "policy" | "lifecycle" | "risk_mitigation";
  priority: GovernanceRecommendationPriority;
  action: string;
  rationale: string;
};

export type GovernanceSimulation = {
  simulationId: string;
  scenario: GovernanceSimulationScenario;
  projectedHealthScore: number;
  projectedRisk: string;
  impactSummary: string;
};

export type GovernanceRiskIntelligence = {
  intelligenceId: string;
  currentRisk: string;
  projectedRisk: string;
  mitigationImpact: number;
  confidenceScore: number;
};

export type GovernanceIntelligenceScore = {
  scoreId: string;
  observabilityScore: number;
  predictabilityScore: number;
  resilienceScore: number;
  recommendationScore: number;
  governanceConfidence: number;
  compositeScore: number;
};

export type GovernanceIntelligenceLineageEntry = {
  entryId: string;
  event: "signals" | "analysis" | "anomaly" | "prediction" | "recommendation" | "simulation" | "risk" | "score";
  detail: string;
  timestamp: string;
};

export type GovernanceIntelligenceLineageGraph = {
  graphId: string;
  entries: GovernanceIntelligenceLineageEntry[];
};

export type GovernanceIntelligenceAuditRecord = {
  intelligenceId: string;
  federationId: string;
  anomalyCount: number;
  recommendationCount: number;
  compositeScore: number;
  timestamp: string;
};

export type GovernanceIntelligenceHookPhase =
  | "beforeSignalCollection"
  | "afterSignalCollection"
  | "beforeAnomalyDetection"
  | "afterAnomalyDetection"
  | "beforePrediction"
  | "afterPrediction"
  | "beforeRecommendation"
  | "afterRecommendation";

export type GovernanceIntelligenceHookEvent = {
  phase: GovernanceIntelligenceHookPhase;
  payload: string;
};

export type GovernanceIntelligenceRuntimeInput = {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  federation: FederationRuntimeResult;
  lifecycleContinuity: LifecycleContinuityRuntimeResult;
  simulationScenario?: GovernanceSimulationScenario;
};

export type GovernanceIntelligenceRuntimeResult = {
  version: GovernanceIntelligenceRuntimeVersion;
  registry: { intelligenceId: string; signalCount: number };
  signals: GovernanceSignalBundle;
  analysis: GovernanceAnalysisResult;
  anomalies: GovernanceAnomaly[];
  prediction: GovernancePrediction;
  recommendations: GovernanceRecommendation[];
  simulations: GovernanceSimulation[];
  riskIntelligence: GovernanceRiskIntelligence;
  intelligenceScore: GovernanceIntelligenceScore;
  lineage: GovernanceIntelligenceLineageGraph;
  audit: GovernanceIntelligenceAuditRecord[];
  hooks: GovernanceIntelligenceHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: GovernanceIntelligenceStatus;
};
