/**
 * WP-ORG-CONTEXT-SAFETY-1
 * Exact single-org resolution — never silently pick under multi-membership.
 */

import { listOrganizationsForUser } from "@/lib/organization/organization.service";
import {
  normalizeOrgRole,
  type OrgRole,
} from "@/lib/organization/role.service";

export const ORG_CONTEXT_SAFETY_ID = "org-context-safety-1" as const;
export const ORG_CONTEXT_SAFETY_VERSION = "wp-org-context-safety-1" as const;

export type SingleOrgContextFailureReason =
  | "organization-missing"
  | "organization-ambiguous";

export type SingleOrgContextResult =
  | {
      ok: true;
      organizationId: string;
      role: OrgRole;
      membershipId: string;
    }
  | {
      ok: false;
      reason: SingleOrgContextFailureReason;
    };

/**
 * 0 orgs → fail closed (organization-missing)
 * 1 org → use that org
 * >1 org → fail closed (organization-ambiguous)
 */
export async function resolveExactSingleOrganizationForUser(
  userId: string,
): Promise<SingleOrgContextResult> {
  const memberships = await listOrganizationsForUser(userId);

  if (memberships.length === 0) {
    return { ok: false, reason: "organization-missing" };
  }

  if (memberships.length > 1) {
    return { ok: false, reason: "organization-ambiguous" };
  }

  const only = memberships[0];
  return {
    ok: true,
    organizationId: only.organization.id,
    role: normalizeOrgRole(only.role),
    membershipId: only.membershipId,
  };
}

/** Fail-closed convenience: null when missing or ambiguous. */
export async function resolveExactSingleOrganizationIdForUser(
  userId: string,
): Promise<string | null> {
  const result = await resolveExactSingleOrganizationForUser(userId);
  return result.ok ? result.organizationId : null;
}
