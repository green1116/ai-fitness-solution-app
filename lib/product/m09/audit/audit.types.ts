/**
 * Product M09 — AI Audit shared types
 */

import type {
  AI_AUDIT_EVENT_KINDS,
  AI_AUDIT_INTEGRITY_RESULTS,
  AI_AUDIT_READINESS_VERDICTS,
  AI_AUDIT_SEVERITIES,
  AI_AUDIT_TRAIL_STATUSES,
  PRODUCT_AI_AUDIT_BASE,
  PRODUCT_AI_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_AUDIT_ID,
  PRODUCT_AI_AUDIT_VERSION,
} from "./audit.constants";

export type AiAuditEventKind = (typeof AI_AUDIT_EVENT_KINDS)[number];
export type AiAuditSeverity = (typeof AI_AUDIT_SEVERITIES)[number];
export type AiAuditTrailStatus = (typeof AI_AUDIT_TRAIL_STATUSES)[number];
export type AiAuditIntegrityResult =
  (typeof AI_AUDIT_INTEGRITY_RESULTS)[number];
export type AiAuditReadinessVerdict =
  (typeof AI_AUDIT_READINESS_VERDICTS)[number];
export type AiAuditMetadata = Record<string, unknown>;

export type AiAuditEvent = {
  id: string;
  eventKey: string;
  kind: AiAuditEventKind;
  severity: AiAuditSeverity;
  policyKeyRef: string;
  subjectRef: string;
  detail: string;
  metadata: AiAuditMetadata;
  recordedAt: string;
};

export type RecordAiAuditEventInput = {
  id?: string;
  eventKey: string;
  kind: AiAuditEventKind;
  severity?: AiAuditSeverity;
  policyKeyRef: string;
  subjectRef: string;
  metadata?: AiAuditMetadata;
};

export type AiAuditTrail = {
  id: string;
  eventId: string;
  sequence: number;
  status: AiAuditTrailStatus;
  detail: string;
  metadata: AiAuditMetadata;
  appendedAt: string;
};

export type AppendAiAuditTrailInput = {
  id?: string;
  eventId: string;
  metadata?: AiAuditMetadata;
};

export type MarkAiAuditTrailStatusInput = {
  trailId: string;
  status: "SEALED" | "EXPORTED";
};

export type AiAuditSeal = {
  id: string;
  trailId: string;
  digest: string;
  result: AiAuditIntegrityResult;
  detail: string;
  metadata: AiAuditMetadata;
  sealedAt: string;
};

export type SealAiAuditTrailInput = {
  id?: string;
  trailId: string;
  metadata?: AiAuditMetadata;
};

export type VerifyAiAuditSealInput = {
  sealId: string;
  expectedDigest?: string;
};

export type AiAuditQuery = {
  id: string;
  queryKey: string;
  kind?: AiAuditEventKind;
  policyKeyRef?: string;
  matchCount: number;
  matchedEventIds: string[];
  detail: string;
  metadata: AiAuditMetadata;
  queriedAt: string;
};

export type QueryAiAuditTrailInput = {
  id?: string;
  queryKey: string;
  kind?: AiAuditEventKind;
  policyKeyRef?: string;
  metadata?: AiAuditMetadata;
};

export type AiAuditReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AiAuditReadinessResult = {
  verdict: AiAuditReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AiAuditReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AiAuditManifest = {
  auditId: typeof PRODUCT_AI_AUDIT_ID;
  version: typeof PRODUCT_AI_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_AI_AUDIT_FREEZE_VERSION;
  base: typeof PRODUCT_AI_AUDIT_BASE;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
  checksum: string;
  createdAt: string;
};
