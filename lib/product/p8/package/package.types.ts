/**
 * Product P8 — Package types
 */

import type { PACKAGE_STATUSES } from "../tender/tender.constants";

export type PackageStatus = (typeof PACKAGE_STATUSES)[number];
export type PackageMetadata = Record<string, unknown>;

export type TenderPackage = {
  id: string;
  tenderId: string;
  name: string;
  exportIds: string[];
  status: PackageStatus;
  detail: string;
  metadata: PackageMetadata;
  createdAt: string;
  sealedAt?: string;
};

export type CreatePackageInput = {
  id?: string;
  tenderId: string;
  name: string;
  exportIds?: string[];
  metadata?: PackageMetadata;
};

export type SealPackageInput = {
  packageId: string;
  exportIds?: string[];
};
