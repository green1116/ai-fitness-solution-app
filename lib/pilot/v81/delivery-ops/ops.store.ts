/**
 * V81 — In-memory delivery ops tracking & notification store
 */

import { randomUUID } from "node:crypto";

import type {
  DeliveryOpsNotification,
  DeliveryOpsNotificationKind,
  DeliveryTrackingEvent,
  DeliveryTrackingEventType,
} from "./ops.types";

declare global {
  // eslint-disable-next-line no-var
  var __v81DeliveryTrackingEvents: DeliveryTrackingEvent[] | undefined;
  // eslint-disable-next-line no-var
  var __v81DeliveryOpsNotifications: DeliveryOpsNotification[] | undefined;
}

function trackingStore(): DeliveryTrackingEvent[] {
  globalThis.__v81DeliveryTrackingEvents ||= [];
  return globalThis.__v81DeliveryTrackingEvents;
}

function notificationStore(): DeliveryOpsNotification[] {
  globalThis.__v81DeliveryOpsNotifications ||= [];
  return globalThis.__v81DeliveryOpsNotifications;
}

export function appendDeliveryTrackingEvent(input: {
  sessionId: string;
  organizationId: string;
  type: DeliveryTrackingEventType;
  actorId?: string;
  artifactKind?: string;
  meta?: Record<string, unknown>;
}): DeliveryTrackingEvent {
  const event: DeliveryTrackingEvent = {
    id: randomUUID(),
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    type: input.type,
    actorId: input.actorId,
    timestamp: new Date().toISOString(),
    artifactKind: input.artifactKind,
    meta: input.meta,
  };
  trackingStore().push(event);
  return event;
}

export function listDeliveryTrackingEvents(sessionId: string): DeliveryTrackingEvent[] {
  return trackingStore().filter((e) => e.sessionId === sessionId);
}

export function listDeliveryTrackingForOrg(organizationId: string): DeliveryTrackingEvent[] {
  return trackingStore().filter((e) => e.organizationId === organizationId);
}

export function appendDeliveryOpsNotification(input: {
  sessionId: string;
  organizationId: string;
  kind: DeliveryOpsNotificationKind;
  message: string;
  readOnly?: boolean;
  meta?: Record<string, unknown>;
}): DeliveryOpsNotification {
  const existing = notificationStore().find(
    (n) => n.sessionId === input.sessionId && n.kind === input.kind,
  );
  if (existing && input.kind === "release_ready") return existing;

  const notification: DeliveryOpsNotification = {
    id: randomUUID(),
    sessionId: input.sessionId,
    organizationId: input.organizationId,
    kind: input.kind,
    message: input.message,
    timestamp: new Date().toISOString(),
    readOnly: input.readOnly ?? true,
    meta: input.meta,
  };
  notificationStore().push(notification);
  return notification;
}

export function listDeliveryOpsNotifications(organizationId: string): DeliveryOpsNotification[] {
  return notificationStore()
    .filter((n) => n.organizationId === organizationId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function clearDeliveryOpsStoreForTests(): void {
  globalThis.__v81DeliveryTrackingEvents = [];
  globalThis.__v81DeliveryOpsNotifications = [];
}
