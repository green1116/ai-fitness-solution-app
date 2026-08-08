/**
 * EP-1 / WP-6 — Enterprise Permission Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-5.
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_ROLE_REGISTRY_BASELINE,
  getRoleRegistry,
  type RoleRegistry,
} from "./role-registry";

export const EP_WP6_ID = "WP-6" as const;
export const PERMISSION_REGISTRY_CAPABILITY = "PermissionRegistry" as const;
export const EP_PERMISSION_REGISTRY_VERSION =
  "ep-1-wp-6-permission-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-5 baseline. */
export const EP_PERMISSION_REGISTRY_BASELINE = EP_ROLE_REGISTRY_BASELINE;

export const PERMISSION_RESOURCES = [
  "organization",
  "department",
  "team",
  "project",
  "report",
] as const;
export type PermissionResource = (typeof PERMISSION_RESOURCES)[number];

export const PERMISSION_ACTIONS = [
  "read",
  "write",
  "approve",
  "admin",
] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type PermissionStatus = (typeof PERMISSION_STATUSES)[number];

export type PermissionRegistry = Readonly<{
  id: string;
  organizationId: string;
  roleId: string;
  permissionId: string;
  permissionName: string;
  resource: PermissionResource;
  action: PermissionAction;
  status: PermissionStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type PermissionSeedDef = Readonly<{
  permissionId: string;
  permissionName: string;
  resource: PermissionResource;
  action: PermissionAction;
  status: PermissionStatus;
}>;

/** Permission templates keyed by WP-5 roleId (intentionally unsorted). */
const PERMISSION_DEFS_BY_ROLE_ID: Readonly<
  Record<string, readonly PermissionSeedDef[]>
> = {
  "role-manager": [
    {
      permissionId: "perm-write-team",
      permissionName: "Write Team",
      resource: "team",
      action: "write",
      status: "ACTIVE",
    },
    {
      permissionId: "perm-approve-project",
      permissionName: "Approve Project",
      resource: "project",
      action: "approve",
      status: "ACTIVE",
    },
    {
      permissionId: "perm-read-report",
      permissionName: "Read Report",
      resource: "report",
      action: "read",
      status: "ACTIVE",
    },
  ],
  "role-member": [
    {
      permissionId: "perm-write-project",
      permissionName: "Write Project",
      resource: "project",
      action: "write",
      status: "ACTIVE",
    },
    {
      permissionId: "perm-read-team",
      permissionName: "Read Team",
      resource: "team",
      action: "read",
      status: "ACTIVE",
    },
  ],
  "role-viewer": [
    {
      permissionId: "perm-read-report",
      permissionName: "Read Report",
      resource: "report",
      action: "read",
      status: "ACTIVE",
    },
    {
      permissionId: "perm-read-department",
      permissionName: "Read Department",
      resource: "department",
      action: "read",
      status: "ACTIVE",
    },
  ],
  "role-specialist": [
    {
      permissionId: "perm-write-project",
      permissionName: "Write Project",
      resource: "project",
      action: "write",
      status: "ACTIVE",
    },
    {
      permissionId: "perm-read-report",
      permissionName: "Read Report",
      resource: "report",
      action: "read",
      status: "ACTIVE",
    },
  ],
  "role-lead": [
    {
      permissionId: "perm-admin-team",
      permissionName: "Admin Team",
      resource: "team",
      action: "admin",
      status: "ACTIVE",
    },
    {
      permissionId: "perm-approve-project",
      permissionName: "Approve Project",
      resource: "project",
      action: "approve",
      status: "ACTIVE",
    },
  ],
  "role-operator": [
    {
      permissionId: "perm-write-project",
      permissionName: "Write Project",
      resource: "project",
      action: "write",
      status: "ACTIVE",
    },
    {
      permissionId: "perm-read-organization",
      permissionName: "Read Organization",
      resource: "organization",
      action: "read",
      status: "ACTIVE",
    },
  ],
  "role-owner": [
    {
      permissionId: "perm-admin-organization",
      permissionName: "Admin Organization",
      resource: "organization",
      action: "admin",
      status: "ACTIVE",
    },
    {
      permissionId: "perm-approve-project",
      permissionName: "Approve Project",
      resource: "project",
      action: "approve",
      status: "ACTIVE",
    },
    {
      permissionId: "perm-read-report",
      permissionName: "Read Report",
      resource: "report",
      action: "read",
      status: "ACTIVE",
    },
  ],
};

let cachedRegistry: PermissionRegistry[] | null = null;

function cloneEntry(row: PermissionRegistry): PermissionRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly PermissionRegistry[],
): PermissionRegistry[] {
  return [...rows].sort((a, b) => {
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    const byRole = a.roleId.localeCompare(b.roleId);
    if (byRole !== 0) return byRole;
    return a.permissionId.localeCompare(b.permissionId);
  });
}

function fingerprint(rows: readonly PermissionRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.permissionName}|${r.resource}|${r.action}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

/** Unique (organizationId, roleId) pairs from WP-5 roles. */
function uniqueOrgRoles(
  roles: readonly RoleRegistry[],
): Array<{ organizationId: string; roleId: string }> {
  const seen = new Set<string>();
  const out: Array<{ organizationId: string; roleId: string }> = [];
  for (const role of roles) {
    const key = `${role.organizationId}|${role.roleId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      organizationId: role.organizationId,
      roleId: role.roleId,
    });
  }
  return out;
}

function seedFromRoles(
  roles: readonly RoleRegistry[],
): PermissionRegistry[] {
  const rows: PermissionRegistry[] = [];
  for (const pair of uniqueOrgRoles(roles)) {
    const defs = PERMISSION_DEFS_BY_ROLE_ID[pair.roleId] ?? [];
    for (const def of defs) {
      rows.push({
        id: `ep.perm.reg.${pair.organizationId}.${pair.roleId}.${def.permissionId}`,
        organizationId: pair.organizationId,
        roleId: pair.roleId,
        permissionId: def.permissionId,
        permissionName: def.permissionName,
        resource: def.resource,
        action: def.action,
        status: def.status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Permission Registry from WP-5 role data.
 */
export function buildPermissionRegistry(): PermissionRegistry[] {
  const roles = getRoleRegistry();
  const out = sortStable(seedFromRoles(roles)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getPermissionRegistry(): PermissionRegistry[] {
  if (!cachedRegistry) {
    return buildPermissionRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function permissionRegistryFingerprint(
  rows?: readonly PermissionRegistry[],
): string {
  const list = rows ?? getPermissionRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only (seed is derived from WP-5). */
export function clearPermissionRegistry(): void {
  cachedRegistry = null;
}
