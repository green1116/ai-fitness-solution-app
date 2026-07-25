/**
 * Product Organization — Organization Management Manager
 */

import {
  clearHierarchies,
  getHierarchy,
  linkHierarchy,
  listHierarchies,
} from "./hierarchy/hierarchy.registry";
import type {
  LinkHierarchyInput,
  OrganizationHierarchy,
} from "./hierarchy/hierarchy.types";
import {
  PRODUCT_ORGANIZATION_MANAGEMENT_BASE,
  PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_ORGANIZATION_MANAGEMENT_ID,
  PRODUCT_ORGANIZATION_MANAGEMENT_VERSION,
} from "./management/management.constants";
import {
  assertOrganizationManagementReadinessReady,
  evaluateOrganizationManagementReadiness,
} from "./management/management.readiness";
import type {
  OrganizationManagerStatus,
  OrganizationReadinessResult,
  OrganizationRegistryManifest,
} from "./management/management.types";
import {
  addMembership,
  clearMemberships,
  getMembership,
  listMemberships,
} from "./membership/membership.registry";
import type {
  AddMembershipInput,
  OrganizationMembership,
} from "./membership/membership.types";
import {
  assignOrgRole,
  clearOrgRoles,
  getOrgRole,
  listOrgRoles,
} from "./role/role.registry";
import type {
  AssignOrgRoleInput,
  OrganizationRoleAssignment,
} from "./role/role.types";
import {
  clearOrganizations,
  createOrganization,
  getOrganization,
  listOrganizations,
  updateOrganizationStatus,
} from "./unit/unit.registry";
import type {
  CreateOrganizationInput,
  OrganizationUnit,
  UpdateOrganizationStatusInput,
} from "./unit/unit.types";

export type OrganizationManagerSnapshot = {
  managerId: string;
  status: OrganizationManagerStatus;
  layerId: typeof PRODUCT_ORGANIZATION_MANAGEMENT_ID;
  version: typeof PRODUCT_ORGANIZATION_MANAGEMENT_VERSION;
  unitCount: number;
  membershipCount: number;
  hierarchyCount: number;
  roleCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type OrganizationManager = {
  initialize: () => OrganizationManagerSnapshot;
  start: () => OrganizationManagerSnapshot;
  stop: () => OrganizationManagerSnapshot;
  status: () => OrganizationManagerSnapshot;
  createOrganization: (input: CreateOrganizationInput) => OrganizationUnit;
  updateOrganizationStatus: (
    input: UpdateOrganizationStatusInput,
  ) => OrganizationUnit;
  addMembership: (input: AddMembershipInput) => OrganizationMembership;
  linkHierarchy: (input: LinkHierarchyInput) => OrganizationHierarchy;
  assignOrgRole: (input: AssignOrgRoleInput) => OrganizationRoleAssignment;
  evaluateReadiness: () => OrganizationReadinessResult;
  manifest: () => OrganizationRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getOrganizationRegistryManifest(): OrganizationRegistryManifest {
  return {
    managementId: PRODUCT_ORGANIZATION_MANAGEMENT_ID,
    version: PRODUCT_ORGANIZATION_MANAGEMENT_VERSION,
    freezeVersion: PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_ORGANIZATION_MANAGEMENT_BASE,
    unitCount: listOrganizations().length,
    membershipCount: listMemberships().length,
    hierarchyCount: listHierarchies().length,
    roleCount: listOrgRoles().length,
  };
}

export function clearOrganizationManagementLayer(): void {
  clearOrgRoles();
  clearHierarchies();
  clearMemberships();
  clearOrganizations();
}

export function createOrganizationManager(options?: {
  managerId?: string;
}): OrganizationManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-org-mgr");
  let state: OrganizationManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): OrganizationManagerSnapshot {
    const reg = getOrganizationRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_ORGANIZATION_MANAGEMENT_ID,
      version: PRODUCT_ORGANIZATION_MANAGEMENT_VERSION,
      unitCount: reg.unitCount,
      membershipCount: reg.membershipCount,
      hierarchyCount: reg.hierarchyCount,
      roleCount: reg.roleCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): OrganizationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearOrganizationManagementLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): OrganizationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): OrganizationManagerSnapshot {
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
    createOrganization: (input) => {
      assertRunning("createOrganization");
      return createOrganization(input);
    },
    updateOrganizationStatus: (input) => {
      assertRunning("updateOrganizationStatus");
      return updateOrganizationStatus(input);
    },
    addMembership: (input) => {
      assertRunning("addMembership");
      return addMembership(input);
    },
    linkHierarchy: (input) => {
      assertRunning("linkHierarchy");
      return linkHierarchy(input);
    },
    assignOrgRole: (input) => {
      assertRunning("assignOrgRole");
      return assignOrgRole(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateOrganizationManagementReadiness();
    },
    manifest: getOrganizationRegistryManifest,
  };
}

export {
  assertOrganizationManagementReadinessReady,
  getHierarchy,
  getMembership,
  getOrganization,
  getOrgRole,
  listHierarchies,
  listMemberships,
  listOrganizations,
  listOrgRoles,
};
