import type {
  GovernanceApprovalCandidate,
  GovernanceAutonomousAnalysis,
  GovernanceAutonomousLineageGraph,
  GovernanceAutonomousScore,
  GovernanceAutonomousSignalBundle,
  GovernanceDecisionCandidate,
  GovernanceExecutionPlan,
  GovernanceOptimizationProposal,
  GovernanceRemediationPlan,
} from "./autonomous-types";
import type { GovernanceActionProposal } from "./autonomous-types";

export function buildGovernanceAutonomousLineageGraph(input: {
  deploymentId: string;
  signals: GovernanceAutonomousSignalBundle;
  analysis: GovernanceAutonomousAnalysis;
  decisions: GovernanceDecisionCandidate[];
  proposals: GovernanceActionProposal[];
  executionPlan: GovernanceExecutionPlan;
  remediations: GovernanceRemediationPlan[];
  optimizations: GovernanceOptimizationProposal[];
  approval: GovernanceApprovalCandidate;
  autonomousScore: GovernanceAutonomousScore;
}): GovernanceAutonomousLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `autonomous-lineage-${input.deploymentId}`,
    entries: [
      { entryId: `lineage-signals-${input.signals.bundleId}`, event: "signals", detail: `count=${input.signals.signals.length}`, timestamp: now },
      { entryId: `lineage-analysis-${input.analysis.analysisId}`, event: "analysis", detail: `mode=${input.analysis.mode} readiness=${input.analysis.readinessScore}`, timestamp: now },
      { entryId: `lineage-decision-${input.deploymentId}`, event: "decision", detail: `candidates=${input.decisions.length}`, timestamp: now },
      { entryId: `lineage-proposal-${input.deploymentId}`, event: "proposal", detail: `proposals=${input.proposals.length}`, timestamp: now },
      { entryId: `lineage-plan-${input.executionPlan.planId}`, event: "plan", detail: `steps=${input.executionPlan.steps.length} safest=${input.executionPlan.safestPath}`, timestamp: now },
      { entryId: `lineage-remediation-${input.deploymentId}`, event: "remediation", detail: `count=${input.remediations.length}`, timestamp: now },
      { entryId: `lineage-optimization-${input.deploymentId}`, event: "optimization", detail: `count=${input.optimizations.length}`, timestamp: now },
      { entryId: `lineage-approval-${input.approval.approvalId}`, event: "approval", detail: `status=${input.approval.status}`, timestamp: now },
      { entryId: `lineage-score-${input.autonomousScore.scoreId}`, event: "score", detail: `composite=${input.autonomousScore.compositeScore}`, timestamp: now },
    ],
  };
}
