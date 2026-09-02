/**
 * Runtime Ops ↔ CRM Identity Registry v1 — read-only explicit sidecar.
 *
 * Deterministic in-memory seed mappings only. No DB, no name heuristics.
 * Does not mutate EADS/EAC/EWAS or frozen Runtime Ops projections.
 */

import { createHash } from "node:crypto";

export const RUNTIME_OPS_CRM_IDENTITY_REGISTRY_VERSION =
  "runtime-ops-crm-identity-registry-1" as const;

/** Verify / integration org id — created by verify scripts with this exact id. */
export const RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID =
  "org-runtime-ops-crm-identity-v1" as const;

/** PG-2.1 lifecycle seed customer id used for verify mapping. */
export const RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID =
  "cust-pg21-active-01" as const;

/** Explicit CRM customer id bound to the verify mapping. */
export const RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID =
  "crm-ops-link-v1-active-01" as const;

export type OpsCrmIdentityLink = Readonly<{
  organizationId: string;
  opsCustomerId: string;
  crmCustomerId: string;
}>;

const EXPLICIT_IDENTITY_SEEDS: readonly OpsCrmIdentityLink[] = [
  {
    organizationId: RUNTIME_OPS_CRM_IDENTITY_VERIFY_ORG_ID,
    opsCustomerId: RUNTIME_OPS_CRM_IDENTITY_VERIFY_OPS_CUSTOMER_ID,
    crmCustomerId: RUNTIME_OPS_CRM_IDENTITY_VERIFY_CRM_CUSTOMER_ID,
  },
] as const;

function trimId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function linkKey(organizationId: string, opsCustomerId: string): string {
  return `${organizationId}\0${opsCustomerId}`;
}

const seedIndex = new Map<string, string>(
  EXPLICIT_IDENTITY_SEEDS.map((link) => [
    linkKey(link.organizationId, link.opsCustomerId),
    link.crmCustomerId,
  ]),
);

export function listOpsCrmIdentitySeeds(): readonly OpsCrmIdentityLink[] {
  return EXPLICIT_IDENTITY_SEEDS.map((link) => ({ ...link }));
}

/**
 * Resolve explicit seed mapping only. No inference or name matching.
 */
export function lookupOpsCrmIdentitySeed(
  organizationId: string,
  opsCustomerId: string,
): string | null {
  const orgId = trimId(organizationId);
  const opsId = trimId(opsCustomerId);
  if (!orgId || !opsId) return null;
  return seedIndex.get(linkKey(orgId, opsId)) ?? null;
}

export function runtimeOpsCrmIdentityRegistryFingerprint(): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: RUNTIME_OPS_CRM_IDENTITY_REGISTRY_VERSION,
        links: EXPLICIT_IDENTITY_SEEDS,
      }),
    )
    .digest("hex");
}
