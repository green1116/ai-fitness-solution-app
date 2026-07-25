/**
 * Product Session — Refresh flow registry
 */

import { getSession, refreshSession } from "../lifecycle/lifecycle.registry";
import { getToken, rotateToken } from "../token/token.registry";
import type {
  RecordRefreshInput,
  SessionRefreshRecord,
} from "./refresh.types";

const refreshes = new Map<string, SessionRefreshRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRefresh(record: SessionRefreshRecord): SessionRefreshRecord {
  return { ...record, metadata: { ...record.metadata } };
}

export function recordRefresh(
  input: RecordRefreshInput,
): SessionRefreshRecord {
  const sessionId = input.sessionId.trim();
  const accessTokenId = input.accessTokenId.trim();
  const refreshTokenId = input.refreshTokenId.trim();
  if (!sessionId) throw new Error("refresh.sessionId is required");
  if (!accessTokenId) throw new Error("refresh.accessTokenId is required");
  if (!refreshTokenId) throw new Error("refresh.refreshTokenId is required");

  const session = getSession(sessionId);
  if (!session) throw new Error(`session not found: ${sessionId}`);
  if (session.status !== "ACTIVE" && session.status !== "REFRESHING") {
    throw new Error(`session not refreshable: ${sessionId}`);
  }

  const access = getToken(accessTokenId);
  if (!access) throw new Error(`access token not found: ${accessTokenId}`);
  if (access.sessionId !== sessionId || access.kind !== "ACCESS") {
    throw new Error("access token mismatch");
  }

  const refresh = getToken(refreshTokenId);
  if (!refresh) throw new Error(`refresh token not found: ${refreshTokenId}`);
  if (refresh.sessionId !== sessionId || refresh.kind !== "REFRESH") {
    throw new Error("refresh token mismatch");
  }
  if (refresh.status !== "ACTIVE") {
    throw new Error(`refresh token not active: ${refreshTokenId}`);
  }

  refreshSession({ sessionId });
  rotateToken({ tokenId: accessTokenId });

  const id = input.id?.trim() || createId("scref");
  if (refreshes.has(id)) throw new Error(`refresh already exists: ${id}`);

  const record: SessionRefreshRecord = {
    id,
    sessionId,
    accessTokenId,
    refreshTokenId,
    detail: `session=${sessionId} access=${accessTokenId}`,
    metadata: { ...(input.metadata ?? {}) },
    refreshedAt: nowIso(),
  };
  refreshes.set(id, record);
  return cloneRefresh(record);
}

export function getRefresh(id: string): SessionRefreshRecord | undefined {
  const record = refreshes.get(id.trim());
  return record ? cloneRefresh(record) : undefined;
}

export function listRefreshes(filter?: {
  sessionId?: string;
}): SessionRefreshRecord[] {
  let result = [...refreshes.values()];
  if (filter?.sessionId) {
    const sid = filter.sessionId.trim();
    result = result.filter((r) => r.sessionId === sid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRefresh);
}

export function clearRefreshes(): void {
  refreshes.clear();
}
