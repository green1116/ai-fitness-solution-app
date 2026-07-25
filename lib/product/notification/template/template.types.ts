/**
 * Product Notification — Template types
 */

import type { NOTIFICATION_TEMPLATE_KINDS } from "../foundation/foundation.constants";

export type NotificationTemplateKind =
  (typeof NOTIFICATION_TEMPLATE_KINDS)[number];
export type TemplateMetadata = Record<string, unknown>;

export type NotificationTemplate = {
  id: string;
  code: string;
  channelId: string;
  kind: NotificationTemplateKind;
  subject: string;
  body: string;
  detail: string;
  metadata: TemplateMetadata;
  createdAt: string;
};

export type RegisterNotificationTemplateInput = {
  id?: string;
  code: string;
  channelId: string;
  kind: NotificationTemplateKind;
  subject: string;
  body: string;
  metadata?: TemplateMetadata;
};
