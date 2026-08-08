/**
 * EP-1 / WP-9 — Enterprise Policy Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-8.
 * Derives from Permission (WP-6).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import { EP_ACCESS_REGISTRY_BASELINE } from "./access-registry";
import {
  getPermissionRegistry,
  type PermissionAction,
  type PermissionRegistry,
} from "./permission-registry";

export const EP_WP9_ID = "WP-9" as const;
export const POLICY_REGISTRY_CAPABILITY = "PolicyRegistry" as const;
export const EP_POLICY_REGISTRY_VERSION = "ep-1-wp-9-policy-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-8 baseline. */
export const EP_POLICY_REGISTRY_BASELINE = EP_ACCESS_REGISTRY_BASELINE;

export const POLICY_EFFECTS = ["ALLOW", "DENY"] as const;
export type PolicyEffect = (typeof POLICY_EFFECTS)[number];

export const POLICY_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type PolicyStatus = (typeof POLICY_STATUSES)[number];

export type PolicyRegistry = Readonly<{
  id: string;
  organizationId: string;
  roleId: string;
  permissionId: string;
  policyId: string;
  policyName: string;
  effect: PolicyEffect;
  status: PolicyStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type PolicySeedDef = Readonly<{
  policyIdSuffix: string;
  policyName: string;
  effect: PolicyEffect;
}>;

/** Extra policy templates per permission action (intentionally unsorted). */
const POLICY_DEFS_BY_ACTION: Readonly<
  Record<PermissionAction, readonly PolicySeedDef[]>
> = {
  read: [
    {
      policyIdSuffix: "allow-read",
      policyName: "Allow Read",
      effect: "ALLOW",
    },
  ],
  write: [
    {
      policyIdSuffix: "deny-anon",
      policyName: "Deny Anonymous Write",
      effect: "DENY",
    },
    {
      policyIdSuffix: "allow-write",
      policyName: "Allow Write",
      effect: "ALLOW",
    },
  ],
  approve: [
    {
      policyIdSuffix: "allow-approve",
      policyName: "Allow Approve",
      effect: "ALLOW",
    },
  ],
  admin: [
    {
      policyIdSuffix: "deny-escalate",
      policyName: "Deny Privilege Escalation",
      effect: "DENY",
    },
    {
      policyIdSuffix: "allow-admin",
      policyName: "Allow Admin",
      effect: "ALLOW",
    },
  ],
};

let cachedRegistry: PolicyRegistry[] | null = null;

function cloneEntry(row: PolicyRegistry): PolicyRegistry {
  return { ...row };
}

function sortStable(rows: readonly PolicyRegistry[]): PolicyRegistry[] {
  return [...rows].sort((a, b) => {
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    const byRole = a.roleId.localeCompare(b.roleId);
    if (byRole !== 0) return byRole;
    const byPerm = a.permissionId.localeCompare(b.permissionId);
    if (byPerm !== 0) return byPerm;
    return a.policyId.localeCompare(b.policyId);
  });
}

function fingerprint(rows: readonly PolicyRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.policyName}|${r.effect}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromPermissions(
  permissions: readonly PermissionRegistry[],
): PolicyRegistry[] {
  const rows: PolicyRegistry[] = [];
  for (const perm of permissions) {
    const defs = POLICY_DEFS_BY_ACTION[perm.action] ?? [];
    for (const def of defs) {
      const policyId = `policy-${perm.permissionId}-${def.policyIdSuffix}`;
      const status: PolicyStatus =
        perm.status === "ACTIVE" ? "ACTIVE" : perm.status;
      rows.push({
        id: `ep.policy.reg.${perm.organizationId}.${perm.roleId}.${perm.permissionId}.${policyId}`,
        organizationId: perm.organizationId,
        roleId: perm.roleId,
        permissionId: perm.permissionId,
        policyId,
        policyName: def.policyName,
        effect: def.effect,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Policy Registry from WP-6 permissions.
 */
export function buildPolicyRegistry(): PolicyRegistry[] {
  const permissions = getPermissionRegistry();
  const out = sortStable(seedFromPermissions(permissions)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getPolicyRegistry(): PolicyRegistry[] {
  if (!cachedRegistry) {
    return buildPolicyRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function policyRegistryFingerprint(
  rows?: readonly PolicyRegistry[],
): string {
  const list = rows ?? getPolicyRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearPolicyRegistry(): void {
  cachedRegistry = null;
}
