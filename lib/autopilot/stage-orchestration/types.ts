import type { AUTOPILOT_VERSION } from "../shared/types";
import type { WorkflowStepId } from "../workflow/types";

export const STAGE_ORCHESTRATION_RUNTIME_VERSION = "v13.5-stage-orchestration-1" as const;

export const STAGE_EXECUTION_STATUSES = [
  "pending",
  "running",
  "completed",
  "failed",
  "retry",
] as const;

export type StageExecutionStatus = (typeof STAGE_EXECUTION_STATUSES)[number];

export interface StageExecution {
  executionId: string;
  stepId: WorkflowStepId;
  status: StageExecutionStatus;
  attempt: number;
  startedAt: string;
  completedAt?: string;
  message: string;
}

export interface StageOrchestrationState {
  orchestrationId: string;
  jobId: string;
  executions: StageExecution[];
  pendingCount: number;
  runningCount: number;
  completedCount: number;
  failedCount: number;
}

export interface StageOrchestrationRuntimePayload {
  version: typeof STAGE_ORCHESTRATION_RUNTIME_VERSION;
  autopilotVersion: typeof AUTOPILOT_VERSION;
  state: StageOrchestrationState;
  summary: string;
}
