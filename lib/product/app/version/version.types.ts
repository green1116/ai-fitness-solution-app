/**
 * Product App — version types (declaration only, no install/runtime)
 */

import type { APP_VERSION_STATUSES } from "../management/management.constants";

export type AppVersionStatus = (typeof APP_VERSION_STATUSES)[number];
export type VersionMetadata = Record<string, unknown>;

export type AppVersion = {
  id: string;
  appId: string;
  definitionId: string;
  versionKey: string;
  semver: string;
  status: AppVersionStatus;
  detail: string;
  metadata: VersionMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAppVersionInput = {
  id?: string;
  appId: string;
  definitionId: string;
  versionKey: string;
  semver: string;
  metadata?: VersionMetadata;
};

export type UpdateAppVersionStatusInput = {
  versionId: string;
  status: AppVersionStatus;
};
