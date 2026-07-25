/**
 * Product Authorization — RBAC Manager
 */

import {
  assignRole,
  clearAssignments,
  getAssignment,
  listAssignments,
  updateAssignmentStatus,
} from "./assignment/assignment.registry";
import type {
  AssignRoleInput,
  RoleAssignment,
  UpdateAssignmentStatusInput,
} from "./assignment/assignment.types";
import {
  authorize,
  clearDecisions,
  getDecision,
  listDecisions,
} from "./decision/decision.registry";
import type {
  AuthorizationDecision,
  AuthorizeInput,
} from "./decision/decision.types";
import {
  clearGrants,
  getGrant,
  grantPermission,
  listGrants,
} from "./grant/grant.registry";
import type {
  GrantPermissionInput,
  PermissionGrant,
} from "./grant/grant.types";
import {
  clearPermissions,
  getPermission,
  listPermissions,
  registerPermission,
} from "./permission/permission.registry";
import type {
  AuthorizationPermission,
  RegisterPermissionInput,
} from "./permission/permission.types";
import {
  PRODUCT_AUTHORIZATION_RBAC_BASE,
  PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION,
  PRODUCT_AUTHORIZATION_RBAC_ID,
  PRODUCT_AUTHORIZATION_RBAC_VERSION,
} from "./rbac/rbac.constants";
import {
  assertAuthorizationRbacReadinessReady,
  evaluateAuthorizationRbacReadiness,
} from "./rbac/rbac.readiness";
import type {
  AuthorizationManagerStatus,
  AuthorizationReadinessResult,
  AuthorizationRegistryManifest,
} from "./rbac/rbac.types";
import {
  clearRoles,
  getRole,
  listRoles,
  registerRole,
} from "./role/role.registry";
import type {
  AuthorizationRole,
  RegisterRoleInput,
} from "./role/role.types";

export type AuthorizationManagerSnapshot = {
  managerId: string;
  status: AuthorizationManagerStatus;
  layerId: typeof PRODUCT_AUTHORIZATION_RBAC_ID;
  version: typeof PRODUCT_AUTHORIZATION_RBAC_VERSION;
  roleCount: number;
  permissionCount: number;
  grantCount: number;
  assignmentCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AuthorizationManager = {
  initialize: () => AuthorizationManagerSnapshot;
  start: () => AuthorizationManagerSnapshot;
  stop: () => AuthorizationManagerSnapshot;
  status: () => AuthorizationManagerSnapshot;
  registerRole: (input: RegisterRoleInput) => AuthorizationRole;
  registerPermission: (
    input: RegisterPermissionInput,
  ) => AuthorizationPermission;
  grantPermission: (input: GrantPermissionInput) => PermissionGrant;
  assignRole: (input: AssignRoleInput) => RoleAssignment;
  updateAssignmentStatus: (
    input: UpdateAssignmentStatusInput,
  ) => RoleAssignment;
  authorize: (input: AuthorizeInput) => AuthorizationDecision;
  evaluateReadiness: () => AuthorizationReadinessResult;
  manifest: () => AuthorizationRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getAuthorizationRegistryManifest(): AuthorizationRegistryManifest {
  return {
    foundationId: PRODUCT_AUTHORIZATION_RBAC_ID,
    version: PRODUCT_AUTHORIZATION_RBAC_VERSION,
    freezeVersion: PRODUCT_AUTHORIZATION_RBAC_FREEZE_VERSION,
    base: PRODUCT_AUTHORIZATION_RBAC_BASE,
    roleCount: listRoles().length,
    permissionCount: listPermissions().length,
    grantCount: listGrants().length,
    assignmentCount: listAssignments().length,
    decisionCount: listDecisions().length,
  };
}

export function clearAuthorizationRbacLayer(): void {
  clearDecisions();
  clearAssignments();
  clearGrants();
  clearPermissions();
  clearRoles();
}

export function createAuthorizationManager(options?: {
  managerId?: string;
}): AuthorizationManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-az-mgr");
  let state: AuthorizationManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AuthorizationManagerSnapshot {
    const reg = getAuthorizationRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_AUTHORIZATION_RBAC_ID,
      version: PRODUCT_AUTHORIZATION_RBAC_VERSION,
      roleCount: reg.roleCount,
      permissionCount: reg.permissionCount,
      grantCount: reg.grantCount,
      assignmentCount: reg.assignmentCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): AuthorizationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAuthorizationRbacLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AuthorizationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): AuthorizationManagerSnapshot {
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
    registerRole: (input) => {
      assertRunning("registerRole");
      return registerRole(input);
    },
    registerPermission: (input) => {
      assertRunning("registerPermission");
      return registerPermission(input);
    },
    grantPermission: (input) => {
      assertRunning("grantPermission");
      return grantPermission(input);
    },
    assignRole: (input) => {
      assertRunning("assignRole");
      return assignRole(input);
    },
    updateAssignmentStatus: (input) => {
      assertRunning("updateAssignmentStatus");
      return updateAssignmentStatus(input);
    },
    authorize: (input) => {
      assertRunning("authorize");
      return authorize(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateAuthorizationRbacReadiness();
    },
    manifest: getAuthorizationRegistryManifest,
  };
}

export {
  assertAuthorizationRbacReadinessReady,
  getAssignment,
  getDecision,
  getGrant,
  getPermission,
  getRole,
  listAssignments,
  listDecisions,
  listGrants,
  listPermissions,
  listRoles,
};
