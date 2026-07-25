/**
 * Product P7 — Notification registry
 */

import { NOTIFICATION_CHANNELS } from "../collaboration/collaboration.constants";
import { getCollaboration } from "../collaboration/collaboration.registry";
import type {
  CollaborationNotification,
  CreateNotificationInput,
  NotificationChannel,
} from "./notification.types";

const notifications = new Map<string, CollaborationNotification>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneNotification(
  notification: CollaborationNotification,
): CollaborationNotification {
  return { ...notification, metadata: { ...notification.metadata } };
}

export function createNotification(
  input: CreateNotificationInput,
): CollaborationNotification {
  const collaborationId = input.collaborationId.trim();
  const recipient = input.recipient.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!collaborationId) {
    throw new Error("notification.collaborationId is required");
  }
  if (!recipient) throw new Error("notification.recipient is required");
  if (!subject) throw new Error("notification.subject is required");
  if (!body) throw new Error("notification.body is required");
  if (!(NOTIFICATION_CHANNELS as readonly string[]).includes(input.channel)) {
    throw new Error(`invalid notification channel: ${input.channel}`);
  }
  if (!getCollaboration(collaborationId)) {
    throw new Error(`collaboration not found: ${collaborationId}`);
  }

  const id = input.id?.trim() || createId("p7ntf");
  if (notifications.has(id)) {
    throw new Error(`notification already exists: ${id}`);
  }

  const notification: CollaborationNotification = {
    id,
    collaborationId,
    channel: input.channel,
    recipient,
    subject,
    body,
    delivered: true,
    detail: `channel=${input.channel} recipient=${recipient}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  notifications.set(id, notification);
  return cloneNotification(notification);
}

export function getNotification(
  id: string,
): CollaborationNotification | undefined {
  const notification = notifications.get(id.trim());
  return notification ? cloneNotification(notification) : undefined;
}

export function listNotifications(filter?: {
  collaborationId?: string;
  channel?: NotificationChannel;
}): CollaborationNotification[] {
  let result = [...notifications.values()];
  if (filter?.collaborationId) {
    const cid = filter.collaborationId.trim();
    result = result.filter((n) => n.collaborationId === cid);
  }
  if (filter?.channel) {
    result = result.filter((n) => n.channel === filter.channel);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneNotification);
}

export function clearNotifications(): void {
  notifications.clear();
}
