import type { AutonomousChangeManagementRuntimeResult } from "../../change/types";
import type { ChangeDispatch, CommandExecutionPlan } from "./types";

export function dispatchChange(input: {
  deploymentId: string;
  plan: CommandExecutionPlan;
  change: AutonomousChangeManagementRuntimeResult;
}): ChangeDispatch[] {
  const targets = input.plan.targets.filter((t) => t.domain === "change");
  if (targets.length === 0) return [];

  const request = input.change.requests[0];
  const approval = input.change.approvals[0];
  const runtimeId = input.change.registry.changeManagementId;

  return targets.map((target) => {
    const canDispatch =
      input.change.flags.workflow &&
      input.change.status !== "rejected" &&
      !!request;

    return {
      dispatchId: `change-dispatch-${target.intentId}-${target.targetId}`,
      intentId: target.intentId,
      planId: input.plan.planId,
      runtimeId,
      changeRequestRef: request?.requestId ?? "none",
      approvalRef: approval?.decisionId ?? "none",
      status: canDispatch ? "dispatched" : "skipped",
      outcome: canDispatch
        ? `changeStatus=${input.change.status} requests=${input.change.requests.length}`
        : "skipped-no-request",
    } as ChangeDispatch;
  });
}
