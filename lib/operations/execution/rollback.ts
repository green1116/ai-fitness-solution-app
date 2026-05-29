import type {
  ExecutionEngineResult,
  ExecutionPlan,
  RollbackPlan,
  RollbackResult,
  RollbackStep,
} from "./types";

export function buildRollbackPlan(input: {
  deploymentId: string;
  plan: ExecutionPlan;
  engine: ExecutionEngineResult;
  rollbackStrategy: string;
}): RollbackPlan {
  const failedStep = input.engine.outcomes.find((o) => o.status === "failed");
  const triggerStepId = failedStep?.stepId ?? input.plan.steps[input.plan.steps.length - 1]?.stepId ?? "none";

  let mode: RollbackPlan["mode"] = "automatic";
  if (input.engine.outcomes.some((o) => o.status === "completed") && failedStep) mode = "partial";
  if (input.engine.mode === "simulation") mode = "manual";

  const steps: RollbackStep[] = [...input.plan.steps]
    .sort((a, b) => b.sequence - a.sequence)
    .map((step, index) => ({
      stepId: `rollback-${step.stepId}`,
      order: index + 1,
      action: `rollback-${step.action.name}`,
      status: failedStep ? "pending" : "completed",
    }));

  return {
    planId: `rollback-plan-${input.deploymentId}`,
    triggerStepId,
    mode,
    steps,
  };
}

export function executeRollback(input: {
  rollbackPlan: RollbackPlan;
  engine: ExecutionEngineResult;
}): RollbackResult | null {
  const needsRollback = input.engine.outcomes.some(
    (o) => o.status === "failed" || (input.engine.mode === "live-run" && o.status === "blocked"),
  );
  if (!needsRollback && input.engine.mode !== "live-run") {
    return null;
  }

  const stepsCompleted = input.rollbackPlan.steps.filter((s) => s.status === "completed").length;
  const partial = input.rollbackPlan.mode === "partial";
  const success = input.rollbackPlan.steps.length > 0 && (partial || stepsCompleted > 0);

  return {
    resultId: `rollback-result-${input.rollbackPlan.planId}`,
    planId: input.rollbackPlan.planId,
    success,
    partial,
    stepsCompleted: partial ? Math.max(1, stepsCompleted) : input.rollbackPlan.steps.length,
    message: `rollback=${input.rollbackPlan.mode} trigger=${input.rollbackPlan.triggerStepId}`,
  };
}
