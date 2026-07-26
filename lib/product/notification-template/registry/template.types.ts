/**
 * Product Notification Template — Template registry types
 */

import type { NOTIFICATION_TEMPLATE_KINDS } from "../management/management.constants";

export type NotificationTemplateKind =
  (typeof NOTIFICATION_TEMPLATE_KINDS)[number];
export type TemplateMetadata = Record<string, unknown>;

export type NotificationTemplate = {
  id: string;
  templateKey: string;
  name: string;
  kind: NotificationTemplateKind;
  detail: string;
  metadata: TemplateMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterNotificationTemplateInput = {
  id?: string;
  templateKey: string;
  name: string;
  kind: NotificationTemplateKind;
  metadata?: TemplateMetadata;
};
