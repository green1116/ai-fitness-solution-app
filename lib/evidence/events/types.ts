/**
 * V3.4-E16 Runtime Event Orchestration — 类型契约
 */

import type { RuntimeLifecycleState } from "../types/runtimeStateMachine";

export const RUNTIME_EVENT_ORCHESTRATION_VERSION = "3.4-e16" as const;

export const RUNTIME_EVENT_TYPES = [
  "OCR_COMPLETED",
  "COVERAGE_RE_EVALUATED",
  "VALIDATION_RECHECKED",
  "VALIDATION_FAILED",
  "VALIDATION_PASSED",
  "AUDIT_APPROVED",
  "AUDIT_REJECTED",
  "GOVERNANCE_ESCALATED",
  "GOVERNANCE_APPROVED",
  "GOVERNANCE_FAILED",
  "RELEASE_BLOCKED",
  "RELEASE_ENABLED",
  "EXECUTIVE_REVIEW_UNLOCKED",
  "EXECUTIVE_APPROVED",
  "EXECUTIVE_REJECTED",
  "MANIFEST_GENERATION_REQUESTED",
  "STATE_TRANSITIONED",
] as const;

export type RuntimeEventType = (typeof RUNTIME_EVENT_TYPES)[number];

export type RuntimeEventPayload = {
  jobId?: string;
  planId?: string;
  tenderId?: string;
  documentId?: string;
  traceId: string;
  correlationId: string;
  source: string;
  timestamp: string;
  currentState?: RuntimeLifecycleState;
  previousState?: RuntimeLifecycleState;
  reason?: string;
  evidenceIds?: string[];
  riskLevel?: string;
  validationSummary?: Record<string, unknown>;
  auditSummary?: Record<string, unknown>;
  policyDecision?: Record<string, unknown>;
  releaseDecision?: string;
  meta?: Record<string, unknown>;
};

export type RuntimeEvent<T extends RuntimeEventType = RuntimeEventType> = {
  id: string;
  type: T;
  payload: RuntimeEventPayload;
};

export type RuntimeEventHandlerResult = {
  handlerId: string;
  ok: boolean;
  message: string;
  emittedFollowUps?: RuntimeEventType[];
  durationMs: number;
  error?: string;
};

export type RuntimeEventDispatchRecord = {
  eventId: string;
  eventType: RuntimeEventType;
  timestamp: string;
  handlerResults: RuntimeEventHandlerResult[];
  childEventIds: string[];
};

export type RuntimeOrchestrationFlags = {
  releaseBlocked: boolean;
  releaseEnabled: boolean;
  executiveReviewUnlocked: boolean;
  manifestRequested: boolean;
  governanceEscalated: boolean;
};

export type RuntimeEventOrchestrationResult = {
  version: typeof RUNTIME_EVENT_ORCHESTRATION_VERSION;
  traceId: string;
  correlationId: string;
  eventCount: number;
  dispatchCount: number;
  flags: RuntimeOrchestrationFlags;
  records: RuntimeEventDispatchRecord[];
  log: string[];
};

export type RuntimeEventBusOptions = {
  maxDispatchDepth?: number;
  debug?: boolean;
};

export type RuntimeEventHandler = (
  event: RuntimeEvent,
  ctx: import("./context").RuntimeOrchestrationContext,
) => void | Promise<void>;
