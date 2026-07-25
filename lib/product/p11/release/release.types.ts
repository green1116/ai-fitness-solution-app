/**
 * Product P11 — Release types + readiness / manifest
 */

import type {
  P11_MANAGER_STATUSES,
  P11_READINESS_VERDICTS,
  PRODUCT_P11_COMMERCIAL_RELEASE_BASE,
  PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION,
  PRODUCT_P11_COMMERCIAL_RELEASE_ID,
  PRODUCT_P11_COMMERCIAL_RELEASE_VERSION,
  RELEASE_STATUSES,
} from "./release.constants";

export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];
export type P11ReadinessVerdict = (typeof P11_READINESS_VERDICTS)[number];
export type P11ManagerStatus = (typeof P11_MANAGER_STATUSES)[number];
export type ReleaseMetadata = Record<string, unknown>;

export type CommercialRelease = {
  id: string;
  subscriptionRef: string;
  name: string;
  owner: string;
  status: ReleaseStatus;
  detail: string;
  metadata: ReleaseMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateReleaseInput = {
  id?: string;
  subscriptionRef: string;
  name: string;
  owner: string;
  metadata?: ReleaseMetadata;
};

export type UpdateReleaseStatusInput = {
  releaseId: string;
  status: ReleaseStatus;
};

export type P11ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P11ReadinessResult = {
  verdict: P11ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P11ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P11RegistryManifest = {
  foundationId: typeof PRODUCT_P11_COMMERCIAL_RELEASE_ID;
  version: typeof PRODUCT_P11_COMMERCIAL_RELEASE_VERSION;
  freezeVersion: typeof PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION;
  base: typeof PRODUCT_P11_COMMERCIAL_RELEASE_BASE;
  releaseCount: number;
  featureCount: number;
  versionCount: number;
  tenantCount: number;
  environmentCount: number;
  deploymentCount: number;
  licenseCount: number;
};
