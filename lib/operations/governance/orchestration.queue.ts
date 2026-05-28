import type {
  GovernanceActionQueueItem,
  GovernanceOrchestrationPlan,
  GovernanceOrchestrationStep,
} from "./orchestration.types";

export function buildGovernanceActionQueue(input: {
  plan: GovernanceOrchestrationPlan;
  observedAt: string;
  suppressedStepIds?: ReadonlySet<string>;
}): GovernanceActionQueueItem[] {
  const suppressed = input.suppressedStepIds ?? new Set<string>();
  const activeSteps = input.plan.steps.filter((step) => !suppressed.has(step.stepId));

  return activeSteps.map((step: GovernanceOrchestrationStep, index: number) => ({
    queueId: `queue-${step.stepId}`,
    position: index + 1,
    action: step.action,
    sourceRuleId: step.sourceRuleId,
    severity: step.severity,
    enqueuedAt: input.observedAt,
    status: step.status,
  }));
}
