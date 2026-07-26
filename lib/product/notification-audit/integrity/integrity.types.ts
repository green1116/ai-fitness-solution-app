/**
 * Product Notification Audit — Integrity types
 */

import type { NOTIFICATION_AUDIT_INTEGRITY_VERDICTS } from "../management/management.constants";

export type NotificationAuditIntegrityVerdict =
  (typeof NOTIFICATION_AUDIT_INTEGRITY_VERDICTS)[number];
export type IntegrityMetadata = Record<string, unknown>;

export type NotificationAuditIntegrity = {
  id: string;
  trailId: string;
  checksum: string;
  verdict: NotificationAuditIntegrityVerdict;
  detail: string;
  metadata: IntegrityMetadata;
  createdAt: string;
};

export type SealNotificationAuditIntegrityInput = {
  id?: string;
  trailId: string;
  metadata?: IntegrityMetadata;
};
