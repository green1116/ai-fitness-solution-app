import {
  GOVERNANCE_INTELLIGENCE_RUNTIME_VERSION,
  type GovernanceIntelligenceRuntimeInput,
  type GovernanceIntelligenceRuntimeResult,
  type GovernanceIntelligenceStatus,
} from "./intelligence-types";
import { buildGovernanceSignalBundle } from "./intelligence-signals";
import { analyzeGovernanceSignals } from "./intelligence-analysis";
import { detectGovernanceAnomalies } from "./intelligence-anomaly";
import { predictGovernanceTrends } from "./intelligence-prediction";
import { generateGovernanceRecommendations } from "./intelligence-recommendation";
import { runGovernanceSimulations } from "./intelligence-simulation";
import { buildGovernanceRiskIntelligence } from "./intelligence-risk";
import { computeGovernanceIntelligenceScore } from "./intelligence-score";
import { buildGovernanceIntelligenceLineageGraph } from "./intelligence-lineage";
import { buildGovernanceIntelligenceAuditRecords } from "./intelligence-audit";
import { runGovernanceIntelligenceHooks } from "./intelligence-hooks";

export function buildGovernanceIntelligenceRuntime(
  input: GovernanceIntelligenceRuntimeInput,
): GovernanceIntelligenceRuntimeResult {
  const signals = buildGovernanceSignalBundle({
    deploymentId: input.deploymentId,
    observability: input.observability,
  });
  const analysis = analyzeGovernanceSignals({
    deploymentId: input.deploymentId,
    signals,
    observability: input.observability,
  });
  const anomalies = detectGovernanceAnomalies({
    deploymentId: input.deploymentId,
    observability: input.observability,
    lifecycleContinuity: input.lifecycleContinuity,
  });
  const prediction = predictGovernanceTrends({
    deploymentId: input.deploymentId,
    observability: input.observability,
    analysis,
  });
  const recommendations = generateGovernanceRecommendations({
    deploymentId: input.deploymentId,
    observability: input.observability,
    anomalies,
    prediction,
  });
  const simulations = runGovernanceSimulations({
    deploymentId: input.deploymentId,
    observability: input.observability,
    federation: input.federation,
    focusScenario: input.simulationScenario,
  });
  const riskIntelligence = buildGovernanceRiskIntelligence({
    deploymentId: input.deploymentId,
    observability: input.observability,
    prediction,
    recommendationCount: recommendations.length,
  });
  const intelligenceScore = computeGovernanceIntelligenceScore({
    deploymentId: input.deploymentId,
    observability: input.observability,
    anomalyCount: anomalies.length,
    recommendationCount: recommendations.length,
    predictionConfidence: riskIntelligence.confidenceScore,
  });

  const lineage = buildGovernanceIntelligenceLineageGraph({
    deploymentId: input.deploymentId,
    signals,
    analysis,
    anomalies,
    prediction,
    recommendations,
    simulations,
    riskIntelligence,
    intelligenceScore,
  });

  const intelligenceId = `governance-intelligence-${input.deploymentId}`;
  const audit = buildGovernanceIntelligenceAuditRecords({
    intelligenceId,
    federationId: signals.federationId,
    anomalyCount: anomalies.length,
    recommendationCount: recommendations.length,
    intelligenceScore,
  });

  const hooks = runGovernanceIntelligenceHooks({
    signalCount: signals.signals.length,
    anomalyCount: anomalies.length,
    recommendationCount: recommendations.length,
  });

  let status: GovernanceIntelligenceStatus = "stable";
  if (anomalies.some((a) => a.severity === "critical") || riskIntelligence.projectedRisk === "critical") {
    status = "critical";
  } else if (anomalies.length > 2 || analysis.trendDirection === "degrading") {
    status = "elevated";
  } else if (recommendations.some((r) => r.priority === "urgent" || r.priority === "high")) {
    status = "advisory";
  }

  const traceId = `governance-intelligence-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_INTELLIGENCE_RUNTIME_VERSION,
    registry: { intelligenceId, signalCount: signals.signals.length },
    signals,
    analysis,
    anomalies,
    prediction,
    recommendations,
    simulations,
    riskIntelligence,
    intelligenceScore,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `governance-intelligence-summary-${Date.now()}`,
      text: `intelligence=${intelligenceId} anomalies=${anomalies.length} recommendations=${recommendations.length} trend=${analysis.trendDirection} projectedRisk=${riskIntelligence.projectedRisk} composite=${intelligenceScore.compositeScore} status=${status}`,
      traceId,
    },
    status,
  };
}

export { GOVERNANCE_INTELLIGENCE_RUNTIME_VERSION };
