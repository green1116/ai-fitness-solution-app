/**
 * Product M09 — AI Orchestration shared types
 */

import type {
  AI_ORCHESTRATION_KINDS,
  AI_ORCHESTRATION_READINESS_VERDICTS,
  AI_ORCHESTRATION_ROUTE_KINDS,
  AI_ORCHESTRATION_STATUSES,
  AI_ORCHESTRATION_VERSION_STATUSES,
  PRODUCT_AI_ORCHESTRATION_BASE,
  PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
  PRODUCT_AI_ORCHESTRATION_ID,
  PRODUCT_AI_ORCHESTRATION_VERSION,
} from "./orchestration.constants";

export type AiOrchestrationKind = (typeof AI_ORCHESTRATION_KINDS)[number];
export type AiOrchestrationStatus =
  (typeof AI_ORCHESTRATION_STATUSES)[number];
export type AiOrchestrationVersionStatus =
  (typeof AI_ORCHESTRATION_VERSION_STATUSES)[number];
export type AiOrchestrationRouteKind =
  (typeof AI_ORCHESTRATION_ROUTE_KINDS)[number];
export type AiOrchestrationReadinessVerdict =
  (typeof AI_ORCHESTRATION_READINESS_VERDICTS)[number];
export type AiOrchestrationMetadata = Record<string, unknown>;

export type ProductAiOrchestration = {
  id: string;
  orchestrationKey: string;
  name: string;
  kind: AiOrchestrationKind;
  status: AiOrchestrationStatus;
  summary: string;
  detail: string;
  metadata: AiOrchestrationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiOrchestrationInput = {
  id?: string;
  orchestrationKey: string;
  name: string;
  kind: AiOrchestrationKind;
  summary: string;
  metadata?: AiOrchestrationMetadata;
};

export type UpdateAiOrchestrationStatusInput = {
  orchestrationId: string;
  status: AiOrchestrationStatus;
};

export type AiOrchestrationVersion = {
  id: string;
  orchestrationId: string;
  versionKey: string;
  semver: string;
  status: AiOrchestrationVersionStatus;
  detail: string;
  metadata: AiOrchestrationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiOrchestrationVersionInput = {
  id?: string;
  orchestrationId: string;
  versionKey: string;
  semver: string;
  metadata?: AiOrchestrationMetadata;
};

export type UpdateAiOrchestrationVersionStatusInput = {
  versionId: string;
  status: AiOrchestrationVersionStatus;
};

export type AiOrchestrationRoute = {
  id: string;
  orchestrationId: string;
  versionId: string;
  routeKey: string;
  kind: AiOrchestrationRouteKind;
  order: number;
  workflowKeyRef: string;
  promptKeyRef: string;
  modelKeyRef: string;
  detail: string;
  metadata: AiOrchestrationMetadata;
  createdAt: string;
};

export type RegisterAiOrchestrationRouteInput = {
  id?: string;
  orchestrationId: string;
  versionId: string;
  routeKey: string;
  kind: AiOrchestrationRouteKind;
  order: number;
  workflowKeyRef: string;
  promptKeyRef: string;
  modelKeyRef: string;
  metadata?: AiOrchestrationMetadata;
};

export type AiOrchestrationReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiOrchestrationReadinessResult = {
  verdict: AiOrchestrationReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiOrchestrationReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiOrchestrationManifest = {
  orchestrationId: typeof PRODUCT_AI_ORCHESTRATION_ID;
  version: typeof PRODUCT_AI_ORCHESTRATION_VERSION;
  freezeVersion: typeof PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION;
  base: typeof PRODUCT_AI_ORCHESTRATION_BASE;
  planCount: number;
  versionCount: number;
  routeCount: number;
  checksum: string;
  createdAt: string;
};
