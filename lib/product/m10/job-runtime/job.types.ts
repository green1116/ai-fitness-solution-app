/**
 * Product M10 — AI Job Runtime shared types
 */

import type {
  AI_JOB_BINDING_STATUSES,
  AI_JOB_KINDS,
  AI_JOB_READINESS_VERDICTS,
  AI_JOB_STATUSES,
  AI_JOB_STEP_STATUSES,
  PRODUCT_AI_JOB_RUNTIME_BASE,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_JOB_RUNTIME_ID,
  PRODUCT_AI_JOB_RUNTIME_VERSION,
} from "./job.constants";

export type AiJobKind = (typeof AI_JOB_KINDS)[number];
export type AiJobStatus = (typeof AI_JOB_STATUSES)[number];
export type AiJobStepStatus = (typeof AI_JOB_STEP_STATUSES)[number];
export type AiJobBindingStatus = (typeof AI_JOB_BINDING_STATUSES)[number];
export type AiJobReadinessVerdict =
  (typeof AI_JOB_READINESS_VERDICTS)[number];
export type AiJobMetadata = Record<string, unknown>;

export type AiJobDefinition = {
  id: string;
  jobKey: string;
  kind: AiJobKind;
  status: AiJobStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: AiJobMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiJobInput = {
  id?: string;
  jobKey: string;
  kind: AiJobKind;
  title: string;
  summary: string;
  metadata?: AiJobMetadata;
};

export type UpdateAiJobStatusInput = {
  jobId: string;
  status: AiJobStatus;
};

export type AiJobStep = {
  id: string;
  jobId: string;
  stepKey: string;
  sequence: number;
  status: AiJobStepStatus;
  summary: string;
  detail: string;
  metadata: AiJobMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiJobStepInput = {
  id?: string;
  jobId: string;
  stepKey: string;
  sequence: number;
  summary: string;
  metadata?: AiJobMetadata;
};

export type UpdateAiJobStepStatusInput = {
  stepId: string;
  status: AiJobStepStatus;
};

export type AiJobCapabilityBinding = {
  id: string;
  jobId: string;
  stepId: string;
  bindingKey: string;
  capabilityKeyRef: string;
  status: AiJobBindingStatus;
  detail: string;
  metadata: AiJobMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAiJobCapabilityInput = {
  id?: string;
  jobId: string;
  stepId: string;
  bindingKey: string;
  capabilityKeyRef: string;
  metadata?: AiJobMetadata;
};

export type AiJobReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiJobReadinessResult = {
  verdict: AiJobReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiJobReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiJobRuntimeManifest = {
  jobRuntimeId: typeof PRODUCT_AI_JOB_RUNTIME_ID;
  version: typeof PRODUCT_AI_JOB_RUNTIME_VERSION;
  freezeVersion: typeof PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION;
  base: typeof PRODUCT_AI_JOB_RUNTIME_BASE;
  jobCount: number;
  stepCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
