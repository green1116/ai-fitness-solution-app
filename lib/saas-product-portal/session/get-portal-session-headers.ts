import {
  PORTAL_SESSION_HEADER_USER_EMAIL,
  PORTAL_SESSION_HEADER_USER_ID,
} from "../shared/portal-constants";
import { resolveSessionUserFromCookieOrHeaders } from "./resolve-cookie-session-user";

/**
 * Real session resolver (V52 P2).
 * Sources: HttpOnly session cookie → membership userId, or trusted internal x-user-* headers.
 * Never reads tenantId from query or body.
 */
export async function getPortalSessionHeaders(): Promise<Record<string, string> | null> {
  const resolved = await resolveSessionUserFromCookieOrHeaders();
  if (!resolved) {
    return null;
  }

  return {
    [PORTAL_SESSION_HEADER_USER_ID]: resolved.sessionUser.userId,
    [PORTAL_SESSION_HEADER_USER_EMAIL]: resolved.sessionUser.email,
  };
}
