/**
 * V59 SaaS — Auth service (request authentication + organization resolution)
 */

import type { NextRequest } from "next/server";

import { getSessionUser, SaasAuthError } from "@/lib/auth/session.service";
import { getMembership, type MembershipContext } from "@/lib/organization/membership.service";
import { normalizeOrgRole, type OrgRole } from "@/lib/organization/role.service";

export type AuthContext = {
  userId: string;
  email: string;
  organizationId: string;
  role: OrgRole;
  membership: MembershipContext;
};

const ORG_HEADER = "x-organization-id";

export function extractOrganizationId(req: NextRequest, body?: Record<string, unknown>): string | null {
  const header = req.headers.get(ORG_HEADER);
  if (header?.trim()) return header.trim();
  const fromBody = body?.organizationId;
  if (typeof fromBody === "string" && fromBody.trim()) return fromBody.trim();
  return null;
}

export async function authenticateRequest(
  req: NextRequest,
  body?: Record<string, unknown>,
): Promise<AuthContext> {
  const user = await getSessionUser();
  if (!user) {
    throw new SaasAuthError("Authentication required");
  }

  const organizationId = extractOrganizationId(req, body);
  if (!organizationId) {
    throw new SaasAuthError("Organization context required (x-organization-id header or organizationId body field)");
  }

  const membership = await getMembership(user.id, organizationId);
  if (!membership) {
    throw new SaasAuthError("Not a member of this organization");
  }

  return {
    userId: user.id,
    email: user.email,
    organizationId,
    role: normalizeOrgRole(membership.role),
    membership,
  };
}

export { SaasAuthError };
