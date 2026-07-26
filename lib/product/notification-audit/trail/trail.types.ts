/**
 * Product Notification Audit — Trail types
 */

import type { NOTIFICATION_AUDIT_TRAIL_STATUSES } from "../management/management.constants";

export type NotificationAuditTrailStatus =
  (typeof NOTIFICATION_AUDIT_TRAIL_STATUSES)[number];
export type TrailMetadata = Record<string, unknown>;

export type NotificationAuditTrail = {
  id: string;
  eventId: string;
  status: NotificationAuditTrailStatus;
  sequence: number;
  detail: string;
  metadata: TrailMetadata;
  createdAt: string;
  updatedAt: string;
};

export type AppendNotificationAuditTrailInput = {
  id?: string;
  eventId: string;
  sequence: number;
  metadata?: TrailMetadata;
};

export type SealNotificationAuditTrailInput = {
  trailId: string;
};
