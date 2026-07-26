/**
 * Product Channel — Policy types
 */

import type { CHANNEL_POLICY_MODES } from "../management/management.constants";

export type ChannelPolicyMode = (typeof CHANNEL_POLICY_MODES)[number];
export type PolicyMetadata = Record<string, unknown>;

export type ChannelPolicy = {
  id: string;
  channelId: string;
  mode: ChannelPolicyMode;
  maxPerMinute: number;
  requireTemplate: boolean;
  detail: string;
  metadata: PolicyMetadata;
  createdAt: string;
};

export type AttachChannelPolicyInput = {
  id?: string;
  channelId: string;
  mode: ChannelPolicyMode;
  maxPerMinute: number;
  requireTemplate: boolean;
  metadata?: PolicyMetadata;
};
