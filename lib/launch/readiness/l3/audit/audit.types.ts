/**
 * Launch L3 — Audit types
 */

import type { AUDIT_EVENT_KINDS } from "../runtime/runtime.constants";

export type AuditEventKind = (typeof AUDIT_EVENT_KINDS)[number];
export type AuditMetadata = Record<string, unknown>;

export type AuditEvent = {
  id: string;
  runtimeId: string;
  kind: AuditEventKind;
  actor: string;
  message: string;
  detail: string;
  metadata: AuditMetadata;
  recordedAt: string;
};

export type RecordAuditEventInput = {
  id?: string;
  runtimeId: string;
  kind: AuditEventKind;
  actor: string;
  message: string;
  metadata?: AuditMetadata;
};

export type AuditTrail = {
  id: string;
  runtimeId: string;
  eventIds: string[];
  eventCount: number;
  detail: string;
  assembledAt: string;
};

export type AssembleAuditTrailInput = {
  id?: string;
  runtimeId: string;
};
