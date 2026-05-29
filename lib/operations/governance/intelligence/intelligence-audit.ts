import type { GovernanceIntelligenceAuditRecord, GovernanceIntelligenceScore } from "./intelligence-types";

export function buildGovernanceIntelligenceAuditRecords(input: {
  intelligenceId: string;
  federationId: string;
  anomalyCount: number;
  recommendationCount: number;
  intelligenceScore: GovernanceIntelligenceScore;
}): GovernanceIntelligenceAuditRecord[] {
  const now = new Date().toISOString();
  return [
    {
      intelligenceId: input.intelligenceId,
      federationId: input.federationId,
      anomalyCount: input.anomalyCount,
      recommendationCount: input.recommendationCount,
      compositeScore: input.intelligenceScore.compositeScore,
      timestamp: now,
    },
  ];
}
