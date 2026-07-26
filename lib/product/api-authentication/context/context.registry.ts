/**
 * Product API Authentication — Authentication context registry
 */

import { getApiCredential } from "../credential/credential.registry";
import { getApiIdentityMapping } from "../identity/identity.registry";
import { getApiTokenValidation } from "../token/token.registry";
import type {
  ApiAuthenticationContext,
  BuildApiAuthenticationContextInput,
} from "./context.types";

const contexts = new Map<string, ApiAuthenticationContext>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContext(
  context: ApiAuthenticationContext,
): ApiAuthenticationContext {
  return { ...context, metadata: { ...context.metadata } };
}

export function buildApiAuthenticationContext(
  input: BuildApiAuthenticationContextInput,
): ApiAuthenticationContext {
  const credentialId = input.credentialId.trim();
  const identityId = input.identityId.trim();
  const tokenValidationId = input.tokenValidationId.trim();
  if (!credentialId) throw new Error("context.credentialId is required");
  if (!identityId) throw new Error("context.identityId is required");
  if (!tokenValidationId) {
    throw new Error("context.tokenValidationId is required");
  }

  const credential = getApiCredential(credentialId);
  if (!credential) throw new Error(`credential not found: ${credentialId}`);

  const identity = getApiIdentityMapping(identityId);
  if (!identity) throw new Error(`identity not found: ${identityId}`);
  if (identity.credentialId !== credentialId) {
    throw new Error(`identity credential mismatch: ${identityId}`);
  }

  const validation = getApiTokenValidation(tokenValidationId);
  if (!validation) {
    throw new Error(`token validation not found: ${tokenValidationId}`);
  }
  if (validation.credentialId !== credentialId) {
    throw new Error(`token credential mismatch: ${tokenValidationId}`);
  }

  const authenticated =
    credential.status === "ACTIVE" && validation.verdict === "VALID";

  const id = input.id?.trim() || createId("apiauthctx");
  if (contexts.has(id)) throw new Error(`context already exists: ${id}`);

  const context: ApiAuthenticationContext = {
    id,
    credentialId,
    identityId,
    tokenValidationId,
    authenticated,
    detail: `authenticated=${authenticated}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  contexts.set(id, context);
  return cloneContext(context);
}

export function getApiAuthenticationContext(
  id: string,
): ApiAuthenticationContext | undefined {
  const context = contexts.get(id.trim());
  return context ? cloneContext(context) : undefined;
}

export function listApiAuthenticationContexts(filter?: {
  credentialId?: string;
}): ApiAuthenticationContext[] {
  let result = [...contexts.values()];
  if (filter?.credentialId) {
    const credentialId = filter.credentialId.trim();
    result = result.filter((c) => c.credentialId === credentialId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneContext);
}

export function clearApiAuthenticationContexts(): void {
  contexts.clear();
}
