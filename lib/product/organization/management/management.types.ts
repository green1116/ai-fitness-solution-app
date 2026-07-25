/**
 * Product Organization — readiness / manifest types
 */

import type {
  ORGANIZATION_MANAGER_STATUSES,
  ORGANIZATION_READINESS_VERDICTS,
  PRODUCT_ORGANIZATION_MANAGEMENT_BASE,
  PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_ORGANIZATION_MANAGEMENT_ID,
  PRODUCT_ORGANIZATION_MANAGEMENT_VERSION,
} from "./management.constants";

export type OrganizationReadinessVerdict =
  (typeof ORGANIZATION_READINESS_VERDICTS)[number];
export type OrganizationManagerStatus =
  (typeof ORGANIZATION_MANAGER_STATUSES)[number];

export type OrganizationReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OrganizationReadinessResult = {
  verdict: OrganizationReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OrganizationReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OrganizationRegistryManifest = {
  managementId: typeof PRODUCT_ORGANIZATION_MANAGEMENT_ID;
  version: typeof PRODUCT_ORGANIZATION_MANAGEMENT_VERSION;
  freezeVersion: typeof PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION;
  base: typeof PRODUCT_ORGANIZATION_MANAGEMENT_BASE;
  unitCount: number;
  membershipCount: number;
  hierarchyCount: number;
  roleCount: number;
};
