/**
 * E12-P3 — Admin Console Manager
 * Orchestrates organization / role / permission / tenant / config / audit
 */

import { getProductRegistryManifest } from "../registry/product.registry";
import { getTenantProductRegistryManifest } from "../tenant/tenant.manager";
import { recordAdminAudit, listAdminAuditEntries, clearAdminAuditTrail } from "./admin.audit";
import {
  setProductConfiguration,
  getProductConfiguration,
  listProductConfigurations,
  clearProductConfigurations,
} from "./admin.config";
import {
  E12_ADMIN_CONSOLE_BASE,
  E12_ADMIN_CONSOLE_FREEZE_VERSION,
  E12_ADMIN_CONSOLE_ID,
  E12_ADMIN_CONSOLE_VERSION,
} from "./admin.constants";
import {
  assignOrganizationAdmin,
  getOrganization,
  listOrganizationAdmins,
  listOrganizations,
  registerOrganization,
  clearOrganizations,
} from "./admin.organization";
import {
  evaluateAdminPermission,
  hasAdminPermission,
  listUserPermissions,
} from "./admin.permission";
import { assignAdminRole, getAdminRole, listAdminRoles, clearAdminRoles } from "./admin.role";
import {
  activateTenantAdministration,
  evaluateTenantCapabilityAccess,
  getTenantAdministrationSummary,
  linkTenantToOrganization,
  listTenantAdministrationSummaries,
  suspendTenantAdministration,
  clearTenantAdministration,
} from "./admin.tenant";
import type {
  AdminAuditEntry,
  AdminConsoleManagerStatus,
  AdminConsoleRegistryManifest,
  AdminUserRole,
  AssignAdminRoleInput,
  AssignOrganizationAdminInput,
  Organization,
  OrganizationAdmin,
  PermissionEvaluationContext,
  PermissionEvaluationResult,
  ProductConfiguration,
  RecordAdminAuditInput,
  RegisterOrganizationInput,
  SetProductConfigurationInput,
  TenantAdministrationAction,
  TenantAdministrationSummary,
} from "./admin.types";

