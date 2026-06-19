import { NextRequest } from "next/server";
import {
  clearRuntimeSession,
  getDefaultMockMembershipUserId,
  setRuntimeSession,
} from "@/lib/saas-runtime";
import { SAAS_PRODUCT_API_ME_PATH, SAAS_PRODUCT_API_P2_TAG } from "../shared/api-constants";
import { API_ERROR_CODES } from "../shared/api-errors";
import { resolveApiTenant } from "../auth/resolve-api-tenant";
import { withApiContext } from "../auth/with-api-context";
import { handleMe } from "../handlers/me-handlers";
import type { ApiP2Validation } from "../shared/api-types";

export async function validateApiP2(): Promise<ApiP2Validation> {
  clearRuntimeSession();

  const unauthenticatedRequest = new NextRequest(`http://localhost${SAAS_PRODUCT_API_ME_PATH}`);
  const unauthenticatedResponse = await withApiContext(
    unauthenticatedRequest,
    (ctx) => handleMe(ctx),
    { requireTenant: true },
  );
  const unauthenticatedBody = (await unauthenticatedResponse.json()) as {
    ok: boolean;
    code?: string;
  };

  setRuntimeSession({
    userId: getDefaultMockMembershipUserId(),
    email: "owner@example.com",
  });

  const authenticatedRequest = new NextRequest(`http://localhost${SAAS_PRODUCT_API_ME_PATH}`);
  const resolved = await resolveApiTenant(authenticatedRequest.headers);
  const authenticatedResponse = await withApiContext(
    authenticatedRequest,
    (ctx) => handleMe(ctx),
    { requireTenant: true },
  );
  const authenticatedBody = (await authenticatedResponse.json()) as {
    ok: boolean;
    data?: { tenantId: string; userId: string };
  };

  clearRuntimeSession();

  const valid =
    unauthenticatedResponse.status === 401 &&
    unauthenticatedBody.ok === false &&
    unauthenticatedBody.code === API_ERROR_CODES.API_UNAUTHORIZED &&
    authenticatedResponse.status === 200 &&
    authenticatedBody.ok === true &&
    authenticatedBody.data?.tenantId === resolved.tenantId &&
    authenticatedBody.data?.userId === resolved.userId &&
    Boolean(resolved.tenantId) &&
    Boolean(resolved.userId);

  return {
    valid,
    summary: `p2Tag=${SAAS_PRODUCT_API_P2_TAG} tenantWiringValid=${valid}`,
  };
}
