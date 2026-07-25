/**
 * Product Audit — Event types
 */

import type {
  AUDIT_EVENT_CATEGORIES,
  AUDIT_SEVERITIES,
} from "../security/security.constants";

export type AuditEventCategory = (typeof AUDIT_EVENT_CATEGORIES)[number];
export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number];
export type EventMetadata = Record<string, unknown>;

export type AuditEvent = {
  id: string;
  category: AuditEventCategory;
  severity: AuditSeverity;
  actorId: string;
  action: string;
  resource: string;
  detail: string;
  metadata: EventMetadata;
  recordedAt: string;
};

export type RecordAuditEventInput = {
  id?: string;
  category: AuditEventCategory;
  severity?: AuditSeverity;
  actorId: string;
  action: string;
  resource: string;
  metadata?: EventMetadata;
};
