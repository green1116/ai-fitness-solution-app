/**
 * V59.5 — Authentication guard (server-side session validation)
 */

import type { NextRequest } from "next/server";

import { authenticateRequest, SaasAuthError, type AuthContext } from "@/lib/auth/auth.service";

export async function enforceAuthGuard(
  req: NextRequest,
  body?: Record<string, unknown>,
): Promise<AuthContext> {
  return authenticateRequest(req, body);
}

export { SaasAuthError, type AuthContext };
