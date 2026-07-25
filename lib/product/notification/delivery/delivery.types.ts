/**
 * Product Notification — Delivery types
 */

import type { NOTIFICATION_DELIVERY_STATUSES } from "../foundation/foundation.constants";

export type NotificationDeliveryStatus =
  (typeof NOTIFICATION_DELIVERY_STATUSES)[number];
export type DeliveryMetadata = Record<string, unknown>;

export type NotificationDelivery = {
  id: string;
  messageId: string;
  channelId: string;
  status: NotificationDeliveryStatus;
  detail: string;
  metadata: DeliveryMetadata;
  createdAt: string;
  updatedAt: string;
};

export type QueueNotificationDeliveryInput = {
  id?: string;
  messageId: string;
  channelId: string;
  metadata?: DeliveryMetadata;
};

export type UpdateNotificationDeliveryStatusInput = {
  deliveryId: string;
  status: NotificationDeliveryStatus;
};
