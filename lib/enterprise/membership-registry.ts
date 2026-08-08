/**
 * EP-1 / WP-7 — Enterprise Membership Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-6.
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_PERMISSION_REGISTRY_BASELINE,
} from "./permission-registry";
import {
  getRoleRegistry,
  type RoleRegistry,
} from "./role-registry";
import {
  getUserRegistry,
  type UserRegistry,
  type UserRole,
} from "./user-registry";

export const EP_WP7_ID = "WP-7" as const;
export const MEMBERSHIP_REGISTRY_CAPABILITY = "MembershipRegistry" as const;
export const EP_MEMBERSHIP_REGISTRY_VERSION =
  "ep-1-wp-7-membership-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-6 baseline. */
export const EP_MEMBERSHIP_REGISTRY_BASELINE =
  EP_PERMISSION_REGISTRY_BASELINE;

export const MEMBERSHIP_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export type MembershipRegistry = Readonly<{
  id: string;
  organizationId: string;
  departmentId: string;
  teamId: string;
  userId: string;
  roleId: string;
  status: MembershipStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

/** Preferred roleId candidates per WP-4 userRole (first match on team wins). */
const PREFERRED_ROLE_IDS: Readonly<Record<UserRole, readonly string[]>> = {
  OWNER: ["role-owner", "role-manager", "role-lead"],
  MANAGER: ["role-manager", "role-lead", "role-owner"],
  MEMBER: ["role-member", "role-specialist", "role-operator"],
  VIEWER: ["role-viewer", "role-member"],
};

let cachedRegistry: MembershipRegistry[] | null = null;

function cloneEntry(row: MembershipRegistry): MembershipRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly MembershipRegistry[],
): MembershipRegistry[] {
  return [...rows].sort((a, b) => {
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    const byDept = a.departmentId.localeCompare(b.departmentId);
    if (byDept !== 0) return byDept;
    const byTeam = a.teamId.localeCompare(b.teamId);
    if (byTeam !== 0) return byTeam;
    const byUser = a.userId.localeCompare(b.userId);
    if (byUser !== 0) return byUser;
    return a.roleId.localeCompare(b.roleId);
  });
}

function fingerprint(rows: readonly MembershipRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.departmentId}|${r.teamId}|${r.userId}|${r.roleId}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function teamKey(row: {
  organizationId: string;
  departmentId: string;
  teamId: string;
}): string {
  return `${row.organizationId}|${row.departmentId}|${row.teamId}`;
}

function resolveRoleId(
  user: UserRegistry,
  rolesOnTeam: readonly RoleRegistry[],
): string | null {
  if (rolesOnTeam.length === 0) return null;
  const available = new Set(rolesOnTeam.map((r) => r.roleId));
  for (const roleId of PREFERRED_ROLE_IDS[user.userRole]) {
    if (available.has(roleId)) return roleId;
  }
  const sorted = [...rolesOnTeam].sort((a, b) =>
    a.roleId.localeCompare(b.roleId),
  );
  return sorted[0]?.roleId ?? null;
}

function seedFromUsersAndRoles(
  users: readonly UserRegistry[],
  roles: readonly RoleRegistry[],
): MembershipRegistry[] {
  const rolesByTeam = new Map<string, RoleRegistry[]>();
  for (const role of roles) {
    const key = teamKey(role);
    const list = rolesByTeam.get(key) ?? [];
    list.push(role);
    rolesByTeam.set(key, list);
  }

  const rows: MembershipRegistry[] = [];
  for (const user of users) {
    const rolesOnTeam = rolesByTeam.get(teamKey(user)) ?? [];
    const roleId = resolveRoleId(user, rolesOnTeam);
    if (!roleId) continue;

    const status: MembershipStatus =
      user.status === "ACTIVE" ? "ACTIVE" : user.status;

    rows.push({
      id: `ep.membership.reg.${user.organizationId}.${user.departmentId}.${user.teamId}.${user.userId}.${roleId}`,
      organizationId: user.organizationId,
      departmentId: user.departmentId,
      teamId: user.teamId,
      userId: user.userId,
      roleId,
      status,
      createdAt: REGISTRY_CREATED_AT,
    });
  }
  return rows;
}

/**
 * Build the deterministic Membership Registry from WP-4 users + WP-5 roles.
 */
export function buildMembershipRegistry(): MembershipRegistry[] {
  const users = getUserRegistry();
  const roles = getRoleRegistry();
  const out = sortStable(seedFromUsersAndRoles(users, roles)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getMembershipRegistry(): MembershipRegistry[] {
  if (!cachedRegistry) {
    return buildMembershipRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function membershipRegistryFingerprint(
  rows?: readonly MembershipRegistry[],
): string {
  const list = rows ?? getMembershipRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearMembershipRegistry(): void {
  cachedRegistry = null;
}
