/**
 * Product M10 — AI Runtime Audit shared types
 */

import type {
  AI_RUNTIME_AUDIT_EVENT_KINDS,
  AI_RUNTIME_AUDIT_INTEGRITY_RESULTS,
  AI_RUNTIME_AUDIT_READINESS_VERDICTS,
  AI_RUNTIME_AUDIT_SEVERITIES,
  AI_RUNTIME_AUDIT_TRAIL_STATUSES,
  PRODUCT_AI_RUNTIME_AUDIT_BASE,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_AUDIT_ID,
  PRODUCT_AI_RUNTIME_AUDIT_VERSION,
} from "./audit.constants";

export type AiRuntimeAuditEventKind =
  (typeof AI_RUNTIME_AUDIT_EVENT_KINDS)[number];
export type AiRuntimeAuditSeverity =
  (typeof AI_RUNTIME_AUDIT_SEVERITIES)[number];
export type AiRuntimeAuditTrailStatus =
  (typeof AI_RUNTIME_AUDIT_TRAIL_STATUSES)[number];
export type AiRuntimeAuditIntegrityResult =
  (typeof AI_RUNTIME_AUDIT_INTEGRITY_RESULTS)[number];
export type AiRuntimeAuditReadinessVerdict =
  (typeof AI_RUNTIME_AUDIT_READINESS_VERDICTS)[number];
export type AiRuntimeAuditMetadata = Record<string, unknown>;

export type AiRuntimeAuditEvent = {
  id: string;
  eventKey: string;
  kind: AiRuntimeAuditEventKind;
  severity: AiRuntimeAuditSeverity;
  policyKeyRef: string;
  subjectRef: string;
  detail: string;
  metadata: AiRuntimeAuditMetadata;
  recordedAt: string;
};

export type RecordAiRuntimeAuditEventInput = {
  id?: string;
  eventKey: string;
  kind: AiRuntimeAuditEventKind;
  severity?: AiRuntimeAuditSeverity;
  policyKeyRef: string;
  subjectRef: string;
  metadata?: AiRuntimeAuditMetadata;
};

export type AiRuntimeAuditTrail = {
  id: string;
  eventId: string;
  sequence: number;
  status: AiRuntimeAuditTrailStatus;
  detail: string;
  metadata: AiRuntimeAuditMetadata;
  appendedAt: string;
};

export type AppendAiRuntimeAuditTrailInput = {
  id?: string;
  eventId: string;
  metadata?: AiRuntimeAuditMetadata;
};

export type MarkAiRuntimeAuditTrailStatusInput = {
  trailId: string;
  status: "SEALED" | "EXPORTED";
};

export type AiRuntimeAuditSeal = {
  id: string;
  trailId: string;
  digest: string;
  result: AiRuntimeAuditIntegrityResult;
  detail: string;
  metadata: AiRuntimeAuditMetadata;
  sealedAt: string;
};

export type SealAiRuntimeAuditTrailInput = {
  id?: string;
  trailId: string;
  metadata?: AiRuntimeAuditMetadata;
};

export type VerifyAiRuntimeAuditSealInput = {
  sealId: string;
  expectedDigest?: string;
};

export type AiRuntimeAuditQuery = {
  id: string;
  queryKey: string;
  kind?: AiRuntimeAuditEventKind;
  policyKeyRef?: string;
  matchCount: number;
  matchedEventIds: string[];
  detail: string;
  metadata: AiRuntimeAuditMetadata;
  queriedAt: string;
};

export type QueryAiRuntimeAuditTrailInput = {
  id?: string;
  queryKey: string;
  kind?: AiRuntimeAuditEventKind;
  policyKeyRef?: string;
  metadata?: AiRuntimeAuditMetadata;
};

export type AiRuntimeAuditReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiRuntimeAuditReadinessResult = {
  verdict: AiRuntimeAuditReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiRuntimeAuditReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiRuntimeAuditManifest = {
  auditId: typeof PRODUCT_AI_RUNTIME_AUDIT_ID;
  version: typeof PRODUCT_AI_RUNTIME_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION;
  base: typeof PRODUCT_AI_RUNTIME_AUDIT_BASE;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
  checksum: string;
  createdAt: string;
};
