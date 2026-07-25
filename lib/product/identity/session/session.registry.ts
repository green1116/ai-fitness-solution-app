/**
 * Product Identity — Session registry
 */

import { SESSION_STATUSES } from "../authentication/authentication.constants";
import { getAuthentication } from "../authentication/authentication.registry";
import { getPrincipal } from "../principal/principal.registry";
import type {
  CloseSessionInput,
  IdentitySession,
  OpenSessionInput,
} from "./session.types";

const sessions = new Map<string, IdentitySession>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSession(session: IdentitySession): IdentitySession {
  return { ...session, metadata: { ...session.metadata } };
}

export function openSession(input: OpenSessionInput): IdentitySession {
  const principalId = input.principalId.trim();
  const authId = input.authId.trim();
  if (!principalId) throw new Error("session.principalId is required");
  if (!authId) throw new Error("session.authId is required");
  if (!getPrincipal(principalId)) {
    throw new Error(`principal not found: ${principalId}`);
  }
  const auth = getAuthentication(authId);
  if (!auth) throw new Error(`authentication not found: ${authId}`);
  if (auth.principalId !== principalId) {
    throw new Error("session principal/auth mismatch");
  }
  if (auth.status !== "AUTHENTICATED") {
    throw new Error(`authentication not authenticated: ${authId}`);
  }

  const id = input.id?.trim() || createId("idses");
  if (sessions.has(id)) throw new Error(`session already exists: ${id}`);

  const status = SESSION_STATUSES[0];
  const session: IdentitySession = {
    id,
    principalId,
    authId,
    status,
    detail: `status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    openedAt: nowIso(),
  };
  sessions.set(id, session);
  return cloneSession(session);
}

export function closeSession(input: CloseSessionInput): IdentitySession {
  const sessionId = input.sessionId.trim();
  if (!sessionId) throw new Error("session.sessionId is required");
  const existing = sessions.get(sessionId);
  if (!existing) throw new Error(`session not found: ${sessionId}`);
  if (existing.status !== "ACTIVE") {
    throw new Error(`session already closed: ${sessionId}`);
  }

  const status = input.status ?? "REVOKED";
  const updated: IdentitySession = {
    ...existing,
    status,
    detail: `status=${status}`,
    metadata: { ...existing.metadata },
    closedAt: nowIso(),
  };
  sessions.set(sessionId, updated);
  return cloneSession(updated);
}

export function getSession(id: string): IdentitySession | undefined {
  const session = sessions.get(id.trim());
  return session ? cloneSession(session) : undefined;
}

export function listSessions(filter?: {
  principalId?: string;
}): IdentitySession[] {
  let result = [...sessions.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((s) => s.principalId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSession);
}

export function clearSessions(): void {
  sessions.clear();
}
