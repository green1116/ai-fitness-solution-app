import type { OperationalAutonomousExecutionRuntimeResult } from "../../execution/types";
import type { CommandExecutionPlan, ExecutionDispatch } from "./types";

export function dispatchExecution(input: {
  deploymentId: string;
  plan: CommandExecutionPlan;
  execution: OperationalAutonomousExecutionRuntimeResult;
}): ExecutionDispatch[] {
  const targets = input.plan.targets.filter((t) => t.domain === "execution");
  if (targets.length === 0) return [];

  const candidate = input.execution.candidates[0];
  const planRef = input.execution.plan.planId;
  const runtimeId = input.execution.registry.executionRuntimeId;

  return targets.map((target) => {
    const canDispatch =
      input.execution.flags.execution &&
      input.execution.safetyGate.allowed &&
      input.plan.status !== "failed";

    return {
      dispatchId: `exec-dispatch-${target.intentId}-${target.targetId}`,
      intentId: target.intentId,
      planId: input.plan.planId,
      runtimeId,
      candidateRef: candidate?.candidateId ?? "none",
      planRef,
      status: canDispatch ? "dispatched" : "skipped",
      outcome: canDispatch
        ? `engine executed=${input.execution.engine.executed} mode=${input.execution.plan.mode}`
        : `skipped safety=${input.execution.safetyGate.allowed}`,
    } as ExecutionDispatch;
  });
}
