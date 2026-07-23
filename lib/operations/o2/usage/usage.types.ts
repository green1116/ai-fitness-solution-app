/**
 * Operations O2 — Usage types
 */

import type { USAGE_STREAM_KINDS } from "./usage.constants";

export type UsageStreamKind = (typeof USAGE_STREAM_KINDS)[number];
export type UsageMetadata = Record<string, unknown>;

export type UsageStream = {
  id: string;
  accountRef: string;
  name: string;
  kind: UsageStreamKind;
  detail: string;
  metadata: UsageMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterUsageStreamInput = {
  id?: string;
  accountRef: string;
  name: string;
  kind: UsageStreamKind;
  metadata?: UsageMetadata;
};

export type UsageTracking = {
  id: string;
  streamId: string;
  units: number;
  period: string;
  detail: string;
  trackedAt: string;
};

export type TrackUsageInput = {
  id?: string;
  streamId: string;
  units: number;
  period?: string;
};
