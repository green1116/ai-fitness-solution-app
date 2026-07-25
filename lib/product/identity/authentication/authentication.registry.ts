/**
 * Product Identity — Authentication registry
 */

import { AUTH_STATUSES } from "./authentication.constants";
import type {
  AuthenticateInput,
  AuthenticationRecord,
  AuthStatus,
  UpdateAuthStatusInput,
} from "./authentication.types";

const authentications = new Map<string, AuthenticationRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAuth(auth: AuthenticationRecord): AuthenticationRecord {
  return { ...auth, metadata: { ...auth.metadata } };
}

export function authenticate(input: AuthenticateInput): AuthenticationRecord {
  const principalId = input.principalId.trim();
  if (!principalId) throw new Error("authentication.principalId is required");

  const id = input.id?.trim() || createId("idauth");
  if (authentications.has(id)) {
    throw new Error(`authentication already exists: ${id}`);
  }

  const now = nowIso();
  const status = AUTH_STATUSES[1];
  const method = (input.method ?? "PASSWORD").trim() || "PASSWORD";
  const auth: AuthenticationRecord = {
    id,
    principalId,
    status,
    method,
    detail: `status=${status} method=${method}`,
    metadata: { ...(input.metadata ?? {}) },
    authenticatedAt: now,
    updatedAt: now,
  };
  authentications.set(id, auth);
  return cloneAuth(auth);
}

export function updateAuthStatus(
  input: UpdateAuthStatusInput,
): AuthenticationRecord {
  const authId = input.authId.trim();
  if (!authId) throw new Error("authentication.authId is required");
  if (!(AUTH_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid auth status: ${input.status}`);
  }
  const existing = authentications.get(authId);
  if (!existing) throw new Error(`authentication not found: ${authId}`);

  const updated: AuthenticationRecord = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} method=${existing.method}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  authentications.set(authId, updated);
  return cloneAuth(updated);
}

export function getAuthentication(
  id: string,
): AuthenticationRecord | undefined {
  const auth = authentications.get(id.trim());
  return auth ? cloneAuth(auth) : undefined;
}

export function listAuthentications(filter?: {
  principalId?: string;
  status?: AuthStatus;
}): AuthenticationRecord[] {
  let result = [...authentications.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((a) => a.principalId === pid);
  }
  if (filter?.status) result = result.filter((a) => a.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAuth);
}

export function clearAuthentications(): void {
  authentications.clear();
}
