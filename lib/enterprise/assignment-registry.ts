/**
 * EP-1 / WP-10 — Enterprise Assignment Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-1 WP-1~WP-9.
 * Derives from Policy (WP-9).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_POLICY_REGISTRY_BASELINE,
  getPolicyRegistry,
  type PolicyEffect,
  type PolicyRegistry,
} from "./policy-registry";

export const EP_WP10_ID = "WP-10" as const;
export const ASSIGNMENT_REGISTRY_CAPABILITY = "AssignmentRegistry" as const;
export const EP_ASSIGNMENT_REGISTRY_VERSION =
  "ep-1-wp-10-assignment-registry-1" as const;
/** Reuses Pilot GA + WP-1~WP-9 baseline. */
export const EP_ASSIGNMENT_REGISTRY_BASELINE = EP_POLICY_REGISTRY_BASELINE;

export const ASSIGNMENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export type AssignmentRegistry = Readonly<{
  id: string;
  organizationId: string;
  roleId: string;
  permissionId: string;
  policyId: string;
  assignmentId: string;
  assignmentName: string;
  status: AssignmentStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type AssignmentSeedDef = Readonly<{
  assignmentIdSuffix: string;
  assignmentName: string;
}>;

/** Assignment templates keyed by policy effect (intentionally unsorted). */
const ASSIGNMENT_DEFS_BY_EFFECT: Readonly<
  Record<PolicyEffect, readonly AssignmentSeedDef[]>
> = {
  ALLOW: [
    {
      assignmentIdSuffix: "bind-primary",
      assignmentName: "Primary Allow Binding",
    },
  ],
  DENY: [
    {
      assignmentIdSuffix: "bind-guard",
      assignmentName: "Deny Guard Binding",
    },
    {
      assignmentIdSuffix: "bind-primary",
      assignmentName: "Primary Deny Binding",
    },
  ],
};

let cachedRegistry: AssignmentRegistry[] | null = null;

function cloneEntry(row: AssignmentRegistry): AssignmentRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly AssignmentRegistry[],
): AssignmentRegistry[] {
  return [...rows].sort((a, b) => {
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    const byRole = a.roleId.localeCompare(b.roleId);
    if (byRole !== 0) return byRole;
    const byPerm = a.permissionId.localeCompare(b.permissionId);
    if (byPerm !== 0) return byPerm;
    const byPolicy = a.policyId.localeCompare(b.policyId);
    if (byPolicy !== 0) return byPolicy;
    return a.assignmentId.localeCompare(b.assignmentId);
  });
}

function fingerprint(rows: readonly AssignmentRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.organizationId}|${r.roleId}|${r.permissionId}|${r.policyId}|${r.assignmentId}|${r.assignmentName}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromPolicies(
  policies: readonly PolicyRegistry[],
): AssignmentRegistry[] {
  const rows: AssignmentRegistry[] = [];
  for (const policy of policies) {
    const defs = ASSIGNMENT_DEFS_BY_EFFECT[policy.effect] ?? [];
    for (const def of defs) {
      const assignmentId = `assign-${policy.policyId}-${def.assignmentIdSuffix}`;
      const status: AssignmentStatus =
        policy.status === "ACTIVE" ? "ACTIVE" : policy.status;
      rows.push({
        id: `ep.assign.reg.${policy.organizationId}.${policy.roleId}.${policy.permissionId}.${policy.policyId}.${assignmentId}`,
        organizationId: policy.organizationId,
        roleId: policy.roleId,
        permissionId: policy.permissionId,
        policyId: policy.policyId,
        assignmentId,
        assignmentName: def.assignmentName,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Assignment Registry from WP-9 policies.
 */
export function buildAssignmentRegistry(): AssignmentRegistry[] {
  const policies = getPolicyRegistry();
  const out = sortStable(seedFromPolicies(policies)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getAssignmentRegistry(): AssignmentRegistry[] {
  if (!cachedRegistry) {
    return buildAssignmentRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function assignmentRegistryFingerprint(
  rows?: readonly AssignmentRegistry[],
): string {
  const list = rows ?? getAssignmentRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearAssignmentRegistry(): void {
  cachedRegistry = null;
}
