/**
 * Product Notification Template — Variant types
 */

import type { NOTIFICATION_TEMPLATE_LOCALES } from "../management/management.constants";

export type NotificationTemplateLocale =
  (typeof NOTIFICATION_TEMPLATE_LOCALES)[number];
export type VariantMetadata = Record<string, unknown>;

export type NotificationTemplateVariant = {
  id: string;
  templateId: string;
  locale: NotificationTemplateLocale;
  subject: string;
  body: string;
  detail: string;
  metadata: VariantMetadata;
  createdAt: string;
};

export type RegisterNotificationTemplateVariantInput = {
  id?: string;
  templateId: string;
  locale: NotificationTemplateLocale;
  subject: string;
  body: string;
  metadata?: VariantMetadata;
};
