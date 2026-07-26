/**
 * Product M09 — AI Foundation shared types
 */

import type {
  AI_CAPABILITY_KINDS,
  AI_CAPABILITY_STATUSES,
  AI_DOMAIN_SCOPES,
  AI_READINESS_VERDICTS,
  PRODUCT_AI_FOUNDATION_BASE,
  PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_FOUNDATION_ID,
  PRODUCT_AI_FOUNDATION_VERSION,
} from "./ai.constants";

export type AiCapabilityKind = (typeof AI_CAPABILITY_KINDS)[number];
export type AiCapabilityStatus = (typeof AI_CAPABILITY_STATUSES)[number];
export type AiDomainScope = (typeof AI_DOMAIN_SCOPES)[number];
export type AiReadinessVerdict = (typeof AI_READINESS_VERDICTS)[number];
export type AiMetadata = Record<string, unknown>;

export type AiCapability = {
  id: string;
  capabilityKey: string;
  kind: AiCapabilityKind;
  status: AiCapabilityStatus;
  scope: AiDomainScope;
  summary: string;
  marketplaceBaselineRef: string;
  detail: string;
  metadata: AiMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiCapabilityInput = {
  id?: string;
  capabilityKey: string;
  kind: AiCapabilityKind;
  scope: AiDomainScope;
  summary: string;
  marketplaceBaselineRef?: string;
  metadata?: AiMetadata;
};

export type UpdateAiCapabilityStatusInput = {
  capabilityId: string;
  status: AiCapabilityStatus;
};

export type AiReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiReadinessResult = {
  verdict: AiReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiFoundationManifest = {
  foundationId: typeof PRODUCT_AI_FOUNDATION_ID;
  version: typeof PRODUCT_AI_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_AI_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_AI_FOUNDATION_BASE;
  capabilityCount: number;
  declaredCount: number;
  checksum: string;
  createdAt: string;
};
