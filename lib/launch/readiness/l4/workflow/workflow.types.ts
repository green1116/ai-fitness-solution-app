/**
 * Launch L4 — Workflow types
 */

import type { WORKFLOW_STEP_STATUSES } from "../scenario/scenario.constants";

export type WorkflowStepStatus = (typeof WORKFLOW_STEP_STATUSES)[number];
export type WorkflowMetadata = Record<string, unknown>;

export type WorkflowDefinition = {
  id: string;
  scenarioId: string;
  name: string;
  stepLabels: string[];
  detail: string;
  metadata: WorkflowMetadata;
  createdAt: string;
};

export type CreateWorkflowInput = {
  id?: string;
  scenarioId: string;
  name: string;
  stepLabels: string[];
  metadata?: WorkflowMetadata;
};

export type WorkflowStep = {
  id: string;
  workflowId: string;
  index: number;
  label: string;
  status: WorkflowStepStatus;
  detail: string;
  updatedAt: string;
};

export type AdvanceWorkflowStepInput = {
  workflowId: string;
  stepIndex: number;
  status: Exclude<WorkflowStepStatus, "PENDING">;
};
