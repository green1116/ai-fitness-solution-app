/**
 * EP-2 / WP-5 — Enterprise Workspace Access Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-4.
 * Derives from WorkspacePermission (WP-4).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_PERMISSION_REGISTRY_BASELINE,
  getWorkspacePermissionRegistry,
  type WorkspacePermissionRegistry,
  type WorkspacePermissionType,
} from "./workspace-permission-registry";

export const EP_2_WP5_ID = "WP-5" as const;
export const WORKSPACE_ACCESS_REGISTRY_CAPABILITY =
  "WorkspaceAccessRegistry" as const;
export const EP_WORKSPACE_ACCESS_REGISTRY_VERSION =
  "ep-2-wp-5-workspace-access-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-4 baseline. */
export const EP_WORKSPACE_ACCESS_REGISTRY_BASELINE =
  EP_WORKSPACE_PERMISSION_REGISTRY_BASELINE;

export const WORKSPACE_ACCESS_TYPES = [
  "FULL",
  "ELEVATED",
  "STANDARD",
  "READ_ONLY",
] as const;
export type WorkspaceAccessType = (typeof WORKSPACE_ACCESS_TYPES)[number];

export const WORKSPACE_ACCESS_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceAccessStatus = (typeof WORKSPACE_ACCESS_STATUSES)[number];

export type WorkspaceAccessRegistry = Readonly<{
  id: string;
  workspaceId: string;
  memberId: string;
  roleId: string;
  permissionId: string;
  accessId: string;
  accessType: WorkspaceAccessType;
  status: WorkspaceAccessStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type AccessSeedDef = Readonly<{
  accessIdSuffix: string;
  accessType: WorkspaceAccessType;
}>;

/** One access template per WP-4 permissionType (scale-safe). */
const ACCESS_DEFS_BY_PERMISSION_TYPE: Readonly<
  Record<WorkspacePermissionType, readonly AccessSeedDef[]>
> = {
  MANAGE: [
    {
      accessIdSuffix: "full",
      accessType: "FULL",
    },
  ],
  ADMINISTER: [
    {
      accessIdSuffix: "elevated",
      accessType: "ELEVATED",
    },
  ],
  EDIT: [
    {
      accessIdSuffix: "standard",
      accessType: "STANDARD",
    },
  ],
  VIEW: [
    {
      accessIdSuffix: "read-only",
      accessType: "READ_ONLY",
    },
  ],
};

let cachedRegistry: WorkspaceAccessRegistry[] | null = null;

function cloneEntry(row: WorkspaceAccessRegistry): WorkspaceAccessRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceAccessRegistry[],
): WorkspaceAccessRegistry[] {
  return [...rows].sort((a, b) => {
    const byWs = a.workspaceId.localeCompare(b.workspaceId);
    if (byWs !== 0) return byWs;
    const byMem = a.memberId.localeCompare(b.memberId);
    if (byMem !== 0) return byMem;
    const byRole = a.roleId.localeCompare(b.roleId);
    if (byRole !== 0) return byRole;
    const byPerm = a.permissionId.localeCompare(b.permissionId);
    if (byPerm !== 0) return byPerm;
    return a.accessId.localeCompare(b.accessId);
  });
}

function fingerprint(rows: readonly WorkspaceAccessRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.accessType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromPermissions(
  permissions: readonly WorkspacePermissionRegistry[],
): WorkspaceAccessRegistry[] {
  const rows: WorkspaceAccessRegistry[] = [];
  for (const permission of permissions) {
    const defs =
      ACCESS_DEFS_BY_PERMISSION_TYPE[permission.permissionType] ?? [];
    for (const def of defs) {
      const accessId = `acc-${permission.permissionId}-${def.accessIdSuffix}`;
      const status: WorkspaceAccessStatus =
        permission.status === "ACTIVE" ? "ACTIVE" : permission.status;
      rows.push({
        id: `ep.wsa.reg.${permission.workspaceId}.${permission.memberId}.${permission.roleId}.${permission.permissionId}.${accessId}`,
        workspaceId: permission.workspaceId,
        memberId: permission.memberId,
        roleId: permission.roleId,
        permissionId: permission.permissionId,
        accessId,
        accessType: def.accessType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Access Registry from WP-4 permissions.
 */
export function buildWorkspaceAccessRegistry(): WorkspaceAccessRegistry[] {
  const permissions = getWorkspacePermissionRegistry();
  const out = sortStable(seedFromPermissions(permissions)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceAccessRegistry(): WorkspaceAccessRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceAccessRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceAccessRegistryFingerprint(
  rows?: readonly WorkspaceAccessRegistry[],
): string {
  const list = rows ?? getWorkspaceAccessRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceAccessRegistry(): void {
  cachedRegistry = null;
}
