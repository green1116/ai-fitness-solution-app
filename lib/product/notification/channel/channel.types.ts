/**
 * Product Notification — Channel types
 */

import type {
  NOTIFICATION_CHANNEL_KINDS,
  NOTIFICATION_CHANNEL_STATUSES,
} from "../foundation/foundation.constants";

export type NotificationChannelKind =
  (typeof NOTIFICATION_CHANNEL_KINDS)[number];
export type NotificationChannelStatus =
  (typeof NOTIFICATION_CHANNEL_STATUSES)[number];
export type ChannelMetadata = Record<string, unknown>;

export type NotificationChannel = {
  id: string;
  code: string;
  kind: NotificationChannelKind;
  status: NotificationChannelStatus;
  detail: string;
  metadata: ChannelMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterNotificationChannelInput = {
  id?: string;
  code: string;
  kind: NotificationChannelKind;
  metadata?: ChannelMetadata;
};

export type UpdateNotificationChannelStatusInput = {
  channelId: string;
  status: NotificationChannelStatus;
};
