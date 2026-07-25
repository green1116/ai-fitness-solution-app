/**
 * Product Notification — Message types
 */

import type { NOTIFICATION_MESSAGE_PRIORITIES } from "../foundation/foundation.constants";

export type NotificationMessagePriority =
  (typeof NOTIFICATION_MESSAGE_PRIORITIES)[number];
export type MessageMetadata = Record<string, unknown>;

export type NotificationMessage = {
  id: string;
  templateId: string;
  recipient: string;
  priority: NotificationMessagePriority;
  payload: string;
  detail: string;
  metadata: MessageMetadata;
  composedAt: string;
};

export type ComposeNotificationMessageInput = {
  id?: string;
  templateId: string;
  recipient: string;
  priority?: NotificationMessagePriority;
  payload?: string;
  metadata?: MessageMetadata;
};
