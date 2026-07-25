/**
 * Product Analytics Audit — Event types
 */

import type {
  ANALYTICS_AUDIT_CATEGORIES,
  ANALYTICS_AUDIT_SEVERITIES,
} from "../traceability/traceability.constants";

export type AnalyticsAuditCategory =
  (typeof ANALYTICS_AUDIT_CATEGORIES)[number];
export type AnalyticsAuditSeverity =
  (typeof ANALYTICS_AUDIT_SEVERITIES)[number];
export type EventMetadata = Record<string, unknown>;

export type AnalyticsAuditEvent = {
  id: string;
  category: AnalyticsAuditCategory;
  severity: AnalyticsAuditSeverity;
  subjectId: string;
  action: string;
  resource: string;
  detail: string;
  metadata: EventMetadata;
  recordedAt: string;
};

export type RecordAnalyticsAuditEventInput = {
  id?: string;
  category: AnalyticsAuditCategory;
  severity?: AnalyticsAuditSeverity;
  subjectId: string;
  action: string;
  resource: string;
  metadata?: EventMetadata;
};
