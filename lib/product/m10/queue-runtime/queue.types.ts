/**
 * Product M10 — AI Queue Runtime shared types
 */

import type {
  AI_QUEUE_BINDING_STATUSES,
  AI_QUEUE_CHANNEL_STATUSES,
  AI_QUEUE_KINDS,
  AI_QUEUE_READINESS_VERDICTS,
  AI_QUEUE_STATUSES,
  PRODUCT_AI_QUEUE_RUNTIME_BASE,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_QUEUE_RUNTIME_ID,
  PRODUCT_AI_QUEUE_RUNTIME_VERSION,
} from "./queue.constants";

export type AiQueueKind = (typeof AI_QUEUE_KINDS)[number];
export type AiQueueStatus = (typeof AI_QUEUE_STATUSES)[number];
export type AiQueueChannelStatus =
  (typeof AI_QUEUE_CHANNEL_STATUSES)[number];
export type AiQueueBindingStatus =
  (typeof AI_QUEUE_BINDING_STATUSES)[number];
export type AiQueueReadinessVerdict =
  (typeof AI_QUEUE_READINESS_VERDICTS)[number];
export type AiQueueMetadata = Record<string, unknown>;

export type AiQueueDefinition = {
  id: string;
  queueKey: string;
  kind: AiQueueKind;
  status: AiQueueStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: AiQueueMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiQueueInput = {
  id?: string;
  queueKey: string;
  kind: AiQueueKind;
  title: string;
  summary: string;
  metadata?: AiQueueMetadata;
};

export type UpdateAiQueueStatusInput = {
  queueId: string;
  status: AiQueueStatus;
};

export type AiQueueChannel = {
  id: string;
  queueId: string;
  channelKey: string;
  status: AiQueueChannelStatus;
  summary: string;
  detail: string;
  metadata: AiQueueMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiQueueChannelInput = {
  id?: string;
  queueId: string;
  channelKey: string;
  summary: string;
  metadata?: AiQueueMetadata;
};

export type UpdateAiQueueChannelStatusInput = {
  channelId: string;
  status: AiQueueChannelStatus;
};

export type AiQueueJobBinding = {
  id: string;
  queueId: string;
  channelId: string;
  bindingKey: string;
  jobKeyRef: string;
  status: AiQueueBindingStatus;
  detail: string;
  metadata: AiQueueMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAiQueueJobInput = {
  id?: string;
  queueId: string;
  channelId: string;
  bindingKey: string;
  jobKeyRef: string;
  metadata?: AiQueueMetadata;
};

export type AiQueueReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiQueueReadinessResult = {
  verdict: AiQueueReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiQueueReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiQueueRuntimeManifest = {
  queueRuntimeId: typeof PRODUCT_AI_QUEUE_RUNTIME_ID;
  version: typeof PRODUCT_AI_QUEUE_RUNTIME_VERSION;
  freezeVersion: typeof PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION;
  base: typeof PRODUCT_AI_QUEUE_RUNTIME_BASE;
  queueCount: number;
  channelCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
