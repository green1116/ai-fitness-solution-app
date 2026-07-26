/**
 * Product Channel — Capability types
 */

import type { CHANNEL_CAPABILITY_FEATURES } from "../management/management.constants";

export type ChannelCapabilityFeature =
  (typeof CHANNEL_CAPABILITY_FEATURES)[number];
export type CapabilityMetadata = Record<string, unknown>;

export type ChannelCapability = {
  id: string;
  channelId: string;
  features: ChannelCapabilityFeature[];
  detail: string;
  metadata: CapabilityMetadata;
  createdAt: string;
};

export type DeclareChannelCapabilityInput = {
  id?: string;
  channelId: string;
  features: ChannelCapabilityFeature[];
  metadata?: CapabilityMetadata;
};
