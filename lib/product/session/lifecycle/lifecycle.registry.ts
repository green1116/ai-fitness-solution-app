/**
 * Product Session — Lifecycle registry
 */

import { SESSION_LIFECYCLE_STATUSES } from "../control/control.constants";
import type {
  CloseControlledSessionInput,
  ControlledSession,
  OpenControlledSessionInput,
  RefreshSessionInput,
  SessionLifecycleStatus,
} from "./lifecycle.types";

const sessions = new Map<string, ControlledSession>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSession(session: ControlledSession): ControlledSession {
  return { ...session, metadata: { ...session.metadata } };
}

export function openSession(
  input: OpenControlledSessionInput,
): ControlledSession {
  const principalId = input.principalId.trim();
  const authId = input.authId.trim();
  if (!principalId) throw new Error("session.principalId is required");
  if (!authId) throw new Error("session.authId is required");

  const id = input.id?.trim() || createId("scses");
  if (sessions.has(id)) throw new Error(`session already exists: ${id}`);

  const status = SESSION_LIFECYCLE_STATUSES[0];
  const session: ControlledSession = {
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

export function refreshSession(
  input: RefreshSessionInput,
): ControlledSession {
  const sessionId = input.sessionId.trim();
  if (!sessionId) throw new Error("session.sessionId is required");
  const existing = sessions.get(sessionId);
  if (!existing) throw new Error(`session not found: ${sessionId}`);
  if (existing.status !== "ACTIVE" && existing.status !== "REFRESHING") {
    throw new Error(`session not refreshable: ${sessionId}`);
  }

  const now = nowIso();
  const updated: ControlledSession = {
    ...existing,
    status: "ACTIVE",
    detail: "status=ACTIVE refreshed",
    metadata: { ...existing.metadata },
    refreshedAt: now,
  };
  sessions.set(sessionId, updated);
  return cloneSession(updated);
}

export function closeSession(
  input: CloseControlledSessionInput,
): ControlledSession {
  const sessionId = input.sessionId.trim();
  if (!sessionId) throw new Error("session.sessionId is required");
  const existing = sessions.get(sessionId);
  if (!existing) throw new Error(`session not found: ${sessionId}`);
  if (existing.status === "EXPIRED" || existing.status === "REVOKED") {
    throw new Error(`session already closed: ${sessionId}`);
  }

  const status = input.status ?? "REVOKED";
  const updated: ControlledSession = {
    ...existing,
    status,
    detail: `status=${status}`,
    metadata: { ...existing.metadata },
    closedAt: nowIso(),
  };
  sessions.set(sessionId, updated);
  return cloneSession(updated);
}

export function getSession(id: string): ControlledSession | undefined {
  const session = sessions.get(id.trim());
  return session ? cloneSession(session) : undefined;
}

export function listSessions(filter?: {
  principalId?: string;
  status?: SessionLifecycleStatus;
}): ControlledSession[] {
  let result = [...sessions.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((s) => s.principalId === pid);
  }
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSession);
}

export function clearSessions(): void {
  sessions.clear();
}
