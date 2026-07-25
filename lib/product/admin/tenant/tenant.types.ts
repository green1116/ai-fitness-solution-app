/**
 * Product Admin — Tenant types
 */

import type {
  ADMIN_TENANT_KINDS,
  ADMIN_TENANT_STATUSES,
} from "../foundation/foundation.constants";

export type AdminTenantKind = (typeof ADMIN_TENANT_KINDS)[number];
export type AdminTenantStatus = (typeof ADMIN_TENANT_STATUSES)[number];
export type TenantMetadata = Record<string, unknown>;

export type AdminTenant = {
  id: string;
  code: string;
  kind: AdminTenantKind;
  status: AdminTenantStatus;
  detail: string;
  metadata: TenantMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAdminTenantInput = {
  id?: string;
  code: string;
  kind: AdminTenantKind;
  metadata?: TenantMetadata;
};

export type UpdateAdminTenantStatusInput = {
  tenantId: string;
  status: AdminTenantStatus;
};
