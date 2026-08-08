/**
 * EP-2 / WP-4 — Enterprise Workspace Permission Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-3.
 * Derives from WorkspaceRole (WP-3).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_ROLE_REGISTRY_BASELINE,
  getWorkspaceRoleRegistry,
  type WorkspaceRoleRegistry,
  type WorkspaceRoleType,
} from "./workspace-role-registry";

export const EP_2_WP4_ID = "WP-4" as const;
export const WORKSPACE_PERMISSION_REGISTRY_CAPABILITY =
  "WorkspacePermissionRegistry" as const;
export const EP_WORKSPACE_PERMISSION_REGISTRY_VERSION =
  "ep-2-wp-4-workspace-permission-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-3 baseline. */
export const EP_WORKSPACE_PERMISSION_REGISTRY_BASELINE =
  EP_WORKSPACE_ROLE_REGISTRY_BASELINE;

export const WORKSPACE_PERMISSION_TYPES = [
  "MANAGE",
  "ADMINISTER",
  "EDIT",
  "VIEW",
] as const;
export type WorkspacePermissionType =
  (typeof WORKSPACE_PERMISSION_TYPES)[number];

export const WORKSPACE_PERMISSION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspacePermissionStatus =
  (typeof WORKSPACE_PERMISSION_STATUSES)[number];

export type WorkspacePermissionRegistry = Readonly<{
  id: string;
  workspaceId: string;
  memberId: string;
  roleId: string;
  permissionId: string;
  permissionType: WorkspacePermissionType;
  status: WorkspacePermissionStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type PermissionSeedDef = Readonly<{
  permissionIdSuffix: string;
  permissionType: WorkspacePermissionType;
}>;

/** One permission template per WP-3 roleType (scale-safe). */
const PERMISSION_DEFS_BY_ROLE_TYPE: Readonly<
  Record<WorkspaceRoleType, readonly PermissionSeedDef[]>
> = {
  WORKSPACE_OWNER: [
    {
      permissionIdSuffix: "manage",
      permissionType: "MANAGE",
    },
  ],
  WORKSPACE_ADMIN: [
    {
      permissionIdSuffix: "administer",
      permissionType: "ADMINISTER",
    },
  ],
  WORKSPACE_CONTRIBUTOR: [
    {
      permissionIdSuffix: "edit",
      permissionType: "EDIT",
    },
  ],
  WORKSPACE_VIEWER: [
    {
      permissionIdSuffix: "view",
      permissionType: "VIEW",
    },
  ],
};

let cachedRegistry: WorkspacePermissionRegistry[] | null = null;

function cloneEntry(
  row: WorkspacePermissionRegistry,
): WorkspacePermissionRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspacePermissionRegistry[],
): WorkspacePermissionRegistry[] {
  return [...rows].sort((a, b) => {
    const byWs = a.workspaceId.localeCompare(b.workspaceId);
    if (byWs !== 0) return byWs;
    const byMem = a.memberId.localeCompare(b.memberId);
    if (byMem !== 0) return byMem;
    const byRole = a.roleId.localeCompare(b.roleId);
    if (byRole !== 0) return byRole;
    return a.permissionId.localeCompare(b.permissionId);
  });
}

function fingerprint(rows: readonly WorkspacePermissionRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.permissionType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromRoles(
  roles: readonly WorkspaceRoleRegistry[],
): WorkspacePermissionRegistry[] {
  const rows: WorkspacePermissionRegistry[] = [];
  for (const role of roles) {
    const defs = PERMISSION_DEFS_BY_ROLE_TYPE[role.roleType] ?? [];
    for (const def of defs) {
      const permissionId = `perm-${role.roleId}-${def.permissionIdSuffix}`;
      const status: WorkspacePermissionStatus =
        role.status === "ACTIVE" ? "ACTIVE" : role.status;
      rows.push({
        id: `ep.wsp.reg.${role.workspaceId}.${role.memberId}.${role.roleId}.${permissionId}`,
        workspaceId: role.workspaceId,
        memberId: role.memberId,
        roleId: role.roleId,
        permissionId,
        permissionType: def.permissionType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Permission Registry from WP-3 roles.
 */
export function buildWorkspacePermissionRegistry(): WorkspacePermissionRegistry[] {
  const roles = getWorkspaceRoleRegistry();
  const out = sortStable(seedFromRoles(roles)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspacePermissionRegistry(): WorkspacePermissionRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspacePermissionRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspacePermissionRegistryFingerprint(
  rows?: readonly WorkspacePermissionRegistry[],
): string {
  const list = rows ?? getWorkspacePermissionRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspacePermissionRegistry(): void {
  cachedRegistry = null;
}
