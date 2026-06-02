import type { GovernanceActionProposal, GovernanceDecisionCandidate } from "./autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";

export function buildGovernanceActionProposals(input: {
  deploymentId: string;
  decisions: GovernanceDecisionCandidate[];
  intelligence: GovernanceIntelligenceRuntimeResult;
}): GovernanceActionProposal[] {
  const proposals: GovernanceActionProposal[] = [];

  for (const rec of input.intelligence.recommendations) {
    proposals.push({
      proposalId: `proposal-${rec.recommendationId}`,
      action: rec.action,
      rationale: rec.rationale,
      expectedImpact: `priority=${rec.priority} category=${rec.category}`,
      confidence: priorityToConfidence(rec.priority),
      rollbackStrategy: rollbackForCategory(rec.category),
      sourceRecommendationId: rec.recommendationId,
    });
  }

  for (const decision of input.decisions) {
    const exists = proposals.some((p) => p.action === decision.decision);
    if (!exists) {
      proposals.push({
        proposalId: `proposal-${decision.candidateId}`,
        action: decision.decision,
        rationale: `Autonomous decision from ${decision.domain} domain`,
        expectedImpact: `confidence=${decision.confidence}`,
        confidence: decision.confidence,
        rollbackStrategy: rollbackForDomain(decision.domain),
      });
    }
  }

  if (proposals.length === 0) {
    proposals.push({
      proposalId: `proposal-default-${input.deploymentId}`,
      action: "maintain-governance-autopilot-watch",
      rationale: "No elevated actions; continue observability cycle",
      expectedImpact: "minimal",
      confidence: 90,
      rollbackStrategy: "no-op-rollback",
    });
  }

  return proposals;
}

function priorityToConfidence(priority: string): number {
  switch (priority) {
    case "urgent":
      return 85;
    case "high":
      return 75;
    case "medium":
      return 65;
    default:
      return 55;
  }
}

function rollbackForCategory(category: string): string {
  if (category === "recovery") return "revert-recovery-coordination";
  if (category === "policy") return "rollback-policy-bundle";
  if (category === "topology") return "restore-prior-routing";
  return "snapshot-restore-governance-state";
}

function rollbackForDomain(domain: string): string {
  return rollbackForCategory(domain === "optimization" ? "governance" : domain);
}
