/**
 * Product Notification — readiness / manifest types
 */

import type {
  NOTIFICATION_MANAGER_STATUSES,
  NOTIFICATION_READINESS_VERDICTS,
  PRODUCT_NOTIFICATION_FOUNDATION_BASE,
  PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_FOUNDATION_ID,
  PRODUCT_NOTIFICATION_FOUNDATION_VERSION,
} from "./foundation.constants";

export type NotificationReadinessVerdict =
  (typeof NOTIFICATION_READINESS_VERDICTS)[number];
export type NotificationManagerStatus =
  (typeof NOTIFICATION_MANAGER_STATUSES)[number];

export type NotificationReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type NotificationReadinessResult = {
  verdict: NotificationReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: NotificationReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type NotificationRegistryManifest = {
  foundationId: typeof PRODUCT_NOTIFICATION_FOUNDATION_ID;
  version: typeof PRODUCT_NOTIFICATION_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_NOTIFICATION_FOUNDATION_BASE;
  channelCount: number;
  templateCount: number;
  messageCount: number;
  deliveryCount: number;
};
