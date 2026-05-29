import type { FederationGovernanceScore, FederationObservabilityAuditRecord, FederationRiskProfile } from "./observability-types";

export function buildFederationObservabilityAuditRecords(input: {
  observabilityId: string;
  federationId: string;
  healthScore: number;
  governanceScore: FederationGovernanceScore;
  risk: FederationRiskProfile;
}): FederationObservabilityAuditRecord[] {
  const now = new Date().toISOString();
  return [
    {
      observabilityId: input.observabilityId,
      federationId: input.federationId,
      healthScore: input.healthScore,
      compositeScore: input.governanceScore.compositeScore,
      overallRisk: input.risk.overallRisk,
      timestamp: now,
    },
  ];
}
