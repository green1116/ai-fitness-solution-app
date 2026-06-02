import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../../recovery/types";
import type { CommandExecutionPlan, RecoveryDispatch } from "./types";

export function dispatchRecovery(input: {
  deploymentId: string;
  plan: CommandExecutionPlan;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
}): RecoveryDispatch[] {
  const targets = input.plan.targets.filter((t) => t.domain === "recovery");
  if (targets.length === 0) return [];

  const request = input.recovery.requests[0];
  const orchestration = input.recovery.orchestration[0];
  const runtimeId = input.recovery.registry.recoveryOrchestrationId;

  return targets.map((target) => {
    const canDispatch = input.recovery.flags.orchestration && !!request;

    return {
      dispatchId: `recovery-dispatch-${target.intentId}-${target.targetId}`,
      intentId: target.intentId,
      planId: input.plan.planId,
      runtimeId,
      recoveryRequestRef: request?.requestId ?? "none",
      orchestrationRef: orchestration?.orchestrationId ?? "none",
      status: canDispatch ? "dispatched" : "skipped",
      outcome: canDispatch
        ? `recoveryStatus=${input.recovery.status} requests=${input.recovery.requests.length}`
        : "skipped-no-request",
    } as RecoveryDispatch;
  });
}
