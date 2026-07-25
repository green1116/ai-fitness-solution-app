/**
 * Product P7 — Notification types
 */

import type { NOTIFICATION_CHANNELS } from "../collaboration/collaboration.constants";

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
export type NotificationMetadata = Record<string, unknown>;

export type CollaborationNotification = {
  id: string;
  collaborationId: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
  delivered: boolean;
  detail: string;
  metadata: NotificationMetadata;
  createdAt: string;
};

export type CreateNotificationInput = {
  id?: string;
  collaborationId: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
  metadata?: NotificationMetadata;
};
