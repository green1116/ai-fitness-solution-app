import type { CommandPlatformStack } from "../api/stack";
import type {
  ChangeDispatch,
  CommandExecutionPlan,
  CommandExecutionResult,
  ExecutionDispatch,
  IncidentDispatch,
  RecoveryDispatch,
} from "../bridge/types";
import type {
  OrchestrationMode,
  OrchestrationPlan,
  OrchestrationReadinessProfile,
  OrchestrationResult,
} from "./types";
import { buildOrchestrationDecisions, buildOrchestrationPlan } from "./plan";
import { evaluateOrchestrationReadinessBatch } from "./readiness";

export type OrchestrateAdmittedIntentsResult = {
  admittedIntentIds: string[];
  blockedIntentIds: string[];
  readinessProfiles: OrchestrationReadinessProfile[];
  liveReadyIntentIds: string[];
};

export function orchestrateAdmittedIntents(input: {
  deploymentId: string;
  stack: CommandPlatformStack;
  mode: OrchestrationMode;
}): OrchestrateAdmittedIntentsResult {
  const admittedIntentIds = [...input.stack.coordination.admittedIntentIds];
  const blockedIntentIds = [...input.stack.coordination.blockedIntentIds];

  const readinessProfiles = evaluateOrchestrationReadinessBatch({
    deploymentId: input.deploymentId,
    stack: input.stack,
    mode: input.mode,
    admittedIntentIds,
  });

  const liveReadyIntentIds = readinessProfiles
    .filter((p) => p.admitted && p.liveReady)
    .map((p) => p.intentId);

  return {
    admittedIntentIds,
    blockedIntentIds,
    readinessProfiles,
    liveReadyIntentIds,
  };
}

export type OrchestrateBridgeDispatchResult = {
  filteredPlans: CommandExecutionPlan[];
  filteredDispatches: {
    execution: ExecutionDispatch[];
    change: ChangeDispatch[];
    incident: IncidentDispatch[];
    recovery: RecoveryDispatch[];
  };
  filteredResults: CommandExecutionResult[];
  dispatchedIntentIds: string[];
};

export function orchestrateBridgeDispatch(input: {
  stack: CommandPlatformStack;
  admittedIntentIds: string[];
}): OrchestrateBridgeDispatchResult {
  const admittedSet = new Set(input.admittedIntentIds);

  const filteredPlans = input.stack.bridge.plans.filter((p) => admittedSet.has(p.intentId));

  const filteredExecution = input.stack.bridge.executionDispatches.filter((d) =>
    admittedSet.has(d.intentId),
  );
  const filteredChange = input.stack.bridge.changeDispatches.filter((d) =>
    admittedSet.has(d.intentId),
  );
  const filteredIncident = input.stack.bridge.incidentDispatches.filter((d) =>
    admittedSet.has(d.intentId),
  );
  const filteredRecovery = input.stack.bridge.recoveryDispatches.filter((d) =>
    admittedSet.has(d.intentId),
  );

  const filteredResults = input.stack.bridge.results.filter((r) => admittedSet.has(r.intentId));

  const dispatchedIntentIds = [
    ...new Set(
      [...filteredExecution, ...filteredChange, ...filteredIncident, ...filteredRecovery]
        .filter((d) => d.status === "dispatched")
        .map((d) => d.intentId),
    ),
  ];

  return {
    filteredPlans,
    filteredDispatches: {
      execution: filteredExecution,
      change: filteredChange,
      incident: filteredIncident,
      recovery: filteredRecovery,
    },
    filteredResults,
    dispatchedIntentIds,
  };
}

export function buildOrchestrationResult(input: {
  deploymentId: string;
  mode: OrchestrationMode;
  plan: OrchestrationPlan;
  dispatchedCount: number;
}): OrchestrationResult {
  const admittedCount = input.plan.admittedIntentIds.length;
  const blockedCount = input.plan.blockedIntentIds.length;
  const readyCount = input.plan.steps.filter((s) => s.status === "ready" || s.status === "dispatched").length;
  const skippedCount = input.plan.steps.filter((s) => s.status === "skipped" || s.status === "blocked").length;

  const success =
    admittedCount > 0 &&
    (input.mode === "dry-run" ||
      input.mode === "orchestration-only" ||
      input.dispatchedCount > 0 ||
      readyCount > 0);

  return {
    resultId: `orchestration-result-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    mode: input.mode,
    admittedCount,
    blockedCount,
    dispatchedCount: input.dispatchedCount,
    readyCount,
    skippedCount,
    success,
    summary: `mode=${input.mode} admitted=${admittedCount} blocked=${blockedCount} dispatched=${input.dispatchedCount} ready=${readyCount}`,
  };
}

export function orchestrateCommandFlow(input: {
  deploymentId: string;
  stack: CommandPlatformStack;
  mode: OrchestrationMode;
}): {
  admitted: OrchestrateAdmittedIntentsResult;
  dispatch: OrchestrateBridgeDispatchResult;
  decisions: ReturnType<typeof buildOrchestrationDecisions>;
  plan: OrchestrationPlan;
  result: OrchestrationResult;
} {
  const admitted = orchestrateAdmittedIntents({
    deploymentId: input.deploymentId,
    stack: input.stack,
    mode: input.mode,
  });

  const dispatch = orchestrateBridgeDispatch({
    stack: input.stack,
    admittedIntentIds: admitted.admittedIntentIds,
  });

  const readinessByIntent = new Map(
    admitted.readinessProfiles.map((p) => [p.intentId, p.liveReady]),
  );

  const plan = buildOrchestrationPlan({
    deploymentId: input.deploymentId,
    stack: input.stack,
    mode: input.mode,
    admittedIntentIds: admitted.admittedIntentIds,
    blockedIntentIds: admitted.blockedIntentIds,
    readinessByIntent,
    dispatchedIntentIds: dispatch.dispatchedIntentIds,
  });

  const decisions = buildOrchestrationDecisions({
    stack: input.stack,
    admittedIntentIds: admitted.admittedIntentIds,
    blockedIntentIds: admitted.blockedIntentIds,
  });

  const result = buildOrchestrationResult({
    deploymentId: input.deploymentId,
    mode: input.mode,
    plan,
    dispatchedCount: dispatch.dispatchedIntentIds.length,
  });

  return { admitted, dispatch, decisions, plan, result };
}
