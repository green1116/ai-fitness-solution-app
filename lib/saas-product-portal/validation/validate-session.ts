import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { resolveTenantContext } from "@/lib/saas-runtime/tenant-context/resolve-tenant-context";
import { handleMe, withApiContext } from "@/lib/saas-product-api";
import { SAAS_PRODUCT_API_ME_PATH } from "../shared/portal-constants";
import { buildPortalMembershipFromTenantContext } from "../session/build-portal-membership";
import type { PortalSessionValidation } from "../shared/portal-types";

export async function validatePortalSession(): Promise<PortalSessionValidation> {
  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const request = new NextRequest(`http://localhost${SAAS_PRODUCT_API_ME_PATH}`, {
    headers: {
      "x-user-id": getDefaultMockMembershipUserId(),
      "x-user-email": "owner@example.com",
    },
  });

  const response = await withApiContext(request, (ctx) => handleMe(ctx), { requireTenant: true });
  const body = (await response.json()) as { ok: boolean; data?: { tenantId: string; userId: string } };

  const tenantContext = await resolveTenantContext(undefined, {
    session: {
      userId: getDefaultMockMembershipUserId(),
      email: "owner@example.com",
    },
  });
  const membership = buildPortalMembershipFromTenantContext(tenantContext);

  clearRuntimeSession();

  const valid =
    body.ok === true &&
    body.data?.tenantId === "tenant-mock-enterprise" &&
    body.data?.userId === getDefaultMockMembershipUserId() &&
    Boolean(tenantContext.roleSystemCode) &&
    Boolean(membership.id);

  return {
    valid,
    summary: [
      `userId=${body.data?.userId ?? "missing"}`,
      `tenantId=${body.data?.tenantId ?? "missing"}`,
      `role=${tenantContext.roleSystemCode ?? "missing"}`,
      `membershipId=${membership.id}`,
      `valid=${valid}`,
    ].join(" "),
    userId: body.data?.userId,
    tenantId: body.data?.tenantId,
    role: tenantContext.roleSystemCode,
    membershipId: membership.id,
  };
}

export function assertPortalSessionResolverContract(): boolean {
  const resolverPath = join(
    process.cwd(),
    "lib",
    "saas-product-portal",
    "session",
    "get-portal-session-headers.ts",
  );
  const resolverSource = readFileSync(resolverPath, "utf8");
  return (
    resolverSource.includes("resolveSessionUserFromCookieOrHeaders") &&
    !resolverSource.includes("getDefaultMockMembershipUserId()") &&
    !resolverSource.includes("searchParams") &&
    !resolverSource.includes("req.json")
  );
}
