/**
 * Product P2 — Organization Workspace Manager
 */

import {
  clearDepartments,
  getDepartment,
  listDepartments,
  registerDepartment,
} from "./department/department.registry";
import type {
  Department,
  RegisterDepartmentInput,
} from "./department/department.types";
import {
  buildDirectoryIndex,
  clearDirectoryIndexes,
  getDirectoryIndex,
  listDirectoryIndexes,
} from "./directory/directory.index";
import {
  assertP2OrganizationWorkspaceReadinessReady,
  evaluateP2OrganizationWorkspaceReadiness,
} from "./directory/directory.readiness";
import type {
  BuildDirectoryInput,
  DirectoryIndex,
} from "./directory/directory.types";
import {
  clearInvitations,
  createInvitation,
  getInvitation,
  listInvitations,
  updateInvitationStatus,
} from "./invitation/invitation.registry";
import type {
  CreateInvitationInput,
  OrganizationInvitation,
  UpdateInvitationStatusInput,
} from "./invitation/invitation.types";
import {
  clearMembers,
  getMember,
  listMembers,
  registerMember,
  updateMemberStatus,
} from "./member/member.registry";
import type {
  OrganizationMember,
  RegisterMemberInput,
  UpdateMemberStatusInput,
} from "./member/member.types";
import {
  PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
  PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION,
} from "./organization/organization.constants";
import {
  clearOrganizations,
  getOrganization,
  listOrganizations,
  registerOrganization,
  updateOrganizationStatus,
} from "./organization/organization.registry";
import type {
  Organization,
  OrganizationStatus,
  P2ManagerStatus,
  P2ReadinessResult,
  P2RegistryManifest,
  RegisterOrganizationInput,
} from "./organization/organization.types";
import {
  clearPermissions,
  getPermission,
  grantPermission,
  listPermissionGrants,
  listPermissions,
  registerPermission,
} from "./permission/permission.registry";
import type {
  GrantPermissionInput,
  Permission,
  RegisterPermissionInput,
  RolePermissionGrant,
} from "./permission/permission.types";
import {
  assignRole,
  clearRoles,
  getRole,
  listRoleAssignments,
  listRoles,
  registerRole,
} from "./role/role.registry";
import type {
  AssignRoleInput,
  MemberRoleAssignment,
  OrganizationRole,
  RegisterRoleInput,
} from "./role/role.types";
import {
  clearWorkspaces,
  getWorkspace,
  listWorkspaces,
  registerWorkspace,
  updateWorkspaceStatus,
} from "./workspace/workspace.registry";
import type {
  OrganizationWorkspace,
  RegisterWorkspaceInput,
  UpdateWorkspaceStatusInput,
} from "./workspace/workspace.types";

