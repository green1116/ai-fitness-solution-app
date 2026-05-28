import type {
  GovernanceOrchestrationConflict,
  GovernanceOrchestrationPlan,
  GovernanceOrchestrationState,
  GovernanceOrchestrationSummary,
  GovernanceOrchestrationTimeline,
} from "./orchestration.types";

export function summarizeGovernanceOrchestration(input: {
  deploymentId: string;
  plan: GovernanceOrchestrationPlan;
  state: GovernanceOrchestrationState;
  timeline: GovernanceOrchestrationTimeline;
  conflicts: GovernanceOrchestrationConflict[];
}): GovernanceOrchestrationSummary {
  const prioritized = input.plan.executionOrder.filter((action) =>
    input.plan.steps.some((s) => s.action === action),
  );
  const firstActions = input.timeline.entries.slice(0, 3).map((e) => e.action);

  const text = [
    `mode=${input.plan.policyPackMode}`,
    `state=${input.state.status}`,
    `steps=${input.state.totalSteps}`,
    `completed=${input.state.completedSteps}`,
    `manualReview=${input.state.requiresManualReview}`,
    `highSeverityPending=${input.state.highSeverityPending}`,
    `conflicts=${input.conflicts.length}`,
    `order=${prioritized.join(">")}`,
    `first=${firstActions.join(",")}`,
    `reason=escalation-before-approval-before-controls; strict-over-defer; audit-last`,
  ].join(" ");

  return {
    summaryId: `orch-sum-${input.deploymentId.slice(0, 8)}`,
    text,
    finalState: input.state.status,
    prioritizedActions: prioritized,
    conflictCount: input.conflicts.length,
    traceId: `trace-orch-${input.deploymentId}`,
  };
}

export const DEFAULT_ORCHESTRATION_VERSION = "v4-a3-r4-orchestration-1" as const;
