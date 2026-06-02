import type { GovernanceAutonomousAnalysis, GovernanceAutonomousSignalBundle } from "./autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";

export function analyzeAutonomousReadiness(input: {
  deploymentId: string;
  signals: GovernanceAutonomousSignalBundle;
  intelligence: GovernanceIntelligenceRuntimeResult;
}): GovernanceAutonomousAnalysis {
  const blockers: string[] = [];
  if (input.intelligence.status === "critical") blockers.push("critical-intelligence-status");
  if (input.intelligence.riskIntelligence.confidenceScore < 40) blockers.push("low-confidence");
  if (input.intelligence.anomalies.some((a) => a.severity === "critical")) blockers.push("critical-anomalies");

  const weightedSum = input.signals.signals.reduce((s, sig) => s + sig.value * sig.weight, 0);
  const totalWeight = input.signals.signals.reduce((s, sig) => s + sig.weight, 0);
  const readinessScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  const mode: GovernanceAutonomousAnalysis["mode"] =
    blockers.length === 0 && readinessScore >= 50 ? "autonomous" : "advice";

  return {
    analysisId: `autonomous-analysis-${input.deploymentId}`,
    mode,
    readinessScore,
    blockers,
  };
}
