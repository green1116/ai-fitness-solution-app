/**
 * Product Admin Audit — Event types
 */

import type {
  ADMIN_AUDIT_CATEGORIES,
  ADMIN_AUDIT_SEVERITIES,
} from "../traceability/traceability.constants";

export type AdminAuditCategory = (typeof ADMIN_AUDIT_CATEGORIES)[number];
export type AdminAuditSeverity = (typeof ADMIN_AUDIT_SEVERITIES)[number];
export type EventMetadata = Record<string, unknown>;

export type AdminAuditEvent = {
  id: string;
  category: AdminAuditCategory;
  severity: AdminAuditSeverity;
  subjectId: string;
  action: string;
  resource: string;
  detail: string;
  metadata: EventMetadata;
  recordedAt: string;
};

export type RecordAdminAuditEventInput = {
  id?: string;
  category: AdminAuditCategory;
  severity?: AdminAuditSeverity;
  subjectId: string;
  action: string;
  resource: string;
  metadata?: EventMetadata;
};
