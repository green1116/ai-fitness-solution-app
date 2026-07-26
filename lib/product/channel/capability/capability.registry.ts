/**
 * Product Channel — Capability registry
 */

import { CHANNEL_CAPABILITY_FEATURES } from "../management/management.constants";
import { getChannel } from "../registry/channel.registry";
import type {
  ChannelCapability,
  ChannelCapabilityFeature,
  DeclareChannelCapabilityInput,
} from "./capability.types";

const capabilities = new Map<string, ChannelCapability>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(capability: ChannelCapability): ChannelCapability {
  return {
    ...capability,
    features: [...capability.features],
    metadata: { ...capability.metadata },
  };
}

export function declareChannelCapability(
  input: DeclareChannelCapabilityInput,
): ChannelCapability {
  const channelId = input.channelId.trim();
  if (!channelId) throw new Error("capability.channelId is required");
  if (!input.features.length) {
    throw new Error("capability.features is required");
  }
  for (const feature of input.features) {
    if (!(CHANNEL_CAPABILITY_FEATURES as readonly string[]).includes(feature)) {
      throw new Error(`invalid capability feature: ${feature}`);
    }
  }

  const channel = getChannel(channelId);
  if (!channel) throw new Error(`channel not found: ${channelId}`);
  if (channel.status !== "ACTIVE") {
    throw new Error(`channel not active: ${channelId}`);
  }

  const duplicate = [...capabilities.values()].find(
    (c) => c.channelId === channelId,
  );
  if (duplicate) throw new Error(`capability already exists: ${channelId}`);

  const id = input.id?.trim() || createId("chncap");
  if (capabilities.has(id)) throw new Error(`capability already exists: ${id}`);

  const features = [...new Set(input.features)] as ChannelCapabilityFeature[];
  const capability: ChannelCapability = {
    id,
    channelId,
    features,
    detail: `features=${features.join(",")}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  capabilities.set(id, capability);
  return cloneCapability(capability);
}

export function getChannelCapability(
  id: string,
): ChannelCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listChannelCapabilities(filter?: {
  channelId?: string;
}): ChannelCapability[] {
  let result = [...capabilities.values()];
  if (filter?.channelId) {
    const channelId = filter.channelId.trim();
    result = result.filter((c) => c.channelId === channelId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCapability);
}

export function clearChannelCapabilities(): void {
  capabilities.clear();
}
