import type { GovernanceActionProposal, GovernanceExecutionPlan } from "./autonomous-types";

export function buildGovernanceExecutionPlan(input: {
  deploymentId: string;
  proposals: GovernanceActionProposal[];
}): GovernanceExecutionPlan {
  const steps = input.proposals.slice(0, 5).map((proposal, index) => ({
    stepId: `step-${index + 1}-${input.deploymentId}`,
    order: index + 1,
    action: proposal.action,
    dependencyValidated: index === 0 || proposal.confidence >= 60,
    safetyCheckPassed: proposal.confidence >= 50 && !proposal.action.includes("failover"),
  }));

  const allSafe = steps.every((s) => s.safetyCheckPassed && s.dependencyValidated);
  const rollbackPlan = input.proposals.map((p) => p.rollbackStrategy).filter((r, i, arr) => arr.indexOf(r) === i).join("; ");

  return {
    planId: `execution-plan-${input.deploymentId}`,
    steps,
    rollbackPlan: rollbackPlan || "snapshot-restore-governance-state",
    safestPath: allSafe && steps.length > 0,
  };
}
