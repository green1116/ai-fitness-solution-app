/**
 * V4-A3-R11 Operational Governance Intelligence Runtime — verification
 */
import {
  buildGovernanceIntelligenceRuntime,
  buildOperationalGovernanceRuntime,
  GOVERNANCE_INTELLIGENCE_RUNTIME_VERSION,
  buildGovernanceSignalBundle,
  analyzeGovernanceSignals,
  detectGovernanceAnomalies,
  predictGovernanceTrends,
  generateGovernanceRecommendations,
  runGovernanceSimulations,
  buildGovernanceRiskIntelligence,
  computeGovernanceIntelligenceScore,
  buildGovernanceIntelligenceLineageGraph,
  buildGovernanceIntelligenceAuditRecords,
  runGovernanceIntelligenceHooks,
  buildGovernanceFederationObservabilityRuntime,
  buildGovernanceFederationRuntime,
  buildGovernanceFederationConsensusRuntime,
  buildGovernanceFederationPolicyPropagationRuntime,
  buildGovernanceFederationLifecycleContinuityRuntime,
} from "../lib/operations/governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const runtime = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-governance-intelligence",
  });
  assert(
    runtime.governanceIntelligenceVersion === GOVERNANCE_INTELLIGENCE_RUNTIME_VERSION,
    "governance intelligence version",
  );
  assert(runtime.governanceIntelligenceSignals.signals.length >= 10, "signal bundle");
  assert(runtime.governanceIntelligenceAnalysis.analysisId.length > 0, "analysis");
  assert(runtime.governanceIntelligenceAnomalies.length >= 0, "anomalies");
  assert(runtime.governanceIntelligencePrediction.predictionId.length > 0, "prediction");
  assert(runtime.governanceIntelligenceRecommendations.length > 0, "recommendations");
  assert(runtime.governanceIntelligenceSimulations.length >= 1, "simulations");
  assert(runtime.governanceIntelligenceRisk.intelligenceId.length > 0, "risk intelligence");
  assert(runtime.governanceIntelligenceScore.compositeScore >= 0, "intelligence score");
  assert(runtime.governanceIntelligenceLineage.entries.length >= 8, "intelligence lineage");
  assert(runtime.governanceIntelligenceAudit.length > 0, "intelligence audit");
  assert(runtime.governanceIntelligenceHooks.length >= 8, "intelligence hooks");
  assert(runtime.governanceIntelligenceSummary.length > 0, "intelligence summary");
  assert(
    ["stable", "advisory", "elevated", "critical"].includes(runtime.governanceIntelligenceStatus),
    "intelligence status",
  );

  const federation = buildGovernanceFederationRuntime({
    deploymentId: "unit-intel-federation",
    orchestration: runtime.orchestration,
    capabilityNegotiation: runtime.consumerCapabilityNegotiation,
    policyPackMode: runtime.policyPackMode,
  });
  const consensus = buildGovernanceFederationConsensusRuntime({
    deploymentId: "unit-intel-consensus",
    federation,
  });
  const policyPropagation = buildGovernanceFederationPolicyPropagationRuntime({
    deploymentId: "unit-intel-policy",
    federation,
    consensus,
    policyPackMode: runtime.policyPackMode,
  });
  const lifecycleContinuity = buildGovernanceFederationLifecycleContinuityRuntime({
    deploymentId: "unit-intel-lifecycle",
    federation,
    consensus,
    policyPropagation,
  });
  const observability = buildGovernanceFederationObservabilityRuntime({
    deploymentId: "unit-intel-obs",
    federation,
    consensus,
    policyPropagation,
    lifecycleContinuity,
  });

  const signals = buildGovernanceSignalBundle({ deploymentId: "unit-intel", observability });
  assert(signals.signals.length >= 10, "unit signals");
  const analysis = analyzeGovernanceSignals({ deploymentId: "unit-intel", signals, observability });
  assert(analysis.trendDirection.length > 0, "unit analysis");
  const anomalies = detectGovernanceAnomalies({
    deploymentId: "unit-intel",
    observability,
    lifecycleContinuity,
  });
  assert(anomalies.length >= 0, "unit anomalies");
  const prediction = predictGovernanceTrends({ deploymentId: "unit-intel", observability, analysis });
  assert(prediction.healthTrend >= 0, "unit prediction");
  const recommendations = generateGovernanceRecommendations({
    deploymentId: "unit-intel",
    observability,
    anomalies,
    prediction,
  });
  assert(recommendations.length > 0, "unit recommendations");
  const simulations = runGovernanceSimulations({
    deploymentId: "unit-intel",
    observability,
    federation,
    focusScenario: "node_loss",
  });
  assert(simulations.length === 1, "unit focused simulation");
  const riskIntelligence = buildGovernanceRiskIntelligence({
    deploymentId: "unit-intel",
    observability,
    prediction,
    recommendationCount: recommendations.length,
  });
  assert(riskIntelligence.currentRisk.length > 0, "unit risk intelligence");
  const intelligenceScore = computeGovernanceIntelligenceScore({
    deploymentId: "unit-intel",
    observability,
    anomalyCount: anomalies.length,
    recommendationCount: recommendations.length,
    predictionConfidence: riskIntelligence.confidenceScore,
  });
  assert(intelligenceScore.governanceConfidence >= 0, "unit intelligence score");
  const lineage = buildGovernanceIntelligenceLineageGraph({
    deploymentId: "unit-intel",
    signals,
    analysis,
    anomalies,
    prediction,
    recommendations,
    simulations,
    riskIntelligence,
    intelligenceScore,
  });
  assert(lineage.entries.length >= 8, "unit lineage");
  const audit = buildGovernanceIntelligenceAuditRecords({
    intelligenceId: "unit-intel",
    federationId: observability.health.federationId,
    anomalyCount: anomalies.length,
    recommendationCount: recommendations.length,
    intelligenceScore,
  });
  assert(audit.length > 0, "unit audit");
  const hooks = runGovernanceIntelligenceHooks({
    signalCount: signals.signals.length,
    anomalyCount: anomalies.length,
    recommendationCount: recommendations.length,
  });
  assert(hooks.some((h) => h.phase === "afterRecommendation"), "unit hooks");

  const direct = buildGovernanceIntelligenceRuntime({
    deploymentId: "v4-verify-intelligence-direct",
    observability,
    federation,
    lifecycleContinuity,
  });
  assert(direct.simulations.length === 5, "direct all scenarios simulation");

  console.log("✓ governance intelligence runtime");
  console.log(" ", runtime.governanceIntelligenceSummary);
  console.log("INTELLIGENCE VERIFY PASS");
}

main();
