import type {
  GovernanceApprovalCandidate,
  GovernanceAutonomousAnalysis,
  GovernanceExecutionPlan,
} from "./autonomous-types";
import type { GovernanceActionProposal } from "./autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";

export function evaluateGovernanceApproval(input: {
  deploymentId: string;
  analysis: GovernanceAutonomousAnalysis;
  proposals: GovernanceActionProposal[];
  executionPlan: GovernanceExecutionPlan;
  intelligence: GovernanceIntelligenceRuntimeResult;
}): GovernanceApprovalCandidate {
  const primaryProposal = input.proposals[0];
  const proposalId = primaryProposal?.proposalId ?? `proposal-none-${input.deploymentId}`;

  if (input.analysis.blockers.length > 0) {
    return {
      approvalId: `approval-${input.deploymentId}`,
      proposalId,
      status: "blocked",
      reason: `blockers=${input.analysis.blockers.join(",")}`,
    };
  }

  if (input.intelligence.status === "critical" || !input.executionPlan.safestPath) {
    return {
      approvalId: `approval-${input.deploymentId}`,
      proposalId,
      status: "executive_review",
      reason: "critical-intelligence-or-unsafe-execution-path",
    };
  }

  const hasUrgent = input.proposals.some(
    (p) => p.confidence < 70 || p.action.includes("failover") || p.action.includes("restricted"),
  );
  if (hasUrgent || input.intelligence.status === "elevated") {
    return {
      approvalId: `approval-${input.deploymentId}`,
      proposalId,
      status: "manual_review",
      reason: "elevated-risk-actions-require-review",
    };
  }

  if (input.analysis.mode === "autonomous" && input.executionPlan.safestPath) {
    return {
      approvalId: `approval-${input.deploymentId}`,
      proposalId,
      status: "auto_approved",
      reason: "autonomous-readiness-and-safe-plan",
    };
  }

  return {
    approvalId: `approval-${input.deploymentId}`,
    proposalId,
    status: "manual_review",
    reason: "advice-mode-default-review",
  };
}
