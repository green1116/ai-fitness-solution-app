import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AutopilotRuntimeResult,
  AutopilotStageResult,
} from "../shared/types";
import { AUTOPILOT_VERSION } from "../shared/types";
import { buildAutopilotWorkflow } from "./builders";
import type { WorkflowRuntimePayload } from "./types";
import { WORKFLOW_RUNTIME_VERSION, WORKFLOW_STEPS } from "./types";

export function validateWorkflowRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const workflow = buildAutopilotWorkflow(input);
  return {
    valid:
      workflow.steps.length === WORKFLOW_STEPS.length &&
      workflow.completedSteps >= 4,
  };
}

export function runWorkflowRuntime(input?: {
  deploymentId?: string;
}): AutopilotRuntimeResult<WorkflowRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "workflow-default";
  const stages: AutopilotStageResult[] = [];

  const workflow = runStage(
    "workflow-build",
    "Autopilot Workflow",
    () => buildAutopilotWorkflow({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "workflow-validate",
    "Workflow Validation",
    () => validateWorkflowRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Workflow validation failed");

  const payload: WorkflowRuntimePayload = {
    version: WORKFLOW_RUNTIME_VERSION,
    autopilotVersion: AUTOPILOT_VERSION,
    workflow,
    summary: `workflow steps=${workflow.totalSteps} completed=${workflow.completedSteps} current=${workflow.currentStep}`,
  };

  return finalizeRuntime({
    domain: "workflow",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
