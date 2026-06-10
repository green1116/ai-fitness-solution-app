import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AutopilotRuntimeResult,
  AutopilotStageResult,
} from "../shared/types";
import { AUTOPILOT_VERSION } from "../shared/types";
import { buildStageOrchestrationState } from "./builders";
import type { StageOrchestrationRuntimePayload } from "./types";
import { STAGE_ORCHESTRATION_RUNTIME_VERSION } from "./types";

export function validateStageOrchestrationRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const state = buildStageOrchestrationState(input);
  return {
    valid:
      state.executions.length === 8 &&
      state.completedCount >= 4 &&
      state.runningCount <= 1,
  };
}

export function runStageOrchestrationRuntime(input?: {
  deploymentId?: string;
}): AutopilotRuntimeResult<StageOrchestrationRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "orchestration-default";
  const stages: AutopilotStageResult[] = [];

  const state = runStage(
    "stage-orchestration-build",
    "Stage Orchestration",
    () => buildStageOrchestrationState({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "stage-orchestration-validate",
    "Orchestration Validation",
    () => validateStageOrchestrationRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Stage orchestration validation failed");

  const payload: StageOrchestrationRuntimePayload = {
    version: STAGE_ORCHESTRATION_RUNTIME_VERSION,
    autopilotVersion: AUTOPILOT_VERSION,
    state,
    summary: `stage-orchestration pending=${state.pendingCount} running=${state.runningCount} completed=${state.completedCount} failed=${state.failedCount}`,
  };

  return finalizeRuntime({
    domain: "stage-orchestration",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
