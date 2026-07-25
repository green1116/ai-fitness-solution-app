/**
 * Product P7 — Workflow types
 */

import type { WORKFLOW_STEP_KINDS } from "../collaboration/collaboration.constants";

export type WorkflowStepKind = (typeof WORKFLOW_STEP_KINDS)[number];
export type WorkflowMetadata = Record<string, unknown>;

export type WorkflowStep = {
  id: string;
  collaborationId: string;
  kind: WorkflowStepKind;
  name: string;
  sequence: number;
  completed: boolean;
  detail: string;
  metadata: WorkflowMetadata;
  createdAt: string;
  completedAt?: string;
};

export type CreateWorkflowStepInput = {
  id?: string;
  collaborationId: string;
  kind: WorkflowStepKind;
  name: string;
  sequence: number;
  metadata?: WorkflowMetadata;
};

export type CompleteWorkflowStepInput = {
  stepId: string;
};
