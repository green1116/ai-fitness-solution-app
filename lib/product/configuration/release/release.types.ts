/**
 * Product Configuration — Release types
 */

import type { CONFIG_RELEASE_STATUSES } from "../management/management.constants";

export type ConfigReleaseStatus = (typeof CONFIG_RELEASE_STATUSES)[number];
export type ReleaseMetadata = Record<string, unknown>;

export type ConfigRelease = {
  id: string;
  namespaceId: string;
  versionTag: string;
  status: ConfigReleaseStatus;
  parameterIds: string[];
  detail: string;
  metadata: ReleaseMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateConfigReleaseInput = {
  id?: string;
  namespaceId: string;
  versionTag: string;
  parameterIds: string[];
  metadata?: ReleaseMetadata;
};

export type UpdateConfigReleaseStatusInput = {
  releaseId: string;
  status: ConfigReleaseStatus;
};
