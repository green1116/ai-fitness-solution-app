import type { GovernanceApprovalCandidate, GovernanceAutonomousAuditRecord, GovernanceAutonomousScore } from "./autonomous-types";

export function buildGovernanceAutonomousAuditRecords(input: {
  autonomousId: string;
  federationId: string;
  proposalCount: number;
  approval: GovernanceApprovalCandidate;
  autonomousScore: GovernanceAutonomousScore;
}): GovernanceAutonomousAuditRecord[] {
  const now = new Date().toISOString();
  return [
    {
      autonomousId: input.autonomousId,
      federationId: input.federationId,
      proposalCount: input.proposalCount,
      approvalStatus: input.approval.status,
      compositeScore: input.autonomousScore.compositeScore,
      timestamp: now,
    },
  ];
}
