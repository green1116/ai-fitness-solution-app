import type {
  ExecutionEngineResult,
  ExecutionPlan,
  ExecutionRunMode,
  ExecutionSafetyGateResult,
  ExecutionStatus,
  ExecutionStep,
  ExecutionStepOutcome,
} from "./types";

export function executeStep(input: {
  step: ExecutionStep;
  mode: ExecutionRunMode;
  allowed: boolean;
}): ExecutionStepOutcome {
  const startedAt = new Date().toISOString();
  let status: ExecutionStatus = "completed";
  let message = `step=${input.step.stepId} action=${input.step.action.name}`;

  if (!input.allowed) {
    status = "blocked";
    message = `blocked:${input.step.action.name}`;
  } else if (input.mode === "simulation") {
    message = `simulated:${input.step.action.name}`;
  } else if (input.mode === "dry-run") {
    message = `dry-run:${input.step.action.name}`;
  } else {
    const risky = !input.step.action.reversible || input.step.action.name.includes("failover");
    if (risky) {
      status = "failed";
      message = `live-run-failed:${input.step.action.name}`;
    } else {
      message = `live-run-ok:${input.step.action.name}`;
    }
  }

  return {
    stepId: input.step.stepId,
    status,
    startedAt,
    completedAt: new Date().toISOString(),
    message,
  };
}

export function executeAction(input: {
  step: ExecutionStep;
  mode: ExecutionRunMode;
  allowed: boolean;
}): ExecutionStepOutcome {
  return executeStep(input);
}

export function executePlan(input: {
  plan: ExecutionPlan;
  mode: ExecutionRunMode;
  safetyGate: ExecutionSafetyGateResult;
}): ExecutionEngineResult {
  const allowed = input.safetyGate.allowed;
  const outcomes: ExecutionStepOutcome[] = [];

  const orderedSteps = [...input.plan.steps].sort((a, b) => a.sequence - b.sequence);
  for (const step of orderedSteps) {
    const depsMet = step.dependencies.every((depId) =>
      outcomes.some((o) => o.stepId === depId && o.status === "completed"),
    );
    if (step.dependencies.length > 0 && !depsMet) {
      outcomes.push({
        stepId: step.stepId,
        status: "blocked",
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        message: "dependency-not-met",
      });
      continue;
    }
    outcomes.push(
      executeStep({
        step,
        mode: input.mode,
        allowed: allowed && input.mode !== "simulation" ? allowed : true,
      }),
    );
    if (input.plan.staged && outcomes.some((o) => o.status === "failed")) break;
  }

  const executed = input.mode === "live-run" && allowed && outcomes.some((o) => o.status === "completed");
  const simulated = input.mode === "simulation";

  return {
    engineId: `execution-engine-${input.plan.deploymentId}`,
    mode: input.mode,
    planId: input.plan.planId,
    outcomes,
    executed,
    simulated,
  };
}
