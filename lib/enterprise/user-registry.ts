/**
 * EP-1 / WP-4 — Enterprise User Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1/WP-2/WP-3.
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_TEAM_REGISTRY_BASELINE,
  getTeamRegistry,
  type TeamRegistry,
  type TeamType,
} from "./team-registry";

export const EP_WP4_ID = "WP-4" as const;
export const USER_REGISTRY_CAPABILITY = "UserRegistry" as const;
export const EP_USER_REGISTRY_VERSION = "ep-1-wp-4-user-registry-1" as const;
/** Reuses Pilot GA + WP-1/WP-2/WP-3 baseline. */
export const EP_USER_REGISTRY_BASELINE = EP_TEAM_REGISTRY_BASELINE;

export const USER_ROLES = [
  "OWNER",
  "MANAGER",
  "MEMBER",
  "VIEWER",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export type UserRegistry = Readonly<{
  id: string;
  organizationId: string;
  departmentId: string;
  teamId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  status: UserStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type UserSeedDef = Readonly<{
  userId: string;
  userName: string;
  userRole: UserRole;
  status: UserStatus;
}>;

/** User templates keyed by WP-3 teamType (intentionally unsorted userIds). */
const USER_DEFS_BY_TEAM_TYPE: Readonly<
  Record<TeamType, readonly UserSeedDef[]>
> = {
  CORE: [
    {
      userId: "user-member",
      userName: "Core Member",
      userRole: "MEMBER",
      status: "ACTIVE",
    },
    {
      userId: "user-manager",
      userName: "Core Manager",
      userRole: "MANAGER",
      status: "ACTIVE",
    },
  ],
  SUPPORT: [
    {
      userId: "user-viewer",
      userName: "Support Viewer",
      userRole: "VIEWER",
      status: "ACTIVE",
    },
    {
      userId: "user-member",
      userName: "Support Member",
      userRole: "MEMBER",
      status: "ACTIVE",
    },
  ],
  SPECIALIST: [
    {
      userId: "user-specialist",
      userName: "Domain Specialist",
      userRole: "MEMBER",
      status: "ACTIVE",
    },
    {
      userId: "user-manager",
      userName: "Specialist Lead",
      userRole: "MANAGER",
      status: "ACTIVE",
    },
  ],
  FIELD: [
    {
      userId: "user-field",
      userName: "Field Operator",
      userRole: "MEMBER",
      status: "ACTIVE",
    },
    {
      userId: "user-owner",
      userName: "Field Owner",
      userRole: "OWNER",
      status: "ACTIVE",
    },
  ],
};

let cachedRegistry: UserRegistry[] | null = null;

function cloneEntry(row: UserRegistry): UserRegistry {
  return { ...row };
}

function sortStable(rows: readonly UserRegistry[]): UserRegistry[] {
  return [...rows].sort((a, b) => {
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    const byDept = a.departmentId.localeCompare(b.departmentId);
    if (byDept !== 0) return byDept;
    const byTeam = a.teamId.localeCompare(b.teamId);
    if (byTeam !== 0) return byTeam;
    return a.userId.localeCompare(b.userId);
  });
}

function fingerprint(rows: readonly UserRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.departmentId}|${r.teamId}|${r.userId}|${r.userName}|${r.userRole}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromTeams(teams: readonly TeamRegistry[]): UserRegistry[] {
  const rows: UserRegistry[] = [];
  for (const team of teams) {
    const defs = USER_DEFS_BY_TEAM_TYPE[team.teamType] ?? [];
    for (const def of defs) {
      rows.push({
        id: `ep.user.reg.${team.organizationId}.${team.departmentId}.${team.teamId}.${def.userId}`,
        organizationId: team.organizationId,
        departmentId: team.departmentId,
        teamId: team.teamId,
        userId: def.userId,
        userName: def.userName,
        userRole: def.userRole,
        status: def.status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic User Registry from WP-1/WP-2/WP-3 data.
 */
export function buildUserRegistry(): UserRegistry[] {
  const teams = getTeamRegistry();
  const out = sortStable(seedFromTeams(teams)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getUserRegistry(): UserRegistry[] {
  if (!cachedRegistry) {
    return buildUserRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function userRegistryFingerprint(
  rows?: readonly UserRegistry[],
): string {
  const list = rows ?? getUserRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only (seed is derived from WP-3). */
export function clearUserRegistry(): void {
  cachedRegistry = null;
}
