/**
 * EP-1 / WP-2 — Enterprise Department Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1.
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_ORGANIZATION_REGISTRY_BASELINE,
  getOrganizationRegistry,
  type OrganizationRegistry,
} from "./organization-registry";

export const EP_WP2_ID = "WP-2" as const;
export const DEPARTMENT_REGISTRY_CAPABILITY = "DepartmentRegistry" as const;
export const EP_DEPARTMENT_REGISTRY_VERSION =
  "ep-1-wp-2-department-registry-1" as const;
/** Reuses Pilot GA + WP-1 organization baseline. */
export const EP_DEPARTMENT_REGISTRY_BASELINE =
  EP_ORGANIZATION_REGISTRY_BASELINE;

export const DEPARTMENT_TYPES = [
  "OPERATIONS",
  "SALES",
  "ENGINEERING",
  "FINANCE",
  "COMPLIANCE",
] as const;
export type DepartmentType = (typeof DEPARTMENT_TYPES)[number];

export const DEPARTMENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type DepartmentStatus = (typeof DEPARTMENT_STATUSES)[number];

export type DepartmentRegistry = Readonly<{
  id: string;
  organizationId: string;
  departmentId: string;
  departmentName: string;
  departmentType: DepartmentType;
  status: DepartmentStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type DepartmentSeedDef = Readonly<{
  departmentId: string;
  departmentName: string;
  departmentType: DepartmentType;
  status: DepartmentStatus;
}>;

/** Per-org department templates (applied to WP-1 organizations). */
const DEPARTMENT_DEFS_BY_ORG: Readonly<
  Record<string, readonly DepartmentSeedDef[]>
> = {
  "org-ep-basic": [
    {
      departmentId: "dept-ops",
      departmentName: "Operations",
      departmentType: "OPERATIONS",
      status: "ACTIVE",
    },
    {
      departmentId: "dept-sales",
      departmentName: "Sales",
      departmentType: "SALES",
      status: "ACTIVE",
    },
  ],
  "org-ep-pro": [
    {
      departmentId: "dept-sales",
      departmentName: "Sales",
      departmentType: "SALES",
      status: "ACTIVE",
    },
    {
      departmentId: "dept-engineering",
      departmentName: "Engineering",
      departmentType: "ENGINEERING",
      status: "ACTIVE",
    },
    {
      departmentId: "dept-ops",
      departmentName: "Operations",
      departmentType: "OPERATIONS",
      status: "ACTIVE",
    },
  ],
  "org-ep-enterprise": [
    {
      departmentId: "dept-compliance",
      departmentName: "Compliance",
      departmentType: "COMPLIANCE",
      status: "ACTIVE",
    },
    {
      departmentId: "dept-finance",
      departmentName: "Finance",
      departmentType: "FINANCE",
      status: "ACTIVE",
    },
    {
      departmentId: "dept-engineering",
      departmentName: "Engineering",
      departmentType: "ENGINEERING",
      status: "ACTIVE",
    },
    {
      departmentId: "dept-ops",
      departmentName: "Operations",
      departmentType: "OPERATIONS",
      status: "ACTIVE",
    },
  ],
  "org-ep-partner": [
    {
      departmentId: "dept-sales",
      departmentName: "Partner Sales",
      departmentType: "SALES",
      status: "ACTIVE",
    },
  ],
};

let cachedRegistry: DepartmentRegistry[] | null = null;

function cloneEntry(row: DepartmentRegistry): DepartmentRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly DepartmentRegistry[],
): DepartmentRegistry[] {
  return [...rows].sort((a, b) => {
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    return a.departmentId.localeCompare(b.departmentId);
  });
}

function fingerprint(rows: readonly DepartmentRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.departmentId}|${r.departmentName}|${r.departmentType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromOrganizations(
  orgs: readonly OrganizationRegistry[],
): DepartmentRegistry[] {
  const rows: DepartmentRegistry[] = [];
  for (const org of orgs) {
    const defs = DEPARTMENT_DEFS_BY_ORG[org.organizationId] ?? [];
    for (const def of defs) {
      rows.push({
        id: `ep.dept.reg.${org.organizationId}.${def.departmentId}`,
        organizationId: org.organizationId,
        departmentId: def.departmentId,
        departmentName: def.departmentName,
        departmentType: def.departmentType,
        status: def.status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Department Registry from WP-1 organizations.
 */
export function buildDepartmentRegistry(): DepartmentRegistry[] {
  const orgs = getOrganizationRegistry();
  const out = sortStable(seedFromOrganizations(orgs)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getDepartmentRegistry(): DepartmentRegistry[] {
  if (!cachedRegistry) {
    return buildDepartmentRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function departmentRegistryFingerprint(
  rows?: readonly DepartmentRegistry[],
): string {
  const list = rows ?? getDepartmentRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only (seed is derived from WP-1). */
export function clearDepartmentRegistry(): void {
  cachedRegistry = null;
}
