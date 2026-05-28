import type {
  GovernanceOrchestrationConflict,
  GovernanceOrchestrationPlan,
  GovernanceOrchestrationState,
  GovernanceOrchestrationStep,
  GovernanceOrchestrationStepStatus,
} from "./orchestration.types";

function finalStatusForStep(
  step: GovernanceOrchestrationStep,
  suppressed: boolean,
): GovernanceOrchestrationStepStatus {
  if (suppressed) return "deferred";
  if (!step.autoCompletable) {
    if (step.action === "manualReview" || step.action === "approve") return "pending";
    if (step.action === "escalate") return "escalated";
    return "pending";
  }
  switch (step.action) {
    case "applyControl":
      return "controlled";
    case "recordException":
      return "exceptionRecorded";
    case "generateAudit":
      return "audited";
    case "defer":
      return "deferred";
    default:
      return "completed";
  }
}

export function executeGovernanceOrchestrationPlan(input: {
  plan: GovernanceOrchestrationPlan;
  conflicts: GovernanceOrchestrationConflict[];
}): { steps: GovernanceOrchestrationStep[]; state: GovernanceOrchestrationState } {
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

  const steps = input.plan.steps.map((step) => {
    const suppressed = suppressedIds.has(step.stepId);
    return {
      ...step,
      status: finalStatusForStep(step, suppressed),
    };
  });

  const completedSteps = steps.filter(
    (s) =>
      s.status === "completed" ||
      s.status === "controlled" ||
      s.status === "exceptionRecorded" ||
      s.status === "audited" ||
      s.status === "escalated" ||
      s.status === "deferred",
  ).length;

  const requiresManualReview = steps.some(
    (s) => (s.action === "manualReview" || s.action === "approve") && s.status === "pending",
  );
  const highSeverityPending = steps.some(
    (s) =>
      (s.severity === "critical" || s.severity === "high") &&
      s.status === "pending" &&
      !s.autoCompletable,
  );

  const currentPhase =
    steps.find((s) => s.status === "pending")?.action ??
    (steps.length > 0 ? steps[steps.length - 1].action : "idle");

  const allDone = steps.every((s) => s.status !== "pending" || s.action === "manualReview");
  const status: GovernanceOrchestrationState["status"] =
    requiresManualReview && highSeverityPending
      ? "inProgress"
      : allDone && !requiresManualReview
        ? "completed"
        : completedSteps > 0
          ? "inProgress"
          : "pending";

  return {
    steps,
    state: {
      status,
      currentPhase,
      completedSteps,
      totalSteps: steps.length,
      requiresManualReview,
      highSeverityPending,
    },
  };
}
