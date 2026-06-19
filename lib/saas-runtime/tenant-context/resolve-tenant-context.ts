import type { SaasRequestSessionHeaders } from "../auth/auth-types";
import type { ResolveTenantContextOptions, TenantContext } from "./context-types";
import { resolveMembershipFromAdapter } from "./membership-adapter";
import { requireSession } from "./require-session";

export async function resolveTenantContext(
  headers?: SaasRequestSessionHeaders,
  options: ResolveTenantContextOptions = {},
): Promise<TenantContext> {
  const session = options.session ?? requireSession(headers);
  const membership = await resolveMembershipFromAdapter(session.userId);

  return {
    userId: session.userId,
    tenantId: membership.tenantId,
    organizationId: membership.organizationId,
    workspaceId: membership.workspaceId,
    roleSystemCode: membership.roleSystemCode,
    portalType: membership.portalType,
    membershipId: membership.id,
  };
}

export { requireSession };
