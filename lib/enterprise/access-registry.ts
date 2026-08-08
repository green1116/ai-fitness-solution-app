/**
 * EP-1 / WP-8 — Enterprise Access Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-7.
 * Derives from Membership (WP-7) + Permission (WP-6).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_MEMBERSHIP_REGISTRY_BASELINE,
  getMembershipRegistry,
  type MembershipRegistry,
  type MembershipStatus,
} from "./membership-registry";
import {
  getPermissionRegistry,
  type PermissionAction,
  type PermissionRegistry,
  type PermissionResource,
  type PermissionStatus,
} from "./permission-registry";

export const EP_WP8_ID = "WP-8" as const;
export const ACCESS_REGISTRY_CAPABILITY = "AccessRegistry" as const;
export const EP_ACCESS_REGISTRY_VERSION = "ep-1-wp-8-access-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-7 baseline. */
export const EP_ACCESS_REGISTRY_BASELINE = EP_MEMBERSHIP_REGISTRY_BASELINE;

export const ACCESS_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type AccessStatus = (typeof ACCESS_STATUSES)[number];

export type AccessRegistry = Readonly<{
  id: string;
  organizationId: string;
  departmentId: string;
  teamId: string;
  userId: string;
  roleId: string;
  permissionId: string;
  resource: PermissionResource;
  action: PermissionAction;
  status: AccessStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

let cachedRegistry: AccessRegistry[] | null = null;

function cloneEntry(row: AccessRegistry): AccessRegistry {
  return { ...row };
}

function sortStable(rows: readonly AccessRegistry[]): AccessRegistry[] {
  return [...rows].sort((a, b) => {
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    const byDept = a.departmentId.localeCompare(b.departmentId);
    if (byDept !== 0) return byDept;
    const byTeam = a.teamId.localeCompare(b.teamId);
    if (byTeam !== 0) return byTeam;
    const byUser = a.userId.localeCompare(b.userId);
    if (byUser !== 0) return byUser;
    const byRole = a.roleId.localeCompare(b.roleId);
    if (byRole !== 0) return byRole;
    return a.permissionId.localeCompare(b.permissionId);
  });
}

function fingerprint(rows: readonly AccessRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.departmentId}|${r.teamId}|${r.userId}|${r.roleId}|${r.permissionId}|${r.resource}|${r.action}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function resolveAccessStatus(
  membershipStatus: MembershipStatus,
  permissionStatus: PermissionStatus,
): AccessStatus {
  if (membershipStatus === "SUSPENDED" || permissionStatus === "SUSPENDED") {
    return "SUSPENDED";
  }
  if (membershipStatus === "INACTIVE" || permissionStatus === "INACTIVE") {
    return "INACTIVE";
  }
  return "ACTIVE";
}

function seedFromMembershipAndPermission(
  memberships: readonly MembershipRegistry[],
  permissions: readonly PermissionRegistry[],
): AccessRegistry[] {
  const permsByOrgRole = new Map<string, PermissionRegistry[]>();
  for (const perm of permissions) {
    const key = `${perm.organizationId}|${perm.roleId}`;
    const list = permsByOrgRole.get(key) ?? [];
    list.push(perm);
    permsByOrgRole.set(key, list);
  }

  const rows: AccessRegistry[] = [];
  for (const membership of memberships) {
    const key = `${membership.organizationId}|${membership.roleId}`;
    const perms = permsByOrgRole.get(key) ?? [];
    for (const perm of perms) {
      rows.push({
        id: `ep.access.reg.${membership.organizationId}.${membership.departmentId}.${membership.teamId}.${membership.userId}.${membership.roleId}.${perm.permissionId}`,
        organizationId: membership.organizationId,
        departmentId: membership.departmentId,
        teamId: membership.teamId,
        userId: membership.userId,
        roleId: membership.roleId,
        permissionId: perm.permissionId,
        resource: perm.resource,
        action: perm.action,
        status: resolveAccessStatus(membership.status, perm.status),
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Access Registry from WP-7 membership + WP-6 permission.
 */
export function buildAccessRegistry(): AccessRegistry[] {
  const memberships = getMembershipRegistry();
  const permissions = getPermissionRegistry();
  const out = sortStable(
    seedFromMembershipAndPermission(memberships, permissions),
  ).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getAccessRegistry(): AccessRegistry[] {
  if (!cachedRegistry) {
    return buildAccessRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function accessRegistryFingerprint(
  rows?: readonly AccessRegistry[],
): string {
  const list = rows ?? getAccessRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearAccessRegistry(): void {
  cachedRegistry = null;
}