export type AdminConsoleManagerSnapshot = {
  managerId: string;
  status: AdminConsoleManagerStatus;
  layerId: typeof E12_ADMIN_CONSOLE_ID;
  version: typeof E12_ADMIN_CONSOLE_VERSION;
  organizationCount: number;
  adminCount: number;
  roleCount: number;
  configCount: number;
  auditCount: number;
  tenantProductCount: number;
  productIdentityCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AdminConsoleManager = {
  initialize: () => AdminConsoleManagerSnapshot;
  start: () => AdminConsoleManagerSnapshot;
  stop: () => AdminConsoleManagerSnapshot;
  status: () => AdminConsoleManagerSnapshot;
  registerOrganization: (input: RegisterOrganizationInput) => Organization;
  getOrganization: typeof getOrganization;
  listOrganizations: typeof listOrganizations;
  assignOrgAdmin: (input: AssignOrganizationAdminInput) => OrganizationAdmin;
  listOrgAdmins: typeof listOrganizationAdmins;
  assignRole: (input: AssignAdminRoleInput) => AdminUserRole;
  getRole: typeof getAdminRole;
  listRoles: typeof listAdminRoles;
  evaluatePermission: (
    context: PermissionEvaluationContext,
  ) => PermissionEvaluationResult;
  hasPermission: typeof hasAdminPermission;
  listPermissions: typeof listUserPermissions;
  linkTenant: typeof linkTenantToOrganization;
  tenantSummary: (productTenantId: string) => TenantAdministrationSummary;
  listTenantSummaries: typeof listTenantAdministrationSummaries;
  suspendTenant: (input: {
    productTenantId: string;
    performedBy: string;
  }) => TenantAdministrationAction;
  activateTenant: (input: {
    productTenantId: string;
    performedBy: string;
  }) => TenantAdministrationAction;
  evaluateCapability: typeof evaluateTenantCapabilityAccess;
  setConfig: (input: SetProductConfigurationInput) => ProductConfiguration;
  getConfig: typeof getProductConfiguration;
  listConfigs: typeof listProductConfigurations;
  recordAudit: (input: RecordAdminAuditInput) => AdminAuditEntry;
  listAudit: typeof import("./admin.audit").listAdminAuditEntries;
  manifest: () => AdminConsoleRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getAdminConsoleRegistryManifest(): AdminConsoleRegistryManifest {
  return {
    adminConsoleId: E12_ADMIN_CONSOLE_ID,
    version: E12_ADMIN_CONSOLE_VERSION,
    freezeVersion: E12_ADMIN_CONSOLE_FREEZE_VERSION,
    base: E12_ADMIN_CONSOLE_BASE,
    organizationCount: listOrganizations().length,
    adminCount: listOrganizationAdmins().length,
    roleCount: listAdminRoles().length,
    configCount: listProductConfigurations().length,
    auditCount: listAdminAuditEntries().length,
  };
}

export function clearAdminConsoleLayer(): void {
  clearAdminAuditTrail();
  clearProductConfigurations();
  clearTenantAdministration();
  clearAdminRoles();
  clearOrganizations();
}

export function createAdminConsoleManager(options?: {
  managerId?: string;
}): AdminConsoleManager {
  const managerId =
    options?.managerId?.trim() || createId("e12-acm-mgr");
  let state: AdminConsoleManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AdminConsoleManagerSnapshot {
    const productReg = getProductRegistryManifest();
    const tenantReg = getTenantProductRegistryManifest();
    const reg = getAdminConsoleRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: E12_ADMIN_CONSOLE_ID,
      version: E12_ADMIN_CONSOLE_VERSION,
      organizationCount: reg.organizationCount,
      adminCount: reg.adminCount,
      roleCount: reg.roleCount,
      configCount: reg.configCount,
      auditCount: reg.auditCount,
      tenantProductCount: tenantReg.tenantCount,
      productIdentityCount: productReg.identityCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): AdminConsoleManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAdminConsoleLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AdminConsoleManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): AdminConsoleManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerOrganization: (input) => {
      assertRunning("registerOrganization");
      const org = registerOrganization(input);
      recordAdminAudit({
        action: "ORG_CREATED",
        actorUserId: "system",
        organizationId: org.id,
        productId: org.productId,
        detail: `organization created: ${org.name}`,
      });
      return org;
    },
    getOrganization,
    listOrganizations,
    assignOrgAdmin: (input) => {
      assertRunning("assignOrgAdmin");
      const admin = assignOrganizationAdmin(input);
      recordAdminAudit({
        action: "ORG_ADMIN_ASSIGNED",
        actorUserId: input.userId,
        organizationId: admin.organizationId,
        detail: `org admin assigned: ${admin.email}`,
      });
      return admin;
    },
    listOrgAdmins: listOrganizationAdmins,
    assignRole: (input) => {
      assertRunning("assignRole");
      const role = assignAdminRole(input);
      recordAdminAudit({
        action: "ROLE_ASSIGNED",
        actorUserId: input.userId,
        organizationId: role.organizationId,
        productTenantId: role.productTenantId,
        detail: `role assigned: ${role.role}`,
      });
      return role;
    },
    getRole: getAdminRole,
    listRoles: listAdminRoles,
    evaluatePermission: (context) => {
      assertRunning("evaluatePermission");
      const result = evaluateAdminPermission(context);
      recordAdminAudit({
        action: "PERMISSION_EVALUATED",
        actorUserId: context.userId,
        organizationId: context.organizationId,
        productTenantId: context.productTenantId,
        productId: context.productId,
        detail: `${context.permission}=${result.decision}`,
      });
      return result;
    },
    hasPermission: (context) => {
      assertRunning("hasPermission");
      return hasAdminPermission(context);
    },
    listPermissions: listUserPermissions,
    linkTenant: (productTenantId, organizationId) => {
      assertRunning("linkTenant");
      linkTenantToOrganization(productTenantId, organizationId);
      recordAdminAudit({
        action: "TENANT_LINKED",
        actorUserId: "system",
        organizationId,
        productTenantId,
        detail: `tenant linked to organization`,
      });
    },
    tenantSummary: (productTenantId) => {
      assertRunning("tenantSummary");
      return getTenantAdministrationSummary(productTenantId);
    },
    listTenantSummaries: listTenantAdministrationSummaries,
    suspendTenant: (input) => {
      assertRunning("suspendTenant");
      const action = suspendTenantAdministration(input);
      recordAdminAudit({
        action: "TENANT_SUSPENDED",
        actorUserId: input.performedBy,
        productTenantId: input.productTenantId,
        organizationId: action.organizationId,
        detail: "tenant suspended",
      });
      return action;
    },
    activateTenant: (input) => {
      assertRunning("activateTenant");
      const action = activateTenantAdministration(input);
      recordAdminAudit({
        action: "TENANT_ACTIVATED",
        actorUserId: input.performedBy,
        productTenantId: input.productTenantId,
        organizationId: action.organizationId,
        detail: "tenant activated",
      });
      return action;
    },
    evaluateCapability: (input) => {
      assertRunning("evaluateCapability");
      const result = evaluateTenantCapabilityAccess(input);
      recordAdminAudit({
        action: "CAPABILITY_EVALUATED",
        actorUserId: "system",
        productTenantId: input.productTenantId,
        detail: `${input.capabilityRef}=${result.decision}`,
      });
      return result;
    },
    setConfig: (input) => {
      assertRunning("setConfig");
      const config = setProductConfiguration(input);
      recordAdminAudit({
        action: "PRODUCT_CONFIG_SET",
        actorUserId: input.updatedBy,
        organizationId: config.organizationId,
        productTenantId: config.productTenantId,
        productId: config.productId,
        detail: `config set: ${config.key}`,
      });
      return config;
    },
    getConfig: getProductConfiguration,
    listConfigs: listProductConfigurations,
    recordAudit: (input) => {
      assertRunning("recordAudit");
      return recordAdminAudit(input);
    },
    listAudit: listAdminAuditEntries,
    manifest: getAdminConsoleRegistryManifest,
  };
}
