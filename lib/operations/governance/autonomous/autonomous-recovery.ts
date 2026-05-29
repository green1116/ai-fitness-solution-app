import type { GovernanceActionProposal } from "./autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";

export function buildAutonomousRecoveryProposals(input: {
  deploymentId: string;
  intelligence: GovernanceIntelligenceRuntimeResult;
  proposals: GovernanceActionProposal[];
}): GovernanceActionProposal[] {
  const recoveryRecs = input.intelligence.recommendations.filter((r) => r.category === "recovery");
  return recoveryRecs.map((rec) => ({
    proposalId: `autonomous-recovery-${rec.recommendationId}`,
    action: rec.action,
    rationale: `Autonomous recovery: ${rec.rationale}`,
    expectedImpact: "stabilize-federation-recovery",
    confidence: rec.priority === "urgent" ? 88 : 75,
    rollbackStrategy: "revert-recovery-coordination",
    sourceRecommendationId: rec.recommendationId,
  }));
}
