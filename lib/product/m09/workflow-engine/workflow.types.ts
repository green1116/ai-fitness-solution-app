/**
 * Product M09 — AI Workflow Engine shared types
 */

import type {
  AI_WORKFLOW_KINDS,
  AI_WORKFLOW_READINESS_VERDICTS,
  AI_WORKFLOW_STATUSES,
  AI_WORKFLOW_STEP_KINDS,
  AI_WORKFLOW_VERSION_STATUSES,
  PRODUCT_AI_WORKFLOW_ENGINE_BASE,
  PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_WORKFLOW_ENGINE_ID,
  PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
} from "./workflow.constants";

export type AiWorkflowKind = (typeof AI_WORKFLOW_KINDS)[number];
export type AiWorkflowStatus = (typeof AI_WORKFLOW_STATUSES)[number];
export type AiWorkflowVersionStatus =
  (typeof AI_WORKFLOW_VERSION_STATUSES)[number];
export type AiWorkflowStepKind = (typeof AI_WORKFLOW_STEP_KINDS)[number];
export type AiWorkflowReadinessVerdict =
  (typeof AI_WORKFLOW_READINESS_VERDICTS)[number];
export type AiWorkflowMetadata = Record<string, unknown>;

export type ProductAiWorkflow = {
  id: string;
  workflowKey: string;
  name: string;
  kind: AiWorkflowKind;
  status: AiWorkflowStatus;
  summary: string;
  detail: string;
  metadata: AiWorkflowMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiWorkflowInput = {
  id?: string;
  workflowKey: string;
  name: string;
  kind: AiWorkflowKind;
  summary: string;
  metadata?: AiWorkflowMetadata;
};

export type UpdateAiWorkflowStatusInput = {
  workflowId: string;
  status: AiWorkflowStatus;
};

export type AiWorkflowVersion = {
  id: string;
  workflowId: string;
  versionKey: string;
  semver: string;
  status: AiWorkflowVersionStatus;
  detail: string;
  metadata: AiWorkflowMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiWorkflowVersionInput = {
  id?: string;
  workflowId: string;
  versionKey: string;
  semver: string;
  metadata?: AiWorkflowMetadata;
};

export type UpdateAiWorkflowVersionStatusInput = {
  versionId: string;
  status: AiWorkflowVersionStatus;
};

export type AiWorkflowStep = {
  id: string;
  workflowId: string;
  versionId: string;
  stepKey: string;
  kind: AiWorkflowStepKind;
  order: number;
  promptKeyRef: string;
  detail: string;
  metadata: AiWorkflowMetadata;
  createdAt: string;
};

export type RegisterAiWorkflowStepInput = {
  id?: string;
  workflowId: string;
  versionId: string;
  stepKey: string;
  kind: AiWorkflowStepKind;
  order: number;
  promptKeyRef: string;
  metadata?: AiWorkflowMetadata;
};

export type AiWorkflowReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiWorkflowReadinessResult = {
  verdict: AiWorkflowReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiWorkflowReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiWorkflowEngineManifest = {
  engineId: typeof PRODUCT_AI_WORKFLOW_ENGINE_ID;
  version: typeof PRODUCT_AI_WORKFLOW_ENGINE_VERSION;
  freezeVersion: typeof PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION;
  base: typeof PRODUCT_AI_WORKFLOW_ENGINE_BASE;
  workflowCount: number;
  versionCount: number;
  stepCount: number;
  checksum: string;
  createdAt: string;
};
