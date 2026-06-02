import type {
  GovernanceMetaGovernanceAuditRecord,
  GovernanceMetaGovernanceScore,
} from "./meta-governance-types";

export function buildGovernanceMetaGovernanceAuditRecords(input: {
  metaGovernanceId: string;
  federationId: string;
  decisionCount: number;
  overComplex: boolean;
  metaScore: GovernanceMetaGovernanceScore;
}): GovernanceMetaGovernanceAuditRecord[] {
  const timestamp = new Date().toISOString();
  return [
    {
      metaGovernanceId: input.metaGovernanceId,
      federationId: input.federationId,
      decisionCount: input.decisionCount,
      overComplex: input.overComplex,
      compositeScore: input.metaScore.compositeScore,
      timestamp,
    },
  ];
}
