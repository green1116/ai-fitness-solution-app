/**
 * Product Notification — Delivery registry
 */

import { getNotificationChannel } from "../channel/channel.registry";
import { NOTIFICATION_DELIVERY_STATUSES } from "../foundation/foundation.constants";
import { getNotificationMessage } from "../message/message.registry";
import type {
  NotificationDelivery,
  NotificationDeliveryStatus,
  QueueNotificationDeliveryInput,
  UpdateNotificationDeliveryStatusInput,
} from "./delivery.types";

const deliveries = new Map<string, NotificationDelivery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDelivery(delivery: NotificationDelivery): NotificationDelivery {
  return { ...delivery, metadata: { ...delivery.metadata } };
}

export function queueNotificationDelivery(
  input: QueueNotificationDeliveryInput,
): NotificationDelivery {
  const messageId = input.messageId.trim();
  const channelId = input.channelId.trim();
  if (!messageId) throw new Error("delivery.messageId is required");
  if (!channelId) throw new Error("delivery.channelId is required");
  if (!getNotificationMessage(messageId)) {
    throw new Error(`message not found: ${messageId}`);
  }
  const channel = getNotificationChannel(channelId);
  if (!channel) throw new Error(`channel not found: ${channelId}`);
  if (channel.status !== "ACTIVE") {
    throw new Error(`channel not active: ${channelId}`);
  }

  const id = input.id?.trim() || createId("ntfdlv");
  if (deliveries.has(id)) throw new Error(`delivery already exists: ${id}`);

  const now = nowIso();
  const delivery: NotificationDelivery = {
    id,
    messageId,
    channelId,
    status: NOTIFICATION_DELIVERY_STATUSES[0],
    detail: `status=QUEUED`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  deliveries.set(id, delivery);
  return cloneDelivery(delivery);
}

export function updateNotificationDeliveryStatus(
  input: UpdateNotificationDeliveryStatusInput,
): NotificationDelivery {
  const deliveryId = input.deliveryId.trim();
  if (!deliveryId) throw new Error("delivery.deliveryId is required");
  if (
    !(NOTIFICATION_DELIVERY_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid delivery status: ${input.status}`);
  }

  const existing = deliveries.get(deliveryId);
  if (!existing) throw new Error(`delivery not found: ${deliveryId}`);

  const updated: NotificationDelivery = {
    ...existing,
    status: input.status,
    detail: `status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  deliveries.set(deliveryId, updated);
  return cloneDelivery(updated);
}

export function getNotificationDelivery(
  id: string,
): NotificationDelivery | undefined {
  const delivery = deliveries.get(id.trim());
  return delivery ? cloneDelivery(delivery) : undefined;
}

export function listNotificationDeliveries(filter?: {
  messageId?: string;
  channelId?: string;
  status?: NotificationDeliveryStatus;
}): NotificationDelivery[] {
  let result = [...deliveries.values()];
  if (filter?.messageId) {
    const messageId = filter.messageId.trim();
    result = result.filter((d) => d.messageId === messageId);
  }
  if (filter?.channelId) {
    const channelId = filter.channelId.trim();
    result = result.filter((d) => d.channelId === channelId);
  }
  if (filter?.status) {
    result = result.filter((d) => d.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDelivery);
}

export function clearNotificationDeliveries(): void {
  deliveries.clear();
}
