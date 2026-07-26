/**
 * Product Channel — readiness / manifest types
 */

import type {
  CHANNEL_MANAGER_STATUSES,
  CHANNEL_READINESS_VERDICTS,
  PRODUCT_CHANNEL_MANAGEMENT_BASE,
  PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_CHANNEL_MANAGEMENT_ID,
  PRODUCT_CHANNEL_MANAGEMENT_VERSION,
} from "./management.constants";

export type ChannelReadinessVerdict =
  (typeof CHANNEL_READINESS_VERDICTS)[number];
export type ChannelManagerStatus = (typeof CHANNEL_MANAGER_STATUSES)[number];

export type ChannelReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ChannelReadinessResult = {
  verdict: ChannelReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ChannelReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ChannelRegistryManifest = {
  managementId: typeof PRODUCT_CHANNEL_MANAGEMENT_ID;
  version: typeof PRODUCT_CHANNEL_MANAGEMENT_VERSION;
  freezeVersion: typeof PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION;
  base: typeof PRODUCT_CHANNEL_MANAGEMENT_BASE;
  channelCount: number;
  capabilityCount: number;
  policyCount: number;
  validationCount: number;
  releaseCount: number;
};
