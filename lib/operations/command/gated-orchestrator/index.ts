export * from "./types";
export * from "./readiness";
export * from "./plan";
export * from "./orchestrate";
export * from "./audit";

import { buildCommandPlatformStack } from "../api/stack";
import {
  GATED_BRIDGE_ORCHESTRATOR_VERSION,
  type GatedBridgeOrchestratorInput,
  type GatedBridgeOrchestratorResult,
  type OrchestrationMode,
} from "./types";
import { orchestrateCommandFlow } from "./orchestrate";
import { auditOrchestration } from "./audit";

export type GatedBridgeOrchestratorRuntime = GatedBridgeOrchestratorResult;

export function buildGatedBridgeOrchestrator(
  input: GatedBridgeOrchestratorInput,
): GatedBridgeOrchestratorResult {
  const mode: OrchestrationMode = input.mode ?? "orchestration-only";
  const stack = input.stack ?? buildCommandPlatformStack(input.deploymentId);

  const flow = orchestrateCommandFlow({
    deploymentId: input.deploymentId,
    stack,
    mode,
  });

  const audit = auditOrchestration({
    deploymentId: input.deploymentId,
    plan: flow.plan,
    readinessProfiles: flow.admitted.readinessProfiles,
    dispatch: flow.dispatch,
    gateState: stack.coordination.gate.state,
  });

  const rollbackProfiles = flow.admitted.readinessProfiles.filter((p) => p.rollbackCapable);

  const orchestrator = {
    orchestratorId: `gated-bridge-orchestrator-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    platformVersion: "V4-A5-A5" as const,
    mode,
    plan: flow.plan,
    decisions: flow.decisions,
    readinessProfiles: flow.admitted.readinessProfiles,
    result: flow.result,
    audit,
    gate: {
      state: stack.coordination.gate.state,
      admittedIntentIds: flow.admitted.admittedIntentIds,
      blockedIntentIds: flow.admitted.blockedIntentIds,
    },
    bridge: {
      filteredPlans: flow.dispatch.filteredPlans.length,
      filteredDispatches:
        flow.dispatch.filteredDispatches.execution.length +
        flow.dispatch.filteredDispatches.change.length +
        flow.dispatch.filteredDispatches.incident.length +
        flow.dispatch.filteredDispatches.recovery.length,
      filteredResults: flow.dispatch.filteredResults.length,
    },
  };

  let status: GatedBridgeOrchestratorResult["status"] = "completed";
  if (flow.plan.admittedIntentIds.length === 0) status = "idle";
  else if (flow.plan.blockedIntentIds.length > 0 && flow.plan.admittedIntentIds.length > 0) {
    status = "partial";
  }
  if (flow.plan.blockedIntentIds.length === stack.command.intents.length) status = "blocked";
  if (mode === "live-ready" && flow.dispatch.dispatchedIntentIds.length === 0) status = "orchestrating";

  return {
    version: GATED_BRIDGE_ORCHESTRATOR_VERSION,
    orchestrator,
    flags: {
      plan: flow.plan.steps.length > 0,
      readiness: flow.admitted.readinessProfiles.length > 0,
      orchestration: flow.decisions.length > 0,
      dispatch: flow.dispatch.filteredPlans.length > 0,
      audit: audit.length > 0,
      rollback: rollbackProfiles.length > 0 || mode === "rollback-aware",
    },
    summary: {
      summaryId: `gated-orchestrator-summary-${input.deploymentId}`,
      text: flow.result.summary,
      traceId: `gated-orchestrator-trace-${input.deploymentId}`,
    },
    status,
  };
}
