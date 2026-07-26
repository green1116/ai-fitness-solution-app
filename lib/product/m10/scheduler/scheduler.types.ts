/**
 * Product M10 — AI Scheduler shared types
 */

import type {
  AI_SCHEDULE_BINDING_STATUSES,
  AI_SCHEDULE_KINDS,
  AI_SCHEDULE_READINESS_VERDICTS,
  AI_SCHEDULE_STATUSES,
  AI_SCHEDULE_TRIGGER_STATUSES,
  PRODUCT_AI_SCHEDULER_BASE,
  PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
  PRODUCT_AI_SCHEDULER_ID,
  PRODUCT_AI_SCHEDULER_VERSION,
} from "./scheduler.constants";

export type AiScheduleKind = (typeof AI_SCHEDULE_KINDS)[number];
export type AiScheduleStatus = (typeof AI_SCHEDULE_STATUSES)[number];
export type AiScheduleTriggerStatus =
  (typeof AI_SCHEDULE_TRIGGER_STATUSES)[number];
export type AiScheduleBindingStatus =
  (typeof AI_SCHEDULE_BINDING_STATUSES)[number];
export type AiScheduleReadinessVerdict =
  (typeof AI_SCHEDULE_READINESS_VERDICTS)[number];
export type AiScheduleMetadata = Record<string, unknown>;

export type AiScheduleDefinition = {
  id: string;
  scheduleKey: string;
  kind: AiScheduleKind;
  status: AiScheduleStatus;
  title: string;
  expression: string;
  summary: string;
  detail: string;
  metadata: AiScheduleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiScheduleInput = {
  id?: string;
  scheduleKey: string;
  kind: AiScheduleKind;
  title: string;
  expression: string;
  summary: string;
  metadata?: AiScheduleMetadata;
};

export type UpdateAiScheduleStatusInput = {
  scheduleId: string;
  status: AiScheduleStatus;
};

export type AiScheduleTrigger = {
  id: string;
  scheduleId: string;
  triggerKey: string;
  status: AiScheduleTriggerStatus;
  summary: string;
  detail: string;
  metadata: AiScheduleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAiScheduleTriggerInput = {
  id?: string;
  scheduleId: string;
  triggerKey: string;
  summary: string;
  metadata?: AiScheduleMetadata;
};

export type UpdateAiScheduleTriggerStatusInput = {
  triggerId: string;
  status: AiScheduleTriggerStatus;
};

export type AiScheduleQueueBinding = {
  id: string;
  scheduleId: string;
  triggerId: string;
  bindingKey: string;
  queueKeyRef: string;
  status: AiScheduleBindingStatus;
  detail: string;
  metadata: AiScheduleMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAiScheduleQueueInput = {
  id?: string;
  scheduleId: string;
  triggerId: string;
  bindingKey: string;
  queueKeyRef: string;
  metadata?: AiScheduleMetadata;
};

export type AiScheduleReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiScheduleReadinessResult = {
  verdict: AiScheduleReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiScheduleReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiSchedulerManifest = {
  schedulerId: typeof PRODUCT_AI_SCHEDULER_ID;
  version: typeof PRODUCT_AI_SCHEDULER_VERSION;
  freezeVersion: typeof PRODUCT_AI_SCHEDULER_FREEZE_VERSION;
  base: typeof PRODUCT_AI_SCHEDULER_BASE;
  scheduleCount: number;
  triggerCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
