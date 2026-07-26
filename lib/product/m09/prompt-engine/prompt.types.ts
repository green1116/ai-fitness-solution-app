/**
 * Product M09 — AI Prompt Engine shared types
 */

import type {
  AI_PROMPT_BINDING_STATUSES,
  AI_PROMPT_KINDS,
  AI_PROMPT_READINESS_VERDICTS,
  AI_PROMPT_STATUSES,
  AI_PROMPT_VERSION_STATUSES,
  PRODUCT_AI_PROMPT_ENGINE_BASE,
  PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_PROMPT_ENGINE_ID,
  PRODUCT_AI_PROMPT_ENGINE_VERSION,
} from "./prompt.constants";

export type AiPromptKind = (typeof AI_PROMPT_KINDS)[number];
export type AiPromptStatus = (typeof AI_PROMPT_STATUSES)[number];
export type AiPromptVersionStatus =
  (typeof AI_PROMPT_VERSION_STATUSES)[number];
export type AiPromptBindingStatus =
  (typeof AI_PROMPT_BINDING_STATUSES)[number];
export type AiPromptReadinessVerdict =
  (typeof AI_PROMPT_READINESS_VERDICTS)[number];
export type AiPromptMetadata = Record<string, unknown>;

export type ProductAiPrompt = {
  id: string;
  promptKey: string;
  name: string;
  kind: AiPromptKind;
  status: AiPromptStatus;
  summary: string;
  detail: string;
  metadata: AiPromptMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiPromptInput = {
  id?: string;
  promptKey: string;
  name: string;
  kind: AiPromptKind;
  summary: string;
  metadata?: AiPromptMetadata;
};

export type UpdateAiPromptStatusInput = {
  promptId: string;
  status: AiPromptStatus;
};

export type AiPromptVersion = {
  id: string;
  promptId: string;
  versionKey: string;
  semver: string;
  bodyRef: string;
  variableSchemaRef: string;
  status: AiPromptVersionStatus;
  detail: string;
  metadata: AiPromptMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiPromptVersionInput = {
  id?: string;
  promptId: string;
  versionKey: string;
  semver: string;
  bodyRef: string;
  variableSchemaRef: string;
  metadata?: AiPromptMetadata;
};

export type UpdateAiPromptVersionStatusInput = {
  versionId: string;
  status: AiPromptVersionStatus;
};

export type AiPromptModelBinding = {
  id: string;
  promptId: string;
  versionId: string;
  bindingKey: string;
  modelKeyRef: string;
  status: AiPromptBindingStatus;
  detail: string;
  metadata: AiPromptMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAiPromptModelInput = {
  id?: string;
  promptId: string;
  versionId: string;
  bindingKey: string;
  modelKeyRef: string;
  metadata?: AiPromptMetadata;
};

export type AiPromptReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiPromptReadinessResult = {
  verdict: AiPromptReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiPromptReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiPromptEngineManifest = {
  engineId: typeof PRODUCT_AI_PROMPT_ENGINE_ID;
  version: typeof PRODUCT_AI_PROMPT_ENGINE_VERSION;
  freezeVersion: typeof PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION;
  base: typeof PRODUCT_AI_PROMPT_ENGINE_BASE;
  promptCount: number;
  versionCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