export type P2OrganizationWorkspaceManagerSnapshot = {
  managerId: string;
  status: P2ManagerStatus;
  layerId: typeof PRODUCT_P2_ORGANIZATION_WORKSPACE_ID;
  version: typeof PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION;
  organizationCount: number;
  memberCount: number;
  workspaceCount: number;
  directoryCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P2OrganizationWorkspaceManager = {
  initialize: () => P2OrganizationWorkspaceManagerSnapshot;
  start: () => P2OrganizationWorkspaceManagerSnapshot;
  stop: () => P2OrganizationWorkspaceManagerSnapshot;
  status: () => P2OrganizationWorkspaceManagerSnapshot;
  registerOrganization: (input: RegisterOrganizationInput) => Organization;
  updateOrganizationStatus: (
    organizationId: string,
    status: OrganizationStatus,
  ) => Organization;
  registerDepartment: (input: RegisterDepartmentInput) => Department;
  registerMember: (input: RegisterMemberInput) => OrganizationMember;
  updateMemberStatus: (input: UpdateMemberStatusInput) => OrganizationMember;
  registerRole: (input: RegisterRoleInput) => OrganizationRole;
  assignRole: (input: AssignRoleInput) => MemberRoleAssignment;
  registerPermission: (input: RegisterPermissionInput) => Permission;
  grantPermission: (input: GrantPermissionInput) => RolePermissionGrant;
  registerWorkspace: (input: RegisterWorkspaceInput) => OrganizationWorkspace;
  updateWorkspaceStatus: (
    input: UpdateWorkspaceStatusInput,
  ) => OrganizationWorkspace;
  createInvitation: (input: CreateInvitationInput) => OrganizationInvitation;
  updateInvitationStatus: (
    input: UpdateInvitationStatusInput,
  ) => OrganizationInvitation;
  buildDirectory: (input: BuildDirectoryInput) => DirectoryIndex;
  evaluateReadiness: () => P2ReadinessResult;
  manifest: () => P2RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP2RegistryManifest(): P2RegistryManifest {
  return {
    foundationId: PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
    version: PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION,
    freezeVersion: PRODUCT_P2_ORGANIZATION_WORKSPACE_FREEZE_VERSION,
    base: PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE,
    organizationCount: listOrganizations().length,
    departmentCount: listDepartments().length,
    memberCount: listMembers().length,
    roleCount: listRoles().length,
    permissionCount: listPermissions().length,
    workspaceCount: listWorkspaces().length,
    invitationCount: listInvitations().length,
    directoryCount: listDirectoryIndexes().length,
  };
}

export function clearP2OrganizationWorkspaceLayer(): void {
  clearDirectoryIndexes();
  clearInvitations();
  clearWorkspaces();
  clearPermissions();
  clearRoles();
  clearMembers();
  clearDepartments();
  clearOrganizations();
}

export function createP2OrganizationWorkspaceManager(options?: {
  managerId?: string;
}): P2OrganizationWorkspaceManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p2-org-mgr");
  let state: P2ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P2OrganizationWorkspaceManagerSnapshot {
    const reg = getP2RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P2_ORGANIZATION_WORKSPACE_ID,
      version: PRODUCT_P2_ORGANIZATION_WORKSPACE_VERSION,
      organizationCount: reg.organizationCount,
      memberCount: reg.memberCount,
      workspaceCount: reg.workspaceCount,
      directoryCount: reg.directoryCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P2OrganizationWorkspaceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP2OrganizationWorkspaceLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P2OrganizationWorkspaceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P2OrganizationWorkspaceManagerSnapshot {
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
      return registerOrganization(input);
    },
    updateOrganizationStatus: (organizationId, status) => {
      assertRunning("updateOrganizationStatus");
      return updateOrganizationStatus(organizationId, status);
    },
    registerDepartment: (input) => {
      assertRunning("registerDepartment");
      return registerDepartment(input);
    },
    registerMember: (input) => {
      assertRunning("registerMember");
      return registerMember(input);
    },
    updateMemberStatus: (input) => {
      assertRunning("updateMemberStatus");
      return updateMemberStatus(input);
    },
    registerRole: (input) => {
      assertRunning("registerRole");
      return registerRole(input);
    },
    assignRole: (input) => {
      assertRunning("assignRole");
      return assignRole(input);
    },
    registerPermission: (input) => {
      assertRunning("registerPermission");
      return registerPermission(input);
    },
    grantPermission: (input) => {
      assertRunning("grantPermission");
      return grantPermission(input);
    },
    registerWorkspace: (input) => {
      assertRunning("registerWorkspace");
      return registerWorkspace(input);
    },
    updateWorkspaceStatus: (input) => {
      assertRunning("updateWorkspaceStatus");
      return updateWorkspaceStatus(input);
    },
    createInvitation: (input) => {
      assertRunning("createInvitation");
      return createInvitation(input);
    },
    updateInvitationStatus: (input) => {
      assertRunning("updateInvitationStatus");
      return updateInvitationStatus(input);
    },
    buildDirectory: (input) => {
      assertRunning("buildDirectory");
      return buildDirectoryIndex(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP2OrganizationWorkspaceReadiness();
    },
    manifest: getP2RegistryManifest,
  };
}

export {
  assertP2OrganizationWorkspaceReadinessReady,
  getDepartment,
  getDirectoryIndex,
  getInvitation,
  getMember,
  getOrganization,
  getPermission,
  getRole,
  getWorkspace,
  listDepartments,
  listDirectoryIndexes,
  listInvitations,
  listMembers,
  listOrganizations,
  listPermissionGrants,
  listPermissions,
  listRoleAssignments,
  listRoles,
  listWorkspaces,
};
