/**
 * Product API SDK — package types (version binding only)
 */

import type { SDK_PACKAGE_STATUSES } from "../management/management.constants";

export type SdkPackageStatus = (typeof SDK_PACKAGE_STATUSES)[number];
export type SdkPackageMetadata = Record<string, unknown>;

export type SdkPackage = {
  id: string;
  clientId: string;
  packageKey: string;
  semver: string;
  status: SdkPackageStatus;
  operationIds: string[];
  detail: string;
  metadata: SdkPackageMetadata;
  createdAt: string;
  updatedAt: string;
};

export type PublishSdkPackageInput = {
  id?: string;
  clientId: string;
  packageKey: string;
  semver: string;
  operationIds: string[];
  metadata?: SdkPackageMetadata;
};

export type UpdateSdkPackageStatusInput = {
  packageId: string;
  status: SdkPackageStatus;
};
