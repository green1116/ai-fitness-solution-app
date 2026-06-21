/**
 * V59 SaaS — Session service (wraps existing session infrastructure)
 */

import { getCurrentUser, type CurrentUser } from "@/lib/auth/currentUser";
import { requireEmailFromSession } from "@/lib/session";
import { findUserByEmail } from "@/lib/auth/user.service";

export type SessionUser = CurrentUser;

export async function getSessionUser(): Promise<SessionUser | null> {
  return getCurrentUser();
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new SaasAuthError("Authentication required");
  }
  return user;
}

export async function resolveSessionUserFromEmail(): Promise<SessionUser | null> {
  const email = await requireEmailFromSession();
  if (!email) return null;
  const user = await findUserByEmail(email);
  if (!user) return { id: email, email, name: null };
  return { id: user.id, email: user.email, name: user.name ?? null };
}

export class SaasAuthError extends Error {
  readonly code = "AUTH_REQUIRED" as const;
  constructor(message = "Authentication required") {
    super(message);
    this.name = "SaasAuthError";
  }
}
