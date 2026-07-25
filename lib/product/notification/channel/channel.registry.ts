/**
 * Product Notification — Channel registry
 */

import {
  NOTIFICATION_CHANNEL_KINDS,
  NOTIFICATION_CHANNEL_STATUSES,
} from "../foundation/foundation.constants";
import type {
  NotificationChannel,
  NotificationChannelKind,
  NotificationChannelStatus,
  RegisterNotificationChannelInput,
  UpdateNotificationChannelStatusInput,
} from "./channel.types";

const channels = new Map<string, NotificationChannel>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneChannel(channel: NotificationChannel): NotificationChannel {
  return { ...channel, metadata: { ...channel.metadata } };
}

export function registerNotificationChannel(
  input: RegisterNotificationChannelInput,
): NotificationChannel {
  const code = input.code.trim().toUpperCase();
  if (!code) throw new Error("channel.code is required");
  if (!(NOTIFICATION_CHANNEL_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid channel kind: ${input.kind}`);
  }

  const duplicate = [...channels.values()].find((c) => c.code === code);
  if (duplicate) throw new Error(`channel code already exists: ${code}`);

  const id = input.id?.trim() || createId("ntfchn");
  if (channels.has(id)) throw new Error(`channel already exists: ${id}`);

  const now = nowIso();
  const channel: NotificationChannel = {
    id,
    code,
    kind: input.kind,
    status: NOTIFICATION_CHANNEL_STATUSES[0],
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  channels.set(id, channel);
  return cloneChannel(channel);
}

export function updateNotificationChannelStatus(
  input: UpdateNotificationChannelStatusInput,
): NotificationChannel {
  const channelId = input.channelId.trim();
  if (!channelId) throw new Error("channel.channelId is required");
  if (
    !(NOTIFICATION_CHANNEL_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid channel status: ${input.status}`);
  }

  const existing = channels.get(channelId);
  if (!existing) throw new Error(`channel not found: ${channelId}`);

  const updated: NotificationChannel = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  channels.set(channelId, updated);
  return cloneChannel(updated);
}

export function getNotificationChannel(
  id: string,
): NotificationChannel | undefined {
  const channel = channels.get(id.trim());
  return channel ? cloneChannel(channel) : undefined;
}

export function listNotificationChannels(filter?: {
  kind?: NotificationChannelKind;
  status?: NotificationChannelStatus;
}): NotificationChannel[] {
  let result = [...channels.values()];
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneChannel);
}

export function clearNotificationChannels(): void {
  channels.clear();
}
