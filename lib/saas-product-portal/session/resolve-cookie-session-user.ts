import { headers } from "next/headers";
import { normalizeEmail } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getDefaultMockMembershipUserId } from "@/lib/saas-runtime";
import type { SessionUser } from "@/lib/saas-runtime/tenant-context/context-types";
import {
  PORTAL_SESSION_HEADER_USER_EMAIL,
  PORTAL_SESSION_HEADER_USER_ID,
} from "../shared/portal-constants";
import type { PortalSessionSource } from "../shared/portal-types";

const MEMBERSHIP_USER_BY_EMAIL: Record<string, string> = {
  "owner@example.com": getDefaultMockMembershipUserId(),
};

function resolveMembershipUserId(email: string, fallbackUserId: string): string {
  return MEMBERSHIP_USER_BY_EMAIL[normalizeEmail(email)] ?? fallbackUserId;
}

export async function resolveSessionUserFromCookie(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return {
    userId: resolveMembershipUserId(user.email, user.id),
    email: normalizeEmail(user.email),
  };
}

export async function resolveSessionUserFromHeaders(): Promise<SessionUser | null> {
  const headerStore = await headers();
  const userId = headerStore.get(PORTAL_SESSION_HEADER_USER_ID)?.trim();
  const email = headerStore.get(PORTAL_SESSION_HEADER_USER_EMAIL)?.trim();
  if (!userId || !email) {
    return null;
  }

  return {
    userId,
    email: normalizeEmail(email),
  };
}

export async function resolveSessionUserFromCookieOrHeaders(): Promise<{
  sessionUser: SessionUser;
  sessionSource: PortalSessionSource;
} | null> {
  const fromCookie = await resolveSessionUserFromCookie();
  if (fromCookie) {
    return { sessionUser: fromCookie, sessionSource: "cookie" };
  }

  const fromHeaders = await resolveSessionUserFromHeaders();
  if (fromHeaders) {
    return { sessionUser: fromHeaders, sessionSource: "headers" };
  }

  return null;
}
