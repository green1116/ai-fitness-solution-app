import type { AUTOPILOT_VERSION } from "../shared/types";

export const WORKFLOW_RUNTIME_VERSION = "v13.5-workflow-1" as const;

export const WORKFLOW_STEPS = [
  "tender-upload",
  "tender-intelligence",
  "knowledge-fusion",
  "proposal-generation",
  "proposal-pdf",
  "plan-pdf",
  "budget-pdf",
  "enterprise-zip",
] as const;

export type WorkflowStepId = (typeof WORKFLOW_STEPS)[number];

export interface WorkflowStep {
  stepId: WorkflowStepId;
  label: string;
  order: number;
  moduleRef: string;
  ready: boolean;
}

export interface AutopilotWorkflow {
  workflowId: string;
  jobId: string;
  steps: WorkflowStep[];
  currentStep: WorkflowStepId;
  totalSteps: number;
  completedSteps: number;
}

export interface WorkflowRuntimePayload {
  version: typeof WORKFLOW_RUNTIME_VERSION;
  autopilotVersion: typeof AUTOPILOT_VERSION;
  workflow: AutopilotWorkflow;
  summary: string;
}
