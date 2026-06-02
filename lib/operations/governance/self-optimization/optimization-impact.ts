import type { GovernanceImpactAssessment, GovernanceStrategyOptimization } from "./optimization-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";
import type { GovernanceAutonomousRuntimeResult } from "../autonomous/autonomous-types";

export function assessGovernanceOptimizationImpact(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
  strategies: GovernanceStrategyOptimization[];
}): GovernanceImpactAssessment {
  const strategyGain = input.strategies.reduce((s, st) => s + st.expectedGain, 0) / Math.max(input.strategies.length, 1);

  const stabilityDelta = Math.round(
    (input.autonomous.executionPlan.safestPath ? 5 : -5) +
      (input.observability.governanceScore.stabilityScore - 50) * 0.1,
  );
  const resilienceDelta = Math.round(strategyGain * 0.4 + (input.observability.governanceScore.resilienceScore - 50) * 0.15);
  const continuityDelta = Math.round(
    (input.observability.governanceScore.continuityScore - 50) * 0.2 + (input.observability.lifecycle.frozenDomains === 0 ? 5 : -8),
  );
  const confidenceDelta = Math.round(
    (input.autonomous.autonomousScore.confidence - 50) * 0.2 +
      (input.observability.governanceScore.confidenceScore - 50) * 0.1,
  );

  const overallImpact = Math.round(
    (stabilityDelta + resilienceDelta + continuityDelta + confidenceDelta) / 4 + strategyGain * 0.3,
  );

  return {
    assessmentId: `impact-assessment-${input.deploymentId}`,
    stabilityDelta,
    resilienceDelta,
    continuityDelta,
    confidenceDelta,
    overallImpact,
  };
}
