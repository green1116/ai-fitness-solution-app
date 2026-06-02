import type { GovernanceAnalysisResult, GovernanceSignalBundle } from "./intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";

export function analyzeGovernanceSignals(input: {
  deploymentId: string;
  signals: GovernanceSignalBundle;
  observability: FederationObservabilityRuntimeResult;
}): GovernanceAnalysisResult {
  const weightedSum = input.signals.signals.reduce((sum, s) => sum + s.value * s.weight, 0);
  const totalWeight = input.signals.signals.reduce((sum, s) => sum + s.weight, 0);
  const composite = totalWeight > 0 ? weightedSum / totalWeight : 0;

  const dominantFactors: string[] = [];
  if (input.observability.consensus.quorumReachRate < 0.7) dominantFactors.push("consensus-quorum-gap");
  if (input.observability.propagation.conflictCount > 2) dominantFactors.push("propagation-conflicts");
  if (input.observability.lifecycle.frozenDomains > 0) dominantFactors.push("lifecycle-freeze");
  if (input.observability.recovery.stabilizationPending) dominantFactors.push("recovery-pending");
  if (input.observability.health.failedNodes.length > 0) dominantFactors.push("node-failures");
  if (dominantFactors.length === 0) dominantFactors.push("steady-state");

  let trendDirection: GovernanceAnalysisResult["trendDirection"] = "stable";
  if (composite < 50 || input.observability.status === "critical") trendDirection = "degrading";
  else if (composite > 75 && input.observability.status === "healthy") trendDirection = "improving";

  return {
    analysisId: `governance-analysis-${input.deploymentId}`,
    summary: `composite=${composite.toFixed(1)} trend=${trendDirection} factors=${dominantFactors.join(",")}`,
    dominantFactors,
    trendDirection,
  };
}
