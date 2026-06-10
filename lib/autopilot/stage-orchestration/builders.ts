import { buildAutopilotWorkflow } from "../workflow/builders";
import { WORKFLOW_STEPS } from "../workflow/types";
import type { StageExecution, StageExecutionStatus, StageOrchestrationState } from "./types";

function resolveStageStatus(stepReady: boolean, index: number, completedCount: number): StageExecutionStatus {
  if (stepReady) return "completed";
  if (index === completedCount) return "running";
  if (index > completedCount) return "pending";
  return "failed";
}

export function buildStageExecutions(deploymentId: string): StageExecution[] {
  const workflow = buildAutopilotWorkflow({ deploymentId });
  const now = new Date().toISOString();

  return workflow.steps.map((step, index) => {
    const status = resolveStageStatus(step.ready, index, workflow.completedSteps);
    return {
      executionId: `exec-${step.stepId}-${deploymentId}`,
      stepId: step.stepId,
      status,
      attempt: status === "retry" ? 2 : 1,
      startedAt: now,
      completedAt: status === "completed" ? now : undefined,
      message: `${step.label} — ${status}`,
    };
  });
}

export function buildStageOrchestrationState(input?: {
  deploymentId?: string;
  jobId?: string;
}): StageOrchestrationState {
  const deploymentId = input?.deploymentId ?? "orchestration-default";
  const jobId = input?.jobId ?? `autopilot-job-${deploymentId}`;
  const executions = buildStageExecutions(deploymentId);

  return {
    orchestrationId: `orchestration-${deploymentId}`,
    jobId,
    executions,
    pendingCount: executions.filter((e) => e.status === "pending").length,
    runningCount: executions.filter((e) => e.status === "running").length,
    completedCount: executions.filter((e) => e.status === "completed").length,
    failedCount: executions.filter((e) => e.status === "failed").length,
  };
}

