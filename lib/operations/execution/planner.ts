import type {
  ExecutionCandidate,
  ExecutionDependency,
  ExecutionPlan,
  ExecutionRunMode,
  ExecutionStep,
} from "./types";

function inferCategory(actionName: string): ExecutionStep["action"]["category"] {
  if (actionName.includes("recover") || actionName.includes("rollback")) return "recovery";
  if (actionName.includes("optim")) return "optimization";
  if (actionName.includes("remediat") || actionName.includes("stabil")) return "remediation";
  return "change";
}

export function buildExecutionCandidates(input: {
  deploymentId: string;
  approvedProposalIds: string[];
  proposals: { proposalId: string; action: string; confidence: number }[];
}): ExecutionCandidate[] {
  const now = Date.now();
  const window: ExecutionCandidate["window"] = {
    windowId: `window-${input.deploymentId}`,
    startsAt: new Date(now).toISOString(),
    endsAt: new Date(now + 3600_000).toISOString(),
    timezone: "UTC",
  };

  return input.proposals
    .filter((proposal) => input.approvedProposalIds.includes(proposal.proposalId))
    .map((proposal, index) => {
      const priority: ExecutionCandidate["priority"] =
        proposal.confidence >= 80 ? "critical" : proposal.confidence >= 60 ? "high" : "medium";
      const intent: ExecutionCandidate["intent"] = proposal.action.includes("recover")
        ? "recover"
        : proposal.action.includes("optim")
          ? "optimize"
          : proposal.action.includes("remediat")
            ? "remediate"
            : "change";

      return {
        candidateId: `candidate-${proposal.proposalId}`,
        action: {
          actionId: `action-${proposal.proposalId}`,
          name: proposal.action,
          category: inferCategory(proposal.action),
          reversible: !proposal.action.includes("failover"),
        },
        intent,
        priority,
        scope: (intent === "recover" ? "federation" : "domain") as ExecutionCandidate["scope"],
        owner: "autonomous-agent" as ExecutionCandidate["owner"],
        window,
        sourceProposalId: proposal.proposalId,
        approved: true,
      };
    })
    .slice(0, 6);
}

export function buildExecutionPlan(input: {
  deploymentId: string;
  mode: ExecutionRunMode;
  candidates: ExecutionCandidate[];
}): ExecutionPlan {
  const steps: ExecutionStep[] = input.candidates.map((candidate, index) => ({
    stepId: `step-${index + 1}-${input.deploymentId}`,
    sequence: index + 1,
    candidateId: candidate.candidateId,
    action: candidate.action,
    dependencies: index > 0 ? [`step-${index}-${input.deploymentId}`] : [],
    status: "pending",
  }));

  const dependencies: ExecutionDependency[] = steps
    .filter((step) => step.dependencies.length > 0)
    .map((step) => ({
      dependencyId: `dep-${step.stepId}`,
      fromStepId: step.dependencies[0]!,
      toStepId: step.stepId,
      relation: "requires" as const,
    }));

  const highPriority = input.candidates.some((c) => c.priority === "critical");
  const staged = input.candidates.length > 2 || highPriority;

  return {
    planId: `execution-plan-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    mode: input.mode,
    steps,
    dependencies,
    sequence: steps.map((step) => step.sequence),
    staged,
  };
}
