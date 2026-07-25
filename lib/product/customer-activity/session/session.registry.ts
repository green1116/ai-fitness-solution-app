/**
 * Product Customer Activity — Session registry
 */

import { ACTIVITY_SESSION_STATUSES } from "../activity/activity.constants";
import type {
  ActivitySessionStatus,
  CloseActivitySessionInput,
  CustomerActivitySession,
  OpenActivitySessionInput,
} from "./session.types";

const sessions = new Map<string, CustomerActivitySession>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSession(
  session: CustomerActivitySession,
): CustomerActivitySession {
  return { ...session, metadata: { ...session.metadata } };
}

export function openActivitySession(
  input: OpenActivitySessionInput,
): CustomerActivitySession {
  const customerId = input.customerId.trim();
  const channel = input.channel.trim();
  if (!customerId) throw new Error("session.customerId is required");
  if (!channel) throw new Error("session.channel is required");

  const id = input.id?.trim() || createId("cactss");
  if (sessions.has(id)) throw new Error(`activity session already exists: ${id}`);

  const now = nowIso();
  const session: CustomerActivitySession = {
    id,
    customerId,
    channel,
    status: ACTIVITY_SESSION_STATUSES[0],
    detail: `channel=${channel} status=OPEN`,
    metadata: { ...(input.metadata ?? {}) },
    openedAt: now,
  };
  sessions.set(id, session);
  return cloneSession(session);
}

export function closeActivitySession(
  input: CloseActivitySessionInput,
): CustomerActivitySession {
  const sessionId = input.sessionId.trim();
  if (!sessionId) throw new Error("session.sessionId is required");

  const existing = sessions.get(sessionId);
  if (!existing) throw new Error(`activity session not found: ${sessionId}`);
  if (existing.status !== "OPEN") {
    throw new Error(`activity session not open: ${sessionId}`);
  }

  const updated: CustomerActivitySession = {
    ...existing,
    status: "CLOSED",
    detail: `channel=${existing.channel} status=CLOSED`,
    metadata: { ...existing.metadata },
    closedAt: nowIso(),
  };
  sessions.set(sessionId, updated);
  return cloneSession(updated);
}

export function getActivitySession(
  id: string,
): CustomerActivitySession | undefined {
  const session = sessions.get(id.trim());
  return session ? cloneSession(session) : undefined;
}

export function listActivitySessions(filter?: {
  customerId?: string;
  status?: ActivitySessionStatus;
}): CustomerActivitySession[] {
  let result = [...sessions.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((s) => s.customerId === customerId);
  }
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSession);
}

export function clearActivitySessions(): void {
  sessions.clear();
}
