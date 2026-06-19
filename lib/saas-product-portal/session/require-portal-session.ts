import { forbidden, redirect } from "next/navigation";
import { isSaasContextError, SAAS_CONTEXT_ERROR_CODES } from "@/lib/saas-runtime/tenant-context/context-errors";
import { PORTAL_ERROR_CODES, SaasProductPortalError } from "../shared/portal-errors";
import type { PortalSessionSnapshot } from "../shared/portal-types";
import { fetchPortalSessionViaMe, resolvePortalSessionSnapshot } from "./resolve-portal-session";
import { resolveSessionUserFromCookieOrHeaders } from "./resolve-cookie-session-user";

export async function requirePortalSession(): Promise<PortalSessionSnapshot> {
  const resolved = await resolveSessionUserFromCookieOrHeaders();
  if (!resolved) {
    redirect("/login");
  }

  try {
    const snapshot = await resolvePortalSessionSnapshot();
    if (snapshot) {
      return snapshot;
    }

    const state = await fetchPortalSessionViaMe();
    if (!state.user) {
      redirect("/login");
    }
    if (!state.membership || !state.tenant) {
      forbidden();
    }
    forbidden();
  } catch (error) {
    if (error instanceof SaasProductPortalError && error.code === PORTAL_ERROR_CODES.PORTAL_UNAUTHORIZED) {
      redirect("/login");
    }
    if (isSaasContextError(error) && error.code === SAAS_CONTEXT_ERROR_CODES.TENANT_CONTEXT_NOT_FOUND) {
      forbidden();
    }
    if (error instanceof SaasProductPortalError && error.code === PORTAL_ERROR_CODES.PORTAL_FORBIDDEN) {
      forbidden();
    }
    throw error;
  }
}

/** @deprecated Use requirePortalSession */
export async function requirePortalSessionServer(): Promise<PortalSessionSnapshot> {
  return requirePortalSession();
}
