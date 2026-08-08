/**
 * EP-1 / WP-5 — Enterprise Role Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1/WP-2/WP-3/WP-4.
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_TEAM_REGISTRY_BASELINE,
  getTeamRegistry,
  type TeamRegistry,
  type TeamType,
} from "./team-registry";

export const EP_WP5_ID = "WP-5" as const;
export const ROLE_REGISTRY_CAPABILITY = "RoleRegistry" as const;
export const EP_ROLE_REGISTRY_VERSION = "ep-1-wp-5-role-registry-1" as const;
/** Reuses Pilot GA + WP-1/WP-2/WP-3/WP-4 baseline. */
export const EP_ROLE_REGISTRY_BASELINE = EP_TEAM_REGISTRY_BASELINE;

export const ROLE_TYPES = [
  "ADMINISTRATIVE",
  "OPERATIONAL",
  "ADVISORY",
  "TECHNICAL",
] as const;
export type RoleType = (typeof ROLE_TYPES)[number];

export const ROLE_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type RoleStatus = (typeof ROLE_STATUSES)[number];

export type RoleRegistry = Readonly<{
  id: string;
  organizationId: string;
  departmentId: string;
  teamId: string;
  roleId: string;
  roleName: string;
  roleType: RoleType;
  status: RoleStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type RoleSeedDef = Readonly<{
  roleId: string;
  roleName: string;
  roleType: RoleType;
  status: RoleStatus;
}>;

/** Role templates keyed by WP-3 teamType (intentionally unsorted roleIds). */
const ROLE_DEFS_BY_TEAM_TYPE: Readonly<
  Record<TeamType, readonly RoleSeedDef[]>
> = {
  CORE: [
    {
      roleId: "role-member",
      roleName: "Core Member",
      roleType: "OPERATIONAL",
      status: "ACTIVE",
    },
    {
      roleId: "role-manager",
      roleName: "Core Manager",
      roleType: "ADMINISTRATIVE",
      status: "ACTIVE",
    },
  ],
  SUPPORT: [
    {
      roleId: "role-viewer",
      roleName: "Support Viewer",
      roleType: "ADVISORY",
      status: "ACTIVE",
    },
    {
      roleId: "role-member",
      roleName: "Support Member",
      roleType: "OPERATIONAL",
      status: "ACTIVE",
    },
  ],
  SPECIALIST: [
    {
      roleId: "role-specialist",
      roleName: "Domain Specialist",
      roleType: "TECHNICAL",
      status: "ACTIVE",
    },
    {
      roleId: "role-lead",
      roleName: "Specialist Lead",
      roleType: "ADMINISTRATIVE",
      status: "ACTIVE",
    },
  ],
  FIELD: [
    {
      roleId: "role-operator",
      roleName: "Field Operator",
      roleType: "OPERATIONAL",
      status: "ACTIVE",
    },
    {
      roleId: "role-owner",
      roleName: "Field Owner",
      roleType: "ADMINISTRATIVE",
      status: "ACTIVE",
    },
  ],
};

let cachedRegistry: RoleRegistry[] | null = null;

function cloneEntry(row: RoleRegistry): RoleRegistry {
  return { ...row };
}

function sortStable(rows: readonly RoleRegistry[]): RoleRegistry[] {
  return [...rows].sort((a, b) => {
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    const byDept = a.departmentId.localeCompare(b.departmentId);
    if (byDept !== 0) return byDept;
    const byTeam = a.teamId.localeCompare(b.teamId);
    if (byTeam !== 0) return byTeam;
    return a.roleId.localeCompare(b.roleId);
  });
}

function fingerprint(rows: readonly RoleRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.departmentId}|${r.teamId}|${r.roleId}|${r.roleName}|${r.roleType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromTeams(teams: readonly TeamRegistry[]): RoleRegistry[] {
  const rows: RoleRegistry[] = [];
  for (const team of teams) {
    const defs = ROLE_DEFS_BY_TEAM_TYPE[team.teamType] ?? [];
    for (const def of defs) {
      rows.push({
        id: `ep.role.reg.${team.organizationId}.${team.departmentId}.${team.teamId}.${def.roleId}`,
        organizationId: team.organizationId,
        departmentId: team.departmentId,
        teamId: team.teamId,
        roleId: def.roleId,
        roleName: def.roleName,
        roleType: def.roleType,
        status: def.status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Role Registry from WP-1/WP-2/WP-3 team data.
 */
export function buildRoleRegistry(): RoleRegistry[] {
  const teams = getTeamRegistry();
  const out = sortStable(seedFromTeams(teams)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getRoleRegistry(): RoleRegistry[] {
  if (!cachedRegistry) {
    return buildRoleRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function roleRegistryFingerprint(
  rows?: readonly RoleRegistry[],
): string {
  const list = rows ?? getRoleRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only (seed is derived from WP-3). */
export function clearRoleRegistry(): void {
  cachedRegistry = null;
}
