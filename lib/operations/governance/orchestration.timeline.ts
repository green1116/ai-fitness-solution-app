import type {
  GovernanceOrchestrationConflict,
  GovernanceOrchestrationPlan,
  GovernanceOrchestrationTimeline,
  GovernanceOrchestrationTimelineEntry,
} from "./orchestration.types";

function statusAfterAction(
  action: GovernanceOrchestrationTimelineEntry["action"],
): GovernanceOrchestrationTimelineEntry["status"] {
  switch (action) {
    case "escalate":
      return "escalated";
    case "approve":
      return "approved";
    case "manualReview":
      return "pending";
    case "applyControl":
      return "controlled";
    case "recordException":
      return "exceptionRecorded";
    case "defer":
      return "deferred";
    case "generateAudit":
      return "audited";
    default:
      return "completed";
  }
}

export function buildGovernanceOrchestrationTimeline(input: {
  plan: GovernanceOrchestrationPlan;
  observedAt: string;
  conflicts: GovernanceOrchestrationConflict[];
}): GovernanceOrchestrationTimeline {
  const entries: GovernanceOrchestrationTimelineEntry[] = [];
  let sequence = 1;

  const suppressedIds = new Set<string>();
  for (const conflict of input.conflicts) {
    if (conflict.winner === "approve" || conflict.winner === "manualReview") {
      for (const step of input.plan.steps) {
        if (step.action === "defer" && conflict.sourceRuleIds.includes(step.sourceRuleId)) {
          suppressedIds.add(step.stepId);
        }
      }
    }
  }

  for (const step of input.plan.steps) {
    if (suppressedIds.has(step.stepId)) {
      entries.push({
        sequence: sequence++,
        timestamp: input.observedAt,
        action: step.action,
        stepId: step.stepId,
        sourceRuleId: step.sourceRuleId,
        status: "deferred",
        note: `Suppressed by conflict resolution; ${step.reason}`,
      });
      continue;
    }

    entries.push({
      sequence: sequence++,
      timestamp: input.observedAt,
      action: step.action,
      stepId: step.stepId,
      sourceRuleId: step.sourceRuleId,
      status: statusAfterAction(step.action),
      note: step.autoCompletable
        ? step.reason
        : `${step.reason} [requires human action]`,
    });
  }

  return {
    timelineId: `gtimeline-${input.plan.planId}`,
    startedAt: input.observedAt,
    entries,
  };
}
