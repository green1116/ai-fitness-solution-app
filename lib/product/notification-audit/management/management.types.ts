/**
 * Product Notification Audit — readiness / manifest types
 */

import type {
  NOTIFICATION_AUDIT_MANAGER_STATUSES,
  NOTIFICATION_AUDIT_READINESS_VERDICTS,
  PRODUCT_NOTIFICATION_AUDIT_BASE,
  PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_AUDIT_ID,
  PRODUCT_NOTIFICATION_AUDIT_VERSION,
} from "./management.constants";

export type NotificationAuditReadinessVerdict =
  (typeof NOTIFICATION_AUDIT_READINESS_VERDICTS)[number];
export type NotificationAuditManagerStatus =
  (typeof NOTIFICATION_AUDIT_MANAGER_STATUSES)[number];

export type NotificationAuditReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type NotificationAuditReadinessResult = {
  verdict: NotificationAuditReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: NotificationAuditReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type NotificationAuditRegistryManifest = {
  auditId: typeof PRODUCT_NOTIFICATION_AUDIT_ID;
  version: typeof PRODUCT_NOTIFICATION_AUDIT_VERSION;
  freezeVersion: typeof PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION;
  base: typeof PRODUCT_NOTIFICATION_AUDIT_BASE;
  eventCount: number;
  trailCount: number;
  integrityCount: number;
  queryCount: number;
  releaseCount: number;
};
