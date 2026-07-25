/**
 * Product Admin Audit — Query registry
 */

import { listAdminAuditEvents } from "../event/event.registry";
import { listAdminTrails } from "../trail/trail.registry";
import type {
  AdminAuditQuery,
  QueryAdminAuditInput,
} from "./query.types";

const queries = new Map<string, AdminAuditQuery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuery(query: AdminAuditQuery): AdminAuditQuery {
  return {
    ...query,
    matchedEventIds: [...query.matchedEventIds],
    metadata: { ...query.metadata },
  };
}

export function queryAdminAudit(
  input: QueryAdminAuditInput,
): AdminAuditQuery {
  const id = input.id?.trim() || createId("adauqry");
  if (queries.has(id)) {
    throw new Error(`admin audit query exists: ${id}`);
  }

  const events = listAdminAuditEvents({
    category: input.category,
    subjectId: input.subjectId,
  });
  const trailed = new Set(listAdminTrails().map((t) => t.eventId));
  const matched = events.filter((e) => trailed.has(e.id));

  const query: AdminAuditQuery = {
    id,
    category: input.category,
    subjectId: input.subjectId?.trim() || undefined,
    matchCount: matched.length,
    matchedEventIds: matched.map((e) => e.id),
    detail: `matches=${matched.length}`,
    metadata: { ...(input.metadata ?? {}) },
    queriedAt: nowIso(),
  };
  queries.set(id, query);
  return cloneQuery(query);
}

export function getAdminAuditQuery(id: string): AdminAuditQuery | undefined {
  const query = queries.get(id.trim());
  return query ? cloneQuery(query) : undefined;
}

export function listAdminAuditQueries(): AdminAuditQuery[] {
  return [...queries.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuery);
}

export function clearAdminAuditQueries(): void {
  queries.clear();
}
