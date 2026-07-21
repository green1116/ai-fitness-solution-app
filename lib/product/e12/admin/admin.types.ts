/**
 * E12-P3 — Enterprise Admin Console types
 */

import type {
  ADMIN_AUDIT_ACTIONS,
  ADMIN_CONSOLE_MANAGER_STATUSES,
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_KINDS,
  ADMIN_USER_STATUSES,
  E12_ADMIN_CONSOLE_BASE,
  E12_ADMIN_CONSOLE_FREEZE_VERSION,
  E12_ADMIN_CONSOLE_ID,
  E12_ADMIN_CONSOLE_VERSION,
  ORGANIZATION_STATUSES,
  PERMISSION_DECISIONS,
  PRODUCT_CONFIG_SCOPES,
} from "./admin.constants";
import type { ProductMetadata } from "../types/product.types";

export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];
export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];
export type AdminRoleKind = (typeof ADMIN_ROLE_KINDS)[number];
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];
export type PermissionDecision = (typeof PERMISSION_DECISIONS)[number];
export type ProductConfigScope = (typeof PRODUCT_CONFIG_SCOPES)[number];
export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];
export type AdminConsoleManagerStatus =
  (typeof ADMIN_CONSOLE_MANAGER_STATUSES)[number];

export type { ProductMetadata };

/** Organization admin model. */
export type Organization = {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  productId: string;
  metadata: ProductMetadata;
  createdAt: string;
};

export type RegisterOrganizationInput = {
  id?: string;
  name: string;
  slug: string;
  productId: string;
  status?: OrganizationStatus;
  metadata?: ProductMetadata;
};

export type OrganizationAdmin = {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  status: AdminUserStatus;
  metadata: ProductMetadata;
  assignedAt: string;
};

export type AssignOrganizationAdminInput = {
  id?: string;
  organizationId: string;
  userId: string;
  email: string;
  status?: AdminUserStatus;
  metadata?: ProductMetadata;
};

/** User role model. */
export type AdminUserRole = {
  id: string;
  userId: string;
  organizationId: string;
  role: AdminRoleKind;
  productTenantId?: string;
  permissions: AdminPermission[];
  metadata: ProductMetadata;
  assignedAt: string;
};

export type AssignAdminRoleInput = {
  id?: string;
  userId: string;
  organizationId: string;
  role: AdminRoleKind;
  productTenantId?: string;
  metadata?: ProductMetadata;
};

/** Permission evaluation. */
export type PermissionEvaluationContext = {
  userId: string;
  permission: AdminPermission;
  organizationId?: string;
  productTenantId?: string;
  productId?: string;
};

export type PermissionEvaluationResult = {
  decision: PermissionDecision;
  userId: string;
  permission: AdminPermission;
  role?: AdminRoleKind;
  reason: string;
  evaluatedAt: string;
};

/** Tenant administration view. */
export type TenantAdministrationSummary = {
  productTenantId: string;
  organizationId?: string;
  tenantName: string;
  tenantStatus: string;
  productId: string;
  workspaceId: string;
  subscriptionCount: number;
  entitlementCount: number;
  allowedCapabilities: string[];
};

export type TenantAdministrationAction = {
  action: "SUSPEND" | "ACTIVATE" | "LINK_ORGANIZATION";
  productTenantId: string;
  organizationId?: string;
  performedBy: string;
  performedAt: string;
};

/** Product configuration. */
export type ProductConfiguration = {
  id: string;
  productId: string;
  scope: ProductConfigScope;
  organizationId?: string;
  productTenantId?: string;
  key: string;
  value: unknown;
  metadata: ProductMetadata;
  updatedAt: string;
  updatedBy: string;
};

export type SetProductConfigurationInput = {
  id?: string;
  productId: string;
  scope: ProductConfigScope;
  organizationId?: string;
  productTenantId?: string;
  key: string;
  value: unknown;
  updatedBy: string;
  metadata?: ProductMetadata;
};

/** Admin audit trail. */
export type AdminAuditEntry = {
  id: string;
  action: AdminAuditAction;
  actorUserId: string;
  organizationId?: string;
  productTenantId?: string;
  productId?: string;
  detail: string;
  metadata: ProductMetadata;
  recordedAt: string;
};

export type RecordAdminAuditInput = {
  id?: string;
  action: AdminAuditAction;
  actorUserId: string;
  organizationId?: string;
  productTenantId?: string;
  productId?: string;
  detail: string;
  metadata?: ProductMetadata;
};

export type AdminConsoleRegistryManifest = {
  adminConsoleId: typeof E12_ADMIN_CONSOLE_ID;
  version: typeof E12_ADMIN_CONSOLE_VERSION;
  freezeVersion: typeof E12_ADMIN_CONSOLE_FREEZE_VERSION;
  base: typeof E12_ADMIN_CONSOLE_BASE;
  organizationCount: number;
  adminCount: number;
  roleCount: number;
  configCount: number;
  auditCount: number;
};
