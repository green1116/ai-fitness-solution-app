/**
 * EP-1 / WP-1 — Enterprise Organization Registry
 * Deterministic read-only registry. Baseline: v80-pilot-ga-1.0.0.
 * No DB writes, no Project/Quote/Tender changes.
 */

import {
  PILOT_GA_RELEASE_DATE,
  PILOT_GA_VERSION,
} from "@/lib/pilot/v80/intake/ga-release.schema";

export const EP_1_ID = "EP-1" as const;
export const EP_WP1_ID = "WP-1" as const;
export const ORGANIZATION_REGISTRY_CAPABILITY = "OrganizationRegistry" as const;
export const EP_ORGANIZATION_REGISTRY_VERSION =
  "ep-1-wp-1-organization-registry-1" as const;
/** Frozen Pilot GA baseline — EP reuses this only. */
export const EP_ORGANIZATION_REGISTRY_BASELINE = PILOT_GA_VERSION;

/** Aligns with SaaS Organization subscription plans (BASIC | PRO | ENTERPRISE). */
export const ORGANIZATION_TIERS = ["BASIC", "PRO", "ENTERPRISE"] as const;
export type OrganizationTier = (typeof ORGANIZATION_TIERS)[number];

export const ORGANIZATION_TYPES = [
  "OPERATOR",
  "ENTERPRISE",
  "PARTNER",
] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const ORGANIZATION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

export type OrganizationRegistry = Readonly<{
  id: string;
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  tier: OrganizationTier;
  status: OrganizationStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

/**
 * Seed catalog mirrors SaaS org + plan vocabulary (no Prisma / migration).
 * Stable ids; fixed createdAt from Pilot GA freeze date.
 */
const ORGANIZATION_SEED: readonly OrganizationRegistry[] = [
  {
    id: "ep.org.reg.basic",
    organizationId: "org-ep-basic",
    organizationName: "EP Basic Organization",
    organizationType: "OPERATOR",
    tier: "BASIC",
    status: "ACTIVE",
    createdAt: REGISTRY_CREATED_AT,
  },
  {
    id: "ep.org.reg.enterprise",
    organizationId: "org-ep-enterprise",
    organizationName: "EP Enterprise Organization",
    organizationType: "ENTERPRISE",
    tier: "ENTERPRISE",
    status: "ACTIVE",
    createdAt: REGISTRY_CREATED_AT,
  },
  {
    id: "ep.org.reg.partner",
    organizationId: "org-ep-partner",
    organizationName: "EP Partner Organization",
    organizationType: "PARTNER",
    tier: "PRO",
    status: "ACTIVE",
    createdAt: REGISTRY_CREATED_AT,
  },
  {
    id: "ep.org.reg.pro",
    organizationId: "org-ep-pro",
    organizationName: "EP Pro Organization",
    organizationType: "OPERATOR",
    tier: "PRO",
    status: "ACTIVE",
    createdAt: REGISTRY_CREATED_AT,
  },
];

let cachedRegistry: OrganizationRegistry[] | null = null;

function cloneEntry(row: OrganizationRegistry): OrganizationRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly OrganizationRegistry[],
): OrganizationRegistry[] {
  return [...rows].sort((a, b) => {
    const byId = a.id.localeCompare(b.id);
    if (byId !== 0) return byId;
    return a.organizationId.localeCompare(b.organizationId);
  });
}

function fingerprint(rows: readonly OrganizationRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.organizationName}|${r.organizationType}|${r.tier}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

/**
 * Build the deterministic Organization Registry (read-only snapshot).
 */
export function buildOrganizationRegistry(): OrganizationRegistry[] {
  const out = sortStable(ORGANIZATION_SEED).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getOrganizationRegistry(): OrganizationRegistry[] {
  if (!cachedRegistry) {
    return buildOrganizationRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function organizationRegistryFingerprint(
  rows?: readonly OrganizationRegistry[],
): string {
  const list = rows ?? getOrganizationRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only (seed is immutable). */
export function clearOrganizationRegistry(): void {
  cachedRegistry = null;
}
