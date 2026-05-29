import type { GovernanceImpactAssessment, GovernanceResilienceOptimization } from "./optimization-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";
import type { GovernanceAutonomousRuntimeResult } from "../autonomous/autonomous-types";

export function optimizeGovernanceResilience(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
  impact: GovernanceImpactAssessment;
}): GovernanceResilienceOptimization {
  const currentResilience = input.observability.governanceScore.resilienceScore;
  const targetResilience = Math.min(
    100,
    currentResilience + Math.max(0, input.impact.resilienceDelta) + (input.impact.overallImpact > 0 ? 5 : 0),
  );

  const actions: string[] = [];
  if (input.observability.recovery.stabilizationPending) {
    actions.push("strengthen-shared-recovery");
  }
  if (input.autonomous.remediations.length > 0) {
    actions.push(...input.autonomous.remediations.slice(0, 2).map((r) => r.action));
  }
  if (input.autonomous.optimizations.some((o) => o.category === "resilience")) {
    actions.push("apply-resilience-optimization-bundle");
  }
  if (actions.length === 0) {
    actions.push("maintain-resilience-posture");
  }

  return {
    resilienceId: `resilience-optimization-${input.deploymentId}`,
    currentResilience,
    targetResilience,
    actions,
  };
}
