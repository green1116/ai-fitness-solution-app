/**
 * Product P11 — License types
 */

import type { LICENSE_STATUSES } from "../release/release.constants";

export type LicenseStatus = (typeof LICENSE_STATUSES)[number];
export type LicenseMetadata = Record<string, unknown>;

export type CommercialLicense = {
  id: string;
  releaseId: string;
  tenantId: string;
  key: string;
  seats: number;
  status: LicenseStatus;
  detail: string;
  metadata: LicenseMetadata;
  issuedAt: string;
  activatedAt?: string;
};

export type IssueLicenseInput = {
  id?: string;
  releaseId: string;
  tenantId: string;
  key?: string;
  seats: number;
  metadata?: LicenseMetadata;
};

export type ActivateLicenseInput = {
  licenseId: string;
};
