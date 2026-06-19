import { headers } from "next/headers";
import { resolvePortalContext } from "@/lib/saas-portal";
import { resolveTenantContext } from "@/lib/saas-runtime/tenant-context/resolve-tenant-context";
import {
  SAAS_CONTEXT_ERROR_CODES,
  isSaasContextError,
} from "@/lib/saas-runtime/tenant-context/context-errors";
import { SAAS_PRODUCT_API_ME_PATH } from "../shared/portal-constants";
import { PORTAL_ERROR_CODES, SaasProductPortalError } from "../shared/portal-errors";
import type { PortalMeData, PortalSessionSnapshot, PortalSessionState } from "../shared/portal-types";
import { createSaasProductApiClient } from "../client/saas-product-api-client";
import { buildProductPortalNavigation } from "../layout/portal-navigation";
import { buildPortalMembershipFromTenantContext } from "./build-portal-membership";
import { getPortalSessionHeaders } from "./get-portal-session-headers";
import { resolveSessionUserFromCookieOrHeaders } from "./resolve-cookie-session-user";

async function getServerBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

export async function fetchPortalSessionViaMe(): Promise<PortalSessionState> {
  const resolved = await resolveSessionUserFromCookieOrHeaders();
  if (!resolved) {
    return {
      user: null,
      tenant: null,
      membership: null,
      sessionSource: "none",
      loading: false,
      error: "Unauthorized",
    };
  }

  const sessionHeaders = await getPortalSessionHeaders();
  if (!sessionHeaders) {
    return {
      user: null,
      tenant: null,
      membership: null,
      sessionSource: "none",
      loading: false,
      error: "Unauthorized",
    };
  }

  try {
    const tenantContext = await resolveTenantContext(undefined, { session: resolved.sessionUser });
    const portalContext = resolvePortalContext(tenantContext);
    const membership = buildPortalMembershipFromTenantContext(tenantContext);

    const client = createSaasProductApiClient({
      baseUrl: await getServerBaseUrl(),
      headers: sessionHeaders,
    });
    const me = await client.get<PortalMeData>(SAAS_PRODUCT_API_ME_PATH);

    if (me.tenantId !== tenantContext.tenantId || me.userId !== tenantContext.userId) {
      throw new SaasProductPortalError(
        PORTAL_ERROR_CODES.PORTAL_FORBIDDEN,
        "Portal session tenant mismatch with /me",
        403,
      );
    }

    return {
      user: {
        userId: me.userId,
        email: resolved.sessionUser.email,
      },
      tenant: {
        tenantId: me.tenantId,
      },
      role: tenantContext.roleSystemCode,
      membership,
      sessionSource: resolved.sessionSource,
      portalDisplayName: portalContext.portal.displayName,
      loading: false,
      error: null,
    };
  } catch (error) {
    if (isSaasContextError(error) && error.code === SAAS_CONTEXT_ERROR_CODES.TENANT_CONTEXT_NOT_FOUND) {
      return {
        user: {
          userId: resolved.sessionUser.userId,
          email: resolved.sessionUser.email,
        },
        tenant: null,
        membership: null,
        sessionSource: resolved.sessionSource,
        loading: false,
        error: "Membership not found",
      };
    }

    if (error instanceof SaasProductPortalError && error.code === PORTAL_ERROR_CODES.PORTAL_UNAUTHORIZED) {
      return {
        user: null,
        tenant: null,
        membership: null,
        sessionSource: "none",
        loading: false,
        error: "Unauthorized",
      };
    }

    if (error instanceof SaasProductPortalError && error.code === PORTAL_ERROR_CODES.PORTAL_FORBIDDEN) {
      return {
        user: {
          userId: resolved.sessionUser.userId,
          email: resolved.sessionUser.email,
        },
        tenant: null,
        membership: null,
        sessionSource: resolved.sessionSource,
        loading: false,
        error: "Forbidden",
      };
    }

    throw error;
  }
}

export async function resolvePortalSessionSnapshot(): Promise<PortalSessionSnapshot | null> {
  const state = await fetchPortalSessionViaMe();
  if (!state.user || !state.tenant || !state.membership || state.error) {
    return null;
  }

  const tenantContext = await resolveTenantContext(undefined, {
    session: {
      userId: state.user.userId,
      email: state.user.email ?? "",
    },
  });

  return {
    ...state,
    user: state.user,
    tenant: state.tenant,
    membership: state.membership,
    sessionSource: state.sessionSource ?? "cookie",
    navigation: buildProductPortalNavigation(tenantContext),
  };
}
