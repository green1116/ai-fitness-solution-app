/**
 * Product M10 — AI Queue channel registry (definition only)
 */

import { AI_QUEUE_CHANNEL_STATUSES } from "./queue.constants";
import { getAiQueue } from "./queue.registry";
import type {
  AiQueueChannel,
  AiQueueChannelStatus,
  RegisterAiQueueChannelInput,
  UpdateAiQueueChannelStatusInput,
} from "./queue.types";

const channels = new Map<string, AiQueueChannel>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneChannel(channel: AiQueueChannel): AiQueueChannel {
  return { ...channel, metadata: { ...channel.metadata } };
}

export function registerAiQueueChannel(
  input: RegisterAiQueueChannelInput,
): AiQueueChannel {
  const queueId = input.queueId.trim();
  const channelKey = input.channelKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!queueId) throw new Error("channel.queueId is required");
  if (!channelKey) throw new Error("channel.channelKey is required");
  if (!summary) throw new Error("channel.summary is required");

  const queue = getAiQueue(queueId);
  if (!queue) throw new Error(`queue not found: ${queueId}`);
  if (queue.status !== "ACTIVE" && queue.status !== "DRAFT") {
    throw new Error(`queue not editable: ${queueId}`);
  }

  const duplicate = [...channels.values()].find(
    (c) => c.queueId === queueId && c.channelKey === channelKey,
  );
  if (duplicate) {
    throw new Error(`channelKey already exists: ${channelKey}`);
  }

  const id = input.id?.trim() || createId("aiqchan");
  if (channels.has(id)) throw new Error(`channel already exists: ${id}`);

  const now = nowIso();
  const channel: AiQueueChannel = {
    id,
    queueId,
    channelKey,
    status: AI_QUEUE_CHANNEL_STATUSES[0],
    summary,
    detail: `status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  channels.set(id, channel);
  return cloneChannel(channel);
}

export function updateAiQueueChannelStatus(
  input: UpdateAiQueueChannelStatusInput,
): AiQueueChannel {
  const channelId = input.channelId.trim();
  if (!channelId) throw new Error("channel.channelId is required");
  if (
    !(AI_QUEUE_CHANNEL_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid channel status: ${input.status}`);
  }

  const existing = channels.get(channelId);
  if (!existing) throw new Error(`channel not found: ${channelId}`);

  const updated: AiQueueChannel = {
    ...existing,
    status: input.status,
    detail: `status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  channels.set(channelId, updated);
  return cloneChannel(updated);
}

export function getAiQueueChannel(id: string): AiQueueChannel | undefined {
  const channel = channels.get(id.trim());
  return channel ? cloneChannel(channel) : undefined;
}

export function listAiQueueChannels(filter?: {
  queueId?: string;
  status?: AiQueueChannelStatus;
}): AiQueueChannel[] {
  let result = [...channels.values()];
  if (filter?.queueId) {
    const queueId = filter.queueId.trim();
    result = result.filter((c) => c.queueId === queueId);
  }
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.channelKey.localeCompare(b.channelKey))
    .map(cloneChannel);
}

export function clearAiQueueChannels(): void {
  channels.clear();
}
