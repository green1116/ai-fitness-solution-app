/**
 * WP-RUNTIME-OPS-TENANT-ORG-CONTEXT-ALIGN-1
 * Resolve submit tenant from UI organizationId + server membership.
 */

import { getCurrentUser } from "@/lib/auth/currentUser";
import { getMembership } from "@/lib/organization/membership.service";
import type { OrgRole } from "@/lib/organization/role.service";
import type { TenantContext } from "@/lib/tenancy/tenant.context";

export type TenantOpsOrgGateFailureReason =
  | "auth-required"
  | "organization-missing"
  | "organization-forbidden";

export type TenantOpsOrgGateResult =
  | { ok: true; tenant: TenantContext; role: OrgRole }
  | { ok: false; reason: TenantOpsOrgGateFailureReason; organizationId: string };

/**
 * Do not trust client org alone — require authenticated membership.
 * Role is returned for a separate mutate gate; membership rules unchanged.
 */
export async function resolveTenantOpsOrgContext(input: {
  organizationId: string;
  traceId: string;
}): Promise<TenantOpsOrgGateResult> {
  const organizationId = input.organizationId.trim();

  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;
  try {
    user = await getCurrentUser();
  } catch {
    return { ok: false, reason: "auth-required", organizationId };
  }
  if (!user) {
    return { ok: false, reason: "auth-required", organizationId };
  }

  if (!organizationId) {
    return { ok: false, reason: "organization-missing", organizationId: "" };
  }

  const membership = await getMembership(user.id, organizationId);
  if (!membership) {
    return { ok: false, reason: "organization-forbidden", organizationId };
  }

  return {
    ok: true,
    tenant: {
      organizationId,
      userId: user.id,
      traceId: input.traceId,
    },
    role: membership.role,
  };
}
