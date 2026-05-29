import type { GovernanceAutonomousSignal, GovernanceAutonomousSignalBundle } from "./autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";

export function buildAutonomousSignalBundle(input: {
  deploymentId: string;
  intelligence: GovernanceIntelligenceRuntimeResult;
}): GovernanceAutonomousSignalBundle {
  const intel = input.intelligence;
  const signals: GovernanceAutonomousSignal[] = [
    { signalId: "asig-anomaly-count", source: "intelligence", value: intel.anomalies.length, weight: 1.2 },
    { signalId: "asig-recommendation-count", source: "intelligence", value: intel.recommendations.length, weight: 1 },
    { signalId: "asig-composite", source: "intelligence", value: intel.intelligenceScore.compositeScore, weight: 1.3 },
    { signalId: "asig-confidence", source: "intelligence", value: intel.riskIntelligence.confidenceScore, weight: 1.1 },
    { signalId: "asig-projected-risk", source: "risk", value: riskToScore(intel.riskIntelligence.projectedRisk), weight: 1.2 },
    { signalId: "asig-health-trend", source: "prediction", value: intel.prediction.healthTrend, weight: 1 },
    { signalId: "asig-consensus-fail-prob", source: "prediction", value: intel.prediction.consensusFailureProbability * 100, weight: 1.1 },
  ];

  return {
    bundleId: `autonomous-signals-${input.deploymentId}`,
    signals,
  };
}

function riskToScore(risk: string): number {
  switch (risk) {
    case "low":
      return 90;
    case "medium":
      return 65;
    case "high":
      return 40;
    case "critical":
      return 15;
    default:
      return 50;
  }
}
