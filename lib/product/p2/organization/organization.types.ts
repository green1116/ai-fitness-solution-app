/**
 * Product P2 — Organization types + readiness / manifest
 */

import type {
  ORGANIZATION_STATUSES,
  P2_MANAGER_STATUSES,
  P2_READINESS_VERDICTS,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION,
} from "./organization.constants";

export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];
export type P2ReadinessVerdict = (typeof P2_READINESS_VERDICTS)[number];
export type P2ManagerStatus = (typeof P2_MANAGER_STATUSES)[number];
export type OrganizationMetadata = Record<string, unknown>;

export type Organization = {
  id: string;
  accountRef: string;
  name: string;
  status: OrganizationStatus;
  owner: string;
  detail: string;
  metadata: OrganizationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOrganizationInput = {
  id?: string;
  accountRef: string;
  name: string;
  owner: string;
  metadata?: OrganizationMetadata;
};

export type P2ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P2ReadinessResult = {
  verdict: P2ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P2ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P2RegistryManifest = {
  foundationId: typeof PRODUCT_P2_ORGANIZATION_WORKSPACE_ID;
  version: typeof PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION;
  freezeVersion: typeof PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION;
  base: typeof PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE;
  organizationCount: number;
  departmentCount: number;
  memberCount: number;
  roleCount: number;
  permissionCount: number;
  workspaceCount: number;
  invitationCount: number;
  directoryCount: number;
};
