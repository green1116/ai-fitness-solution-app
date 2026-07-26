/**
 * Product Channel — Registry (+ channelKey)
 */

import {
  CHANNEL_KINDS,
  CHANNEL_STATUSES,
  PRODUCT_CHANNEL_MANAGEMENT_BASE,
} from "../management/management.constants";
import type {
  ChannelKind,
  ChannelStatus,
  NotificationChannel,
  RegisterChannelInput,
  UpdateChannelStatusInput,
} from "./channel.types";

const channels = new Map<string, NotificationChannel>();
const keys = new Map<string, string>();

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

export function registerChannel(
  input: RegisterChannelInput,
): NotificationChannel {
  const channelKey = input.channelKey.trim().toUpperCase();
  const name = input.name.trim();
  const templateManagementRef =
    input.templateManagementRef?.trim() || PRODUCT_CHANNEL_MANAGEMENT_BASE;
  if (!channelKey) throw new Error("channel.channelKey is required");
  if (!name) throw new Error("channel.name is required");
  if (!(CHANNEL_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid channel kind: ${input.kind}`);
  }
  if (keys.has(channelKey)) {
    throw new Error(`channelKey already exists: ${channelKey}`);
  }

  const id = input.id?.trim() || createId("chn");
  if (channels.has(id)) throw new Error(`channel already exists: ${id}`);

  const now = nowIso();
  const channel: NotificationChannel = {
    id,
    channelKey,
    name,
    kind: input.kind,
    status: CHANNEL_STATUSES[0],
    templateManagementRef,
    detail: `key=${channelKey} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  channels.set(id, channel);
  keys.set(channelKey, id);
  return cloneChannel(channel);
}

export function updateChannelStatus(
  input: UpdateChannelStatusInput,
): NotificationChannel {
  const channelId = input.channelId.trim();
  if (!channelId) throw new Error("channel.channelId is required");
  if (!(CHANNEL_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid channel status: ${input.status}`);
  }

  const existing = channels.get(channelId);
  if (!existing) throw new Error(`channel not found: ${channelId}`);

  const updated: NotificationChannel = {
    ...existing,
    status: input.status,
    detail: `key=${existing.channelKey} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  channels.set(channelId, updated);
  return cloneChannel(updated);
}

export function getChannel(id: string): NotificationChannel | undefined {
  const channel = channels.get(id.trim());
  return channel ? cloneChannel(channel) : undefined;
}

export function getChannelByKey(
  channelKey: string,
): NotificationChannel | undefined {
  const id = keys.get(channelKey.trim().toUpperCase());
  return id ? getChannel(id) : undefined;
}

export function listChannels(filter?: {
  kind?: ChannelKind;
  status?: ChannelStatus;
}): NotificationChannel[] {
  let result = [...channels.values()];
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.channelKey.localeCompare(b.channelKey))
    .map(cloneChannel);
}

export function clearChannels(): void {
  channels.clear();
  keys.clear();
}
