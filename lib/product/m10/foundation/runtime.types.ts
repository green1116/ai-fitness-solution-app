/**
 * Product M10 — AI Runtime Foundation shared types
 */

import type {
  AI_RUNTIME_CAPABILITY_KINDS,
  AI_RUNTIME_CAPABILITY_STATUSES,
  AI_RUNTIME_DOMAIN_SCOPES,
  AI_RUNTIME_READINESS_VERDICTS,
  PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
  PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_FOUNDATION_ID,
  PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
} from "./runtime.constants";

export type AiRuntimeCapabilityKind =
  (typeof AI_RUNTIME_CAPABILITY_KINDS)[number];
export type AiRuntimeCapabilityStatus =
  (typeof AI_RUNTIME_CAPABILITY_STATUSES)[number];
export type AiRuntimeDomainScope =
  (typeof AI_RUNTIME_DOMAIN_SCOPES)[number];
export type AiRuntimeReadinessVerdict =
  (typeof AI_RUNTIME_READINESS_VERDICTS)[number];
export type AiRuntimeMetadata = Record<string, unknown>;

export type AiRuntimeCapability = {
  id: string;
  capabilityKey: string;
  kind: AiRuntimeCapabilityKind;
  status: AiRuntimeCapabilityStatus;
  scope: AiRuntimeDomainScope;
  summary: string;
  aiBaselineRef: string;
  detail: string;
  metadata: AiRuntimeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiRuntimeCapabilityInput = {
  id?: string;
  capabilityKey: string;
  kind: AiRuntimeCapabilityKind;
  scope: AiRuntimeDomainScope;
  summary: string;
  aiBaselineRef?: string;
  metadata?: AiRuntimeMetadata;
};

export type UpdateAiRuntimeCapabilityStatusInput = {
  capabilityId: string;
  status: AiRuntimeCapabilityStatus;
};

export type AiRuntimeReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiRuntimeReadinessResult = {
  verdict: AiRuntimeReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiRuntimeReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiRuntimeFoundationManifest = {
  foundationId: typeof PRODUCT_AI_RUNTIME_FOUNDATION_ID;
  version: typeof PRODUCT_AI_RUNTIME_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_AI_RUNTIME_FOUNDATION_BASE;
  capabilityCount: number;
  declaredCount: number;
  checksum: string;
  createdAt: string;
};
