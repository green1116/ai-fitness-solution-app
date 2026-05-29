import type {
  FederationGovernanceScore,
  FederationObservabilityHookEvent,
  FederationRiskProfile,
} from "./observability-types";
import type { FederationHealthSnapshot } from "./observability-types";

export function runFederationObservabilityHooks(input: {
  sourceDomainId: string;
  health: FederationHealthSnapshot;
  risk: FederationRiskProfile;
  governanceScore: FederationGovernanceScore;
}): FederationObservabilityHookEvent[] {
  return [
    {
      phase: "beforeHealthObservation",
      domainId: input.sourceDomainId,
      payload: `federation=${input.health.federationId}`,
    },
    {
      phase: "afterHealthObservation",
      domainId: input.sourceDomainId,
      payload: `score=${input.health.healthScore}`,
    },
    {
      phase: "beforeRiskEvaluation",
      domainId: input.sourceDomainId,
      payload: `factors=${input.risk.riskFactors.length}`,
    },
    {
      phase: "afterRiskEvaluation",
      domainId: input.sourceDomainId,
      payload: `risk=${input.risk.overallRisk}`,
    },
    {
      phase: "beforeGovernanceScoring",
      domainId: input.sourceDomainId,
      payload: `health=${input.governanceScore.healthScore}`,
    },
    {
      phase: "afterGovernanceScoring",
      domainId: input.sourceDomainId,
      payload: `composite=${input.governanceScore.compositeScore}`,
    },
  ];
}
