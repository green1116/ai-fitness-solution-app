/**
 * Commercialization P7 — Audit types
 */

import type { AUDIT_EVENT_KINDS } from "../governance/governance.constants";

export type AuditEventKind = (typeof AUDIT_EVENT_KINDS)[number];
export type AuditMetadata = Record<string, unknown>;

export type AuditRecord = {
  id: string;
  kind: AuditEventKind;
  actor: string;
  subject: string;
  message: string;
  detail: string;
  metadata: AuditMetadata;
  recordedAt: string;
};

export type RecordAuditInput = {
  id?: string;
  kind: AuditEventKind;
  actor: string;
  subject: string;
  message: string;
  metadata?: AuditMetadata;
};

export type AuditTrail = {
  id: string;
  subject: string;
  entryIds: string[];
  entryCount: number;
  detail: string;
  assembledAt: string;
};

export type AssembleAuditTrailInput = {
  id?: string;
  subject: string;
};
