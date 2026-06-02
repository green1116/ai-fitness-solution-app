import type { GovernanceMechanismScore } from "./optimization-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";
import type { GovernanceAutonomousRuntimeResult } from "../autonomous/autonomous-types";
import { effectivenessFromScore } from "./optimization-registry";

export function evaluateGovernanceMechanismEffectiveness(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  intelligence: GovernanceIntelligenceRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
}): GovernanceMechanismScore[] {
  const trend = input.intelligence.analysis.trendDirection;
  const specs: { module: string; rawScore: number }[] = [
    { module: "federation", rawScore: input.observability.topology.topologyHealthScore },
    { module: "consensus", rawScore: input.observability.consensus.quorumReachRate * 100 },
    {
      module: "policy-propagation",
      rawScore: input.observability.propagation.fanoutSuccessRate * 100 - input.observability.propagation.conflictCount * 5,
    },
    { module: "lifecycle-continuity", rawScore: input.observability.governanceScore.continuityScore },
    { module: "observability", rawScore: input.observability.governanceScore.compositeScore },
    { module: "intelligence", rawScore: input.intelligence.intelligenceScore.compositeScore },
    { module: "autonomous", rawScore: input.autonomous.autonomousScore.compositeScore },
  ];

  return specs.map(({ module, rawScore }) => {
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));
    let trendDir: GovernanceMechanismScore["trend"] = "stable";
    if (trend === "improving") trendDir = "improving";
    else if (trend === "degrading") trendDir = "declining";

    return {
      mechanismId: `mechanism-${module}-${input.deploymentId}`,
      module,
      effectiveness: effectivenessFromScore(score),
      score,
      trend: trendDir,
    };
  });
}
