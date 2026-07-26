/**
 * Product Notification Template — readiness / manifest types
 */

import type {
  NOTIFICATION_TEMPLATE_MANAGER_STATUSES,
  NOTIFICATION_TEMPLATE_READINESS_VERDICTS,
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
} from "./management.constants";

export type NotificationTemplateReadinessVerdict =
  (typeof NOTIFICATION_TEMPLATE_READINESS_VERDICTS)[number];
export type NotificationTemplateManagerStatus =
  (typeof NOTIFICATION_TEMPLATE_MANAGER_STATUSES)[number];

export type NotificationTemplateReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type NotificationTemplateReadinessResult = {
  verdict: NotificationTemplateReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: NotificationTemplateReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type NotificationTemplateRegistryManifest = {
  managementId: typeof PRODUCT_TEMPLATE_MANAGEMENT_ID;
  version: typeof PRODUCT_TEMPLATE_MANAGEMENT_VERSION;
  freezeVersion: typeof PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION;
  base: typeof PRODUCT_TEMPLATE_MANAGEMENT_BASE;
  templateCount: number;
  variantCount: number;
  schemaCount: number;
  publicationCount: number;
  releaseCount: number;
};
