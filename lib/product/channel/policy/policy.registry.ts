/**
 * Product Channel — Policy registry
 */

import { CHANNEL_POLICY_MODES } from "../management/management.constants";
import { getChannel } from "../registry/channel.registry";
import type {
  AttachChannelPolicyInput,
  ChannelPolicy,
} from "./policy.types";

const policies = new Map<string, ChannelPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: ChannelPolicy): ChannelPolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function attachChannelPolicy(
  input: AttachChannelPolicyInput,
): ChannelPolicy {
  const channelId = input.channelId.trim();
  if (!channelId) throw new Error("policy.channelId is required");
  if (!(CHANNEL_POLICY_MODES as readonly string[]).includes(input.mode)) {
    throw new Error(`invalid policy mode: ${input.mode}`);
  }
  if (!Number.isFinite(input.maxPerMinute) || input.maxPerMinute < 1) {
    throw new Error("policy.maxPerMinute must be >= 1");
  }

  const channel = getChannel(channelId);
  if (!channel) throw new Error(`channel not found: ${channelId}`);
  if (channel.status !== "ACTIVE") {
    throw new Error(`channel not active: ${channelId}`);
  }

  const duplicate = [...policies.values()].find(
    (p) => p.channelId === channelId,
  );
  if (duplicate) throw new Error(`policy already exists: ${channelId}`);

  const id = input.id?.trim() || createId("chnpol");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const policy: ChannelPolicy = {
    id,
    channelId,
    mode: input.mode,
    maxPerMinute: Math.floor(input.maxPerMinute),
    requireTemplate: input.requireTemplate === true,
    detail: `mode=${input.mode} max=${Math.floor(input.maxPerMinute)}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getChannelPolicy(id: string): ChannelPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listChannelPolicies(filter?: {
  channelId?: string;
}): ChannelPolicy[] {
  let result = [...policies.values()];
  if (filter?.channelId) {
    const channelId = filter.channelId.trim();
    result = result.filter((p) => p.channelId === channelId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearChannelPolicies(): void {
  policies.clear();
}
