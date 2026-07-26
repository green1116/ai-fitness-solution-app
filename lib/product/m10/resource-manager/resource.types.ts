/**
 * Product M10 — AI Resource Manager shared types
 */

import type {
  AI_RESOURCE_BINDING_STATUSES,
  AI_RESOURCE_KINDS,
  AI_RESOURCE_QUOTA_STATUSES,
  AI_RESOURCE_READINESS_VERDICTS,
  AI_RESOURCE_STATUSES,
  PRODUCT_AI_RESOURCE_MANAGER_BASE,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
  PRODUCT_AI_RESOURCE_MANAGER_ID,
  PRODUCT_AI_RESOURCE_MANAGER_VERSION,
} from "./resource.constants";

export type AiResourceKind = (typeof AI_RESOURCE_KINDS)[number];
export type AiResourceStatus = (typeof AI_RESOURCE_STATUSES)[number];
export type AiResourceQuotaStatus =
  (typeof AI_RESOURCE_QUOTA_STATUSES)[number];
export type AiResourceBindingStatus =
  (typeof AI_RESOURCE_BINDING_STATUSES)[number];
export type AiResourceReadinessVerdict =
  (typeof AI_RESOURCE_READINESS_VERDICTS)[number];
export type AiResourceMetadata = Record<string, unknown>;

export type AiResourceDefinition = {
  id: string;
  resourceKey: string;
  kind: AiResourceKind;
  status: AiResourceStatus;
  title: string;
  unit: string;
  summary: string;
  detail: string;
  metadata: AiResourceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiResourceInput = {
  id?: string;
  resourceKey: string;
  kind: AiResourceKind;
  title: string;
  unit: string;
  summary: string;
  metadata?: AiResourceMetadata;
};

export type UpdateAiResourceStatusInput = {
  resourceId: string;
  status: AiResourceStatus;
};

export type AiResourceQuota = {
  id: string;
  resourceId: string;
  quotaKey: string;
  limit: number;
  status: AiResourceQuotaStatus;
  summary: string;
  detail: string;
  metadata: AiResourceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiResourceQuotaInput = {
  id?: string;
  resourceId: string;
  quotaKey: string;
  limit: number;
  summary: string;
  metadata?: AiResourceMetadata;
};

export type UpdateAiResourceQuotaStatusInput = {
  quotaId: string;
  status: AiResourceQuotaStatus;
};

export type AiResourceScheduleBinding = {
  id: string;
  resourceId: string;
  quotaId: string;
  bindingKey: string;
  scheduleKeyRef: string;
  status: AiResourceBindingStatus;
  detail: string;
  metadata: AiResourceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAiResourceScheduleInput = {
  id?: string;
  resourceId: string;
  quotaId: string;
  bindingKey: string;
  scheduleKeyRef: string;
  metadata?: AiResourceMetadata;
};

export type AiResourceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiResourceReadinessResult = {
  verdict: AiResourceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiResourceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiResourceManagerManifest = {
  resourceManagerId: typeof PRODUCT_AI_RESOURCE_MANAGER_ID;
  version: typeof PRODUCT_AI_RESOURCE_MANAGER_VERSION;
  freezeVersion: typeof PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION;
  base: typeof PRODUCT_AI_RESOURCE_MANAGER_BASE;
  resourceCount: number;
  quotaCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
