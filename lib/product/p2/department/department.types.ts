/**
 * Product P2 — Department types
 */

import type { DEPARTMENT_STATUSES } from "../organization/organization.constants";

export type DepartmentStatus = (typeof DEPARTMENT_STATUSES)[number];
export type DepartmentMetadata = Record<string, unknown>;

export type Department = {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  status: DepartmentStatus;
  detail: string;
  metadata: DepartmentMetadata;
  createdAt: string;
};

export type RegisterDepartmentInput = {
  id?: string;
  organizationId: string;
  name: string;
  code: string;
  metadata?: DepartmentMetadata;
};
