import type { OperationalAutonomousExecutionRuntimeResult } from "../../execution/types";
import type { AutonomousChangeManagementRuntimeResult } from "../../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../../recovery/types";
import type {
  ChangeDispatch,
  CommandExecutionPlan,
  CommandExecutionResult,
  ExecutionDispatch,
  IncidentDispatch,
  RecoveryDispatch,
  RollbackReadiness,
} from "./types";
import { dispatchExecution } from "./dispatch-execution";
import { dispatchChange } from "./dispatch-change";
import { dispatchIncident } from "./dispatch-incident";
import { dispatchRecovery } from "./dispatch-recovery";

export type CommandDispatchBundle = {
  executionDispatches: ExecutionDispatch[];
  changeDispatches: ChangeDispatch[];
  incidentDispatches: IncidentDispatch[];
  recoveryDispatches: RecoveryDispatch[];
  results: CommandExecutionResult[];
  rollbackReadiness: RollbackReadiness[];
  dispatchedCommands: string[];
};

function buildResultForTarget(input: {
  plan: CommandExecutionPlan;
  domain: CommandExecutionResult["domain"];
  dispatchStatus: "dispatched" | "skipped" | "failed";
  detail: string;
  rollbackCapable: boolean;
}): CommandExecutionResult {
  const success = input.dispatchStatus === "dispatched";
  let status: CommandExecutionResult["status"] = success ? "completed" : "failed";
  if (!success && input.rollbackCapable) status = "rolled-back-ready";

  return {
    resultId: `result-${input.plan.intentId}-${input.domain}`,
    intentId: input.plan.intentId,
    planId: input.plan.planId,
    domain: input.domain,
    success,
    status,
    detail: input.detail,
  };
}

export function dispatchCommand(input: {
  deploymentId: string;
  plan: CommandExecutionPlan;
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
}): CommandDispatchBundle {
  const executionDispatches = dispatchExecution({
    deploymentId: input.deploymentId,
    plan: input.plan,
    execution: input.execution,
  });
  const changeDispatches = dispatchChange({
    deploymentId: input.deploymentId,
    plan: input.plan,
    change: input.change,
  });
  const incidentDispatches = dispatchIncident({
    deploymentId: input.deploymentId,
    plan: input.plan,
    incident: input.incident,
  });
  const recoveryDispatches = dispatchRecovery({
    deploymentId: input.deploymentId,
    plan: input.plan,
    recovery: input.recovery,
  });

  const results: CommandExecutionResult[] = [];

  for (const d of executionDispatches) {
    results.push(
      buildResultForTarget({
        plan: input.plan,
        domain: "execution",
        dispatchStatus: d.status,
        detail: d.outcome,
        rollbackCapable: input.plan.rollbackCapable,
      }),
    );
  }
  for (const d of changeDispatches) {
    results.push(
      buildResultForTarget({
        plan: input.plan,
        domain: "change",
        dispatchStatus: d.status,
        detail: d.outcome,
        rollbackCapable: input.plan.rollbackCapable,
      }),
    );
  }
  for (const d of incidentDispatches) {
    results.push(
      buildResultForTarget({
        plan: input.plan,
        domain: "incident",
        dispatchStatus: d.status,
        detail: d.outcome,
        rollbackCapable: input.plan.rollbackCapable,
      }),
    );
  }
  for (const d of recoveryDispatches) {
    results.push(
      buildResultForTarget({
        plan: input.plan,
        domain: "recovery",
        dispatchStatus: d.status,
        detail: d.outcome,
        rollbackCapable: input.plan.rollbackCapable,
      }),
    );
  }

  const rollbackPlanRef = input.execution.rollback.plan?.planId ?? null;
  const rollbackCapable =
    input.plan.rollbackCapable &&
    input.execution.flags.rollback &&
    !!rollbackPlanRef;

  const rollbackReadiness: RollbackReadiness = {
    readinessId: `rollback-readiness-${input.plan.intentId}`,
    intentId: input.plan.intentId,
    capable: rollbackCapable,
    rollbackPlanRef,
    reason: rollbackCapable
      ? "execution-rollback-plan-available"
      : input.plan.rollbackCapable
        ? "rollback-plan-missing"
        : "not-rollback-capable",
  };

  const anyDispatched = [
    ...executionDispatches,
    ...changeDispatches,
    ...incidentDispatches,
    ...recoveryDispatches,
  ].some((d) => d.status === "dispatched");

  const dispatchedCommands = anyDispatched ? [input.plan.intentId] : [];

  return {
    executionDispatches,
    changeDispatches,
    incidentDispatches,
    recoveryDispatches,
    results,
    rollbackReadiness: [rollbackReadiness],
    dispatchedCommands,
  };
}

export function dispatchCommands(input: {
  deploymentId: string;
  plans: CommandExecutionPlan[];
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
}): CommandDispatchBundle {
  const merged: CommandDispatchBundle = {
    executionDispatches: [],
    changeDispatches: [],
    incidentDispatches: [],
    recoveryDispatches: [],
    results: [],
    rollbackReadiness: [],
    dispatchedCommands: [],
  };

  for (const plan of input.plans) {
    const bundle = dispatchCommand({
      deploymentId: input.deploymentId,
      plan: { ...plan, status: "dispatching" },
      execution: input.execution,
      change: input.change,
      incident: input.incident,
      recovery: input.recovery,
    });
    merged.executionDispatches.push(...bundle.executionDispatches);
    merged.changeDispatches.push(...bundle.changeDispatches);
    merged.incidentDispatches.push(...bundle.incidentDispatches);
    merged.recoveryDispatches.push(...bundle.recoveryDispatches);
    merged.results.push(...bundle.results);
    merged.rollbackReadiness.push(...bundle.rollbackReadiness);
    merged.dispatchedCommands.push(...bundle.dispatchedCommands);
  }

  return merged;
}
