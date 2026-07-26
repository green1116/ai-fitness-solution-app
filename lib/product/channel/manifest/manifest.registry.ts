/**
 * Product Channel — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listChannelCapabilities } from "../capability/capability.registry";
import { listChannelPolicies } from "../policy/policy.registry";
import { getChannel } from "../registry/channel.registry";
import { listChannelValidations } from "../validation/validation.registry";

export type ChannelReleaseManifest = {
  id: string;
  channelId: string;
  channelKey: string;
  checksum: string;
  capabilityId: string;
  policyId: string;
  validationId: string;
  createdAt: string;
};

const releases = new Map<string, ChannelReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(release: ChannelReleaseManifest): ChannelReleaseManifest {
  return { ...release };
}

function checksumPayload(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function createChannelReleaseManifest(input: {
  id?: string;
  channelId: string;
}): ChannelReleaseManifest {
  const channelId = input.channelId.trim();
  if (!channelId) throw new Error("manifest.channelId is required");

  const channel = getChannel(channelId);
  if (!channel) throw new Error(`channel not found: ${channelId}`);
  if (channel.status !== "ACTIVE") {
    throw new Error(`channel not active: ${channelId}`);
  }

  const capabilities = listChannelCapabilities({ channelId });
  if (capabilities.length < 1) throw new Error("capability missing");
  const policies = listChannelPolicies({ channelId });
  if (policies.length < 1) throw new Error("policy missing");
  const validations = listChannelValidations({ channelId });
  const valid = validations.find((v) => v.verdict === "VALID");
  if (!valid) throw new Error("valid validation missing");

  const payload = {
    channelKey: channel.channelKey,
    kind: channel.kind,
    templateManagementRef: channel.templateManagementRef,
    features: [...capabilities[0].features].sort((a, b) => a.localeCompare(b)),
    policy: {
      mode: policies[0].mode,
      maxPerMinute: policies[0].maxPerMinute,
      requireTemplate: policies[0].requireTemplate,
    },
    validation: valid.verdict,
  };

  const id = input.id?.trim() || createId("chnrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: ChannelReleaseManifest = {
    id,
    channelId,
    channelKey: channel.channelKey,
    checksum: checksumPayload(payload),
    capabilityId: capabilities[0].id,
    policyId: policies[0].id,
    validationId: valid.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getChannelReleaseManifest(
  id: string,
): ChannelReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listChannelReleaseManifests(): ChannelReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearChannelReleaseManifests(): void {
  releases.clear();
}
