import type { FederationGovernanceScore } from "./observability-types";
import type { FederationHealthSnapshot } from "./observability-types";
import type { FederationRiskProfile } from "./observability-types";
import type { LifecycleContinuityRuntimeResult } from "../federation-lifecycle/continuity-types";
import { clampScore } from "./observability-registry";

export function computeFederationGovernanceScore(input: {
  deploymentId: string;
  health: FederationHealthSnapshot;
  risk: FederationRiskProfile;
  lifecycleContinuity: LifecycleContinuityRuntimeResult;
}): FederationGovernanceScore {
  const healthScore = input.health.healthScore;

  let stabilityScore = clampScore(
    healthScore * 0.4 +
      input.health.lifecycleStability * 100 * 0.3 +
      input.health.propagationSuccessRate * 100 * 0.3,
  );

  let resilienceScore = clampScore(
    100 -
      input.risk.riskFactors.length * 8 -
      (input.health.failedNodes.length > 0 ? 15 : 0) -
      (input.risk.recoveryRisk === "critical" ? 25 : input.risk.recoveryRisk === "high" ? 15 : 0),
  );

  const continuityScore = clampScore(
    input.lifecycleContinuity.status === "continuous"
      ? 95
      : input.lifecycleContinuity.status === "partial"
        ? 70
        : input.lifecycleContinuity.status === "handoff"
          ? 65
          : input.lifecycleContinuity.status === "disrupted"
            ? 45
            : 30,
  );

  const confidenceScore = clampScore(
    (healthScore + stabilityScore + resilienceScore + continuityScore) / 4 -
      (input.risk.overallRisk === "critical" ? 20 : input.risk.overallRisk === "high" ? 10 : 0),
  );

  const compositeScore = clampScore(
    (healthScore + stabilityScore + resilienceScore + continuityScore + confidenceScore) / 5,
  );

  return {
    scoreId: `federation-governance-score-${input.deploymentId}`,
    healthScore,
    stabilityScore,
    resilienceScore,
    continuityScore,
    confidenceScore,
    compositeScore,
  };
}
