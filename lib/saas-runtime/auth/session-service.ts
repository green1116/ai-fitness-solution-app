import { SAAS_CONTEXT_ERROR_CODES, SaasContextError } from "../tenant-context/context-errors";
import type { SessionUser } from "../tenant-context/context-types";
import { assertValidSessionUser, isValidSessionUser, normalizeSessionEmail } from "./auth-validation";
import type { SaasRequestSessionHeaders, SaasRuntimeSessionInput, SaasSessionRecord } from "./auth-types";

let runtimeSession: SessionUser | null = null;

export function setRuntimeSession(input: SaasRuntimeSessionInput | null): void {
  if (input == null) {
    runtimeSession = null;
    return;
  }
  assertValidSessionUser(input);
  runtimeSession = {
    userId: input.userId.trim(),
    email: normalizeSessionEmail(input.email),
  };
}

export function clearRuntimeSession(): void {
  runtimeSession = null;
}

export function getRuntimeSessionSnapshot(): SessionUser | null {
  return runtimeSession ? { ...runtimeSession } : null;
}

export function getCurrentSession(headers?: SaasRequestSessionHeaders): SaasSessionRecord | null {
  if (runtimeSession) {
    return { ...runtimeSession, valid: true };
  }

  const headerUserId = headers?.userId?.trim();
  const headerEmail = headers?.email?.trim();
  if (headerUserId && headerEmail) {
    const candidate: SaasRuntimeSessionInput = {
      userId: headerUserId,
      email: normalizeSessionEmail(headerEmail),
    };
    if (isValidSessionUser(candidate)) {
      return { ...candidate, valid: true };
    }
  }

  return null;
}

export function requireCurrentSession(headers?: SaasRequestSessionHeaders): SessionUser {
  const session = getCurrentSession(headers);
  if (!session?.valid) {
    throw new SaasContextError(SAAS_CONTEXT_ERROR_CODES.AUTH_REQUIRED, "Authentication required");
  }
  return { userId: session.userId, email: session.email };
}
