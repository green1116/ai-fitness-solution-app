/**
 * Product Notification Audit — Event types
 */

import type {
  NOTIFICATION_AUDIT_CATEGORIES,
  NOTIFICATION_AUDIT_SEVERITIES,
} from "../management/management.constants";

export type NotificationAuditCategory =
  (typeof NOTIFICATION_AUDIT_CATEGORIES)[number];
export type NotificationAuditSeverity =
  (typeof NOTIFICATION_AUDIT_SEVERITIES)[number];
export type EventMetadata = Record<string, unknown>;

export type NotificationAuditEvent = {
  id: string;
  eventKey: string;
  category: NotificationAuditCategory;
  severity: NotificationAuditSeverity;
  subjectKey: string;
  detail: string;
  metadata: EventMetadata;
  createdAt: string;
};

export type RecordNotificationAuditEventInput = {
  id?: string;
  eventKey: string;
  category: NotificationAuditCategory;
  severity: NotificationAuditSeverity;
  subjectKey: string;
  detail: string;
  metadata?: EventMetadata;
};
