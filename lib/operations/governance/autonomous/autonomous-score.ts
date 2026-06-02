import type {
  GovernanceApprovalCandidate,
  GovernanceAutonomousScore,
  GovernanceDecisionCandidate,
  GovernanceExecutionPlan,
  GovernanceOptimizationProposal,
  GovernanceRemediationPlan,
} from "./autonomous-types";

export function computeGovernanceAutonomousScore(input: {
  deploymentId: string;
  decisions: GovernanceDecisionCandidate[];
  executionPlan: GovernanceExecutionPlan;
  remediations: GovernanceRemediationPlan[];
  optimizations: GovernanceOptimizationProposal[];
  approval: GovernanceApprovalCandidate;
}): GovernanceAutonomousScore {
  const decisionQuality =
    input.decisions.length > 0
      ? Math.round(input.decisions.reduce((s, d) => s + d.confidence, 0) / input.decisions.length)
      : 50;

  const safeSteps = input.executionPlan.steps.filter((s) => s.safetyCheckPassed).length;
  const planningQuality =
    input.executionPlan.steps.length > 0
      ? Math.round((safeSteps / input.executionPlan.steps.length) * 100)
      : 50;

  const urgentRemediations = input.remediations.filter((r) => r.priority === "urgent" || r.priority === "high").length;
  const remediationQuality = Math.min(100, 60 + urgentRemediations * 10 + input.remediations.length * 5);

  const optimizationQuality = Math.min(
    100,
    Math.round(input.optimizations.reduce((s, o) => s + o.expectedGain, 0) / Math.max(input.optimizations.length, 1)),
  );

  let confidence = Math.round((decisionQuality + planningQuality) / 2);
  if (input.approval.status === "auto_approved") confidence += 10;
  if (input.approval.status === "blocked") confidence -= 30;
  confidence = Math.max(0, Math.min(100, confidence));

  const compositeScore = Math.round(
    (decisionQuality + planningQuality + remediationQuality + optimizationQuality + confidence) / 5,
  );

  return {
    scoreId: `autonomous-score-${input.deploymentId}`,
    decisionQuality,
    planningQuality,
    remediationQuality,
    optimizationQuality,
    confidence,
    compositeScore,
  };
}
