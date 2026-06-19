import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolvePortalContext } from "@/lib/saas-portal";
import { resolveTenantContext } from "@/lib/saas-runtime/tenant-context/resolve-tenant-context";
import { SAAS_PRODUCT_API_ME_PATH } from "../shared/portal-constants";
import { PORTAL_ERROR_CODES, SaasProductPortalError } from "../shared/portal-errors";
import type { PortalSessionSnapshot } from "../shared/portal-types";
import { createSaasProductApiClient } from "../client/saas-product-api-client";
import { buildProductPortalNavigation } from "../layout/portal-navigation";
import { getPortalSessionHeaders } from "./get-portal-session-headers";

async function getServerBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function requirePortalSessionServer(): Promise<PortalSessionSnapshot> {
  const sessionHeaders = await getPortalSessionHeaders();
  if (!sessionHeaders) {
    redirect("/login");
  }

  const client = createSaasProductApiClient({
    baseUrl: await getServerBaseUrl(),
    headers: sessionHeaders,
  });

  try {
    const me = await client.get<{ tenantId: string; userId: string }>(SAAS_PRODUCT_API_ME_PATH);
    const tenantContext = await resolveTenantContext(sessionHeaders);
    const portalContext = resolvePortalContext(tenantContext);

    return {
      user: {
        userId: me.userId,
        email: sessionHeaders["x-user-email"],
      },
      tenant: {
        tenantId: me.tenantId,
      },
      role: tenantContext.roleSystemCode,
      portalDisplayName: portalContext.portal.displayName,
      navigation: buildProductPortalNavigation(tenantContext),
      loading: false,
      error: null,
    };
  } catch (error) {
    if (error instanceof SaasProductPortalError && error.code === PORTAL_ERROR_CODES.PORTAL_UNAUTHORIZED) {
      redirect("/login");
    }
    throw error;
  }
}
