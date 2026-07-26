/**
 * Product API Audit — Event types
 */

import type {
  API_AUDIT_CATEGORIES,
  API_AUDIT_SEVERITIES,
} from "../management/management.constants";

export type ApiAuditCategory = (typeof API_AUDIT_CATEGORIES)[number];
export type ApiAuditSeverity = (typeof API_AUDIT_SEVERITIES)[number];
export type EventMetadata = Record<string, unknown>;

export type ApiAuditEvent = {
  id: string;
  eventKey: string;
  category: ApiAuditCategory;
  severity: ApiAuditSeverity;
  subjectKey: string;
  governanceKeyRef: string;
  detail: string;
  metadata: EventMetadata;
  createdAt: string;
};

export type RecordApiAuditEventInput = {
  id?: string;
  eventKey: string;
  category: ApiAuditCategory;
  severity: ApiAuditSeverity;
  subjectKey: string;
  governanceKeyRef: string;
  detail: string;
  metadata?: EventMetadata;
};
