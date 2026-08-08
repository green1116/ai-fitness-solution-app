/**
 * EP-1 / WP-3 — Enterprise Team Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1/WP-2.
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_DEPARTMENT_REGISTRY_BASELINE,
  getDepartmentRegistry,
  type DepartmentRegistry,
  type DepartmentType,
} from "./department-registry";

export const EP_WP3_ID = "WP-3" as const;
export const TEAM_REGISTRY_CAPABILITY = "TeamRegistry" as const;
export const EP_TEAM_REGISTRY_VERSION = "ep-1-wp-3-team-registry-1" as const;
/** Reuses Pilot GA + WP-1/WP-2 baseline. */
export const EP_TEAM_REGISTRY_BASELINE = EP_DEPARTMENT_REGISTRY_BASELINE;

export const TEAM_TYPES = [
  "CORE",
  "SUPPORT",
  "SPECIALIST",
  "FIELD",
] as const;
export type TeamType = (typeof TEAM_TYPES)[number];

export const TEAM_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];

export type TeamRegistry = Readonly<{
  id: string;
  organizationId: string;
  departmentId: string;
  teamId: string;
  teamName: string;
  teamType: TeamType;
  status: TeamStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type TeamSeedDef = Readonly<{
  teamId: string;
  teamName: string;
  teamType: TeamType;
  status: TeamStatus;
}>;

/** Team templates keyed by WP-2 departmentType (intentionally unsorted ids). */
const TEAM_DEFS_BY_DEPT_TYPE: Readonly<
  Record<DepartmentType, readonly TeamSeedDef[]>
> = {
  OPERATIONS: [
    {
      teamId: "team-field",
      teamName: "Field Ops",
      teamType: "FIELD",
      status: "ACTIVE",
    },
    {
      teamId: "team-core",
      teamName: "Core Ops",
      teamType: "CORE",
      status: "ACTIVE",
    },
  ],
  SALES: [
    {
      teamId: "team-support",
      teamName: "Sales Support",
      teamType: "SUPPORT",
      status: "ACTIVE",
    },
    {
      teamId: "team-core",
      teamName: "Core Sales",
      teamType: "CORE",
      status: "ACTIVE",
    },
  ],
  ENGINEERING: [
    {
      teamId: "team-specialist",
      teamName: "Platform Specialists",
      teamType: "SPECIALIST",
      status: "ACTIVE",
    },
    {
      teamId: "team-core",
      teamName: "Core Engineering",
      teamType: "CORE",
      status: "ACTIVE",
    },
  ],
  FINANCE: [
    {
      teamId: "team-core",
      teamName: "Core Finance",
      teamType: "CORE",
      status: "ACTIVE",
    },
  ],
  COMPLIANCE: [
    {
      teamId: "team-specialist",
      teamName: "Compliance Specialists",
      teamType: "SPECIALIST",
      status: "ACTIVE",
    },
    {
      teamId: "team-core",
      teamName: "Core Compliance",
      teamType: "CORE",
      status: "ACTIVE",
    },
  ],
};

let cachedRegistry: TeamRegistry[] | null = null;

function cloneEntry(row: TeamRegistry): TeamRegistry {
  return { ...row };
}

function sortStable(rows: readonly TeamRegistry[]): TeamRegistry[] {
  return [...rows].sort((a, b) => {
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    const byDept = a.departmentId.localeCompare(b.departmentId);
    if (byDept !== 0) return byDept;
    return a.teamId.localeCompare(b.teamId);
  });
}

function fingerprint(rows: readonly TeamRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.departmentId}|${r.teamId}|${r.teamName}|${r.teamType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromDepartments(
  departments: readonly DepartmentRegistry[],
): TeamRegistry[] {
  const rows: TeamRegistry[] = [];
  for (const dept of departments) {
    const defs = TEAM_DEFS_BY_DEPT_TYPE[dept.departmentType] ?? [];
    for (const def of defs) {
      rows.push({
        id: `ep.team.reg.${dept.organizationId}.${dept.departmentId}.${def.teamId}`,
        organizationId: dept.organizationId,
        departmentId: dept.departmentId,
        teamId: def.teamId,
        teamName: def.teamName,
        teamType: def.teamType,
        status: def.status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Team Registry from WP-1/WP-2 org + department data.
 */
export function buildTeamRegistry(): TeamRegistry[] {
  const departments = getDepartmentRegistry();
  const out = sortStable(seedFromDepartments(departments)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getTeamRegistry(): TeamRegistry[] {
  if (!cachedRegistry) {
    return buildTeamRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function teamRegistryFingerprint(
  rows?: readonly TeamRegistry[],
): string {
  const list = rows ?? getTeamRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only (seed is derived from WP-2). */
export function clearTeamRegistry(): void {
  cachedRegistry = null;
}
