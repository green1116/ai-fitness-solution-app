import { headers } from "next/headers";
import { PORTAL_ERROR_CODES, SaasProductPortalError } from "../shared/portal-errors";
import { createSaasProductApiClient, type SaasProductApiClient } from "./saas-product-api-client";
import { getPortalSessionHeaders } from "../session/get-portal-session-headers";

async function getServerBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function createAuthedPortalApiClient(): Promise<SaasProductApiClient> {
  const sessionHeaders = await getPortalSessionHeaders();
  if (!sessionHeaders) {
    throw new SaasProductPortalError(PORTAL_ERROR_CODES.PORTAL_UNAUTHORIZED, "Portal session required", 401);
  }

  return createSaasProductApiClient({
    baseUrl: await getServerBaseUrl(),
    headers: sessionHeaders,
  });
}
