/**
 * Product API Audit — Query registry (offline filter, no provider)
 */

import { listApiAuditEvents } from "../event/event.registry";
import type { ApiAuditQuery, RunApiAuditQueryInput } from "./query.types";

const queries = new Map<string, ApiAuditQuery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuery(query: ApiAuditQuery): ApiAuditQuery {
  return {
    ...query,
    matchedEventIds: [...query.matchedEventIds],
    metadata: { ...query.metadata },
  };
}

export function runApiAuditQuery(input: RunApiAuditQueryInput): ApiAuditQuery {
  const queryKey = input.queryKey.trim().toUpperCase();
  if (!queryKey) throw new Error("query.queryKey is required");

  const category = input.category?.trim().toUpperCase();
  const subjectKey = input.subjectKey?.trim().toUpperCase();

  let events = listApiAuditEvents();
  if (category) {
    events = events.filter((e) => e.category === category);
  }
  if (subjectKey) {
    events = events.filter((e) => e.subjectKey === subjectKey);
  }

  const id = input.id?.trim() || createId("apiaudqry");
  if (queries.has(id)) throw new Error(`query already exists: ${id}`);

  const query: ApiAuditQuery = {
    id,
    queryKey,
    matchedEventIds: events
      .map((e) => e.id)
      .sort((a, b) => a.localeCompare(b)),
    detail: `matches=${events.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  if (category) query.category = category;
  if (subjectKey) query.subjectKey = subjectKey;

  queries.set(id, query);
  return cloneQuery(query);
}

export function getApiAuditQuery(id: string): ApiAuditQuery | undefined {
  const query = queries.get(id.trim());
  return query ? cloneQuery(query) : undefined;
}

export function listApiAuditQueries(): ApiAuditQuery[] {
  return [...queries.values()]
    .slice()
    .sort((a, b) => a.queryKey.localeCompare(b.queryKey))
    .map(cloneQuery);
}

export function clearApiAuditQueries(): void {
  queries.clear();
}
