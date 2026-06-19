import { SAAS_CONTEXT_ERROR_CODES, SaasContextError } from "../tenant-context/context-errors";
import type { SaasRuntimeSessionInput } from "./auth-types";

export function isValidSessionUser(input: SaasRuntimeSessionInput): boolean {
  return Boolean(input.userId?.trim()) && Boolean(input.email?.trim()) && input.email.includes("@");
}

export function assertValidSessionUser(input: SaasRuntimeSessionInput): void {
  if (!isValidSessionUser(input)) {
    throw new SaasContextError(SAAS_CONTEXT_ERROR_CODES.INVALID_SESSION, "Invalid session user payload");
  }
}

export function normalizeSessionEmail(email: string): string {
  return email.trim().toLowerCase();
}
