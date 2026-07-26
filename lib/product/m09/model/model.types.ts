/**
 * Product M09 — AI Model Registry shared types
 */

import type {
  AI_MODEL_BINDING_STATUSES,
  AI_MODEL_FAMILIES,
  AI_MODEL_READINESS_VERDICTS,
  AI_MODEL_STATUSES,
  AI_MODEL_VERSION_STATUSES,
  PRODUCT_AI_MODEL_REGISTRY_BASE,
  PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
  PRODUCT_AI_MODEL_REGISTRY_ID,
  PRODUCT_AI_MODEL_REGISTRY_VERSION,
} from "./model.constants";

export type AiModelFamily = (typeof AI_MODEL_FAMILIES)[number];
export type AiModelStatus = (typeof AI_MODEL_STATUSES)[number];
export type AiModelVersionStatus = (typeof AI_MODEL_VERSION_STATUSES)[number];
export type AiModelBindingStatus = (typeof AI_MODEL_BINDING_STATUSES)[number];
export type AiModelReadinessVerdict =
  (typeof AI_MODEL_READINESS_VERDICTS)[number];
export type AiModelMetadata = Record<string, unknown>;

export type ProductAiModel = {
  id: string;
  modelKey: string;
  name: string;
  family: AiModelFamily;
  status: AiModelStatus;
  summary: string;
  detail: string;
  metadata: AiModelMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiModelInput = {
  id?: string;
  modelKey: string;
  name: string;
  family: AiModelFamily;
  summary: string;
  metadata?: AiModelMetadata;
};

export type UpdateAiModelStatusInput = {
  modelId: string;
  status: AiModelStatus;
};

export type AiModelVersion = {
  id: string;
  modelId: string;
  versionKey: string;
  semver: string;
  status: AiModelVersionStatus;
  detail: string;
  metadata: AiModelMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiModelVersionInput = {
  id?: string;
  modelId: string;
  versionKey: string;
  semver: string;
  metadata?: AiModelMetadata;
};

export type UpdateAiModelVersionStatusInput = {
  versionId: string;
  status: AiModelVersionStatus;
};

export type AiModelCapabilityBinding = {
  id: string;
  modelId: string;
  versionId: string;
  bindingKey: string;
  capabilityKeyRef: string;
  status: AiModelBindingStatus;
  detail: string;
  metadata: AiModelMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAiModelCapabilityInput = {
  id?: string;
  modelId: string;
  versionId: string;
  bindingKey: string;
  capabilityKeyRef: string;
  metadata?: AiModelMetadata;
};

export type AiModelReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiModelReadinessResult = {
  verdict: AiModelReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiModelReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiModelRegistryManifest = {
  registryId: typeof PRODUCT_AI_MODEL_REGISTRY_ID;
  version: typeof PRODUCT_AI_MODEL_REGISTRY_VERSION;
  freezeVersion: typeof PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION;
  base: typeof PRODUCT_AI_MODEL_REGISTRY_BASE;
  modelCount: number;
  versionCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
