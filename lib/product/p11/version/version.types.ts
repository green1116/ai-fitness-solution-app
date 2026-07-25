/**
 * Product P11 — Version types
 */

import type { VERSION_CHANNELS } from "../release/release.constants";

export type VersionChannel = (typeof VERSION_CHANNELS)[number];
export type VersionMetadata = Record<string, unknown>;

export type ReleaseVersion = {
  id: string;
  releaseId: string;
  semver: string;
  channel: VersionChannel;
  notes: string;
  detail: string;
  metadata: VersionMetadata;
  publishedAt: string;
};

export type PublishVersionInput = {
  id?: string;
  releaseId: string;
  semver: string;
  channel: VersionChannel;
  notes?: string;
  metadata?: VersionMetadata;
};
