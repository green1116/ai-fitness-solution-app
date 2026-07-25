/**
 * Product Organization — Unit types
 */

import type { ORG_KINDS, ORG_STATUSES } from "../management/management.constants";

export type OrgKind = (typeof ORG_KINDS)[number];
export type OrgStatus = (typeof ORG_STATUSES)[number];
export type UnitMetadata = Record<string, unknown>;

export type OrganizationUnit = {
  id: string;
  customerId: string;
  kind: OrgKind;
  name: string;
  slug: string;
  status: OrgStatus;
  detail: string;
  metadata: UnitMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrganizationInput = {
  id?: string;
  customerId: string;
  kind: OrgKind;
  name: string;
  slug: string;
  metadata?: UnitMetadata;
};

export type UpdateOrganizationStatusInput = {
  organizationId: string;
  status: OrgStatus;
};
