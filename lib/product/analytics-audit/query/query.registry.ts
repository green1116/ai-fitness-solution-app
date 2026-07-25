/**
 * Product Analytics Audit — Query registry
 */

import { listAnalyticsAuditEvents } from "../event/event.registry";
import { listAnalyticsTrails } from "../trail/trail.registry";
import type {
  AnalyticsAuditQuery,
  QueryAnalyticsAuditInput,
} from "./query.types";

const queries = new Map<string, AnalyticsAuditQuery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuery(query: AnalyticsAuditQuery): AnalyticsAuditQuery {
  return {
    ...query,
    matchedEventIds: [...query.matchedEventIds],
    metadata: { ...query.metadata },
  };
}

export function queryAnalyticsAudit(
  input: QueryAnalyticsAuditInput,
): AnalyticsAuditQuery {
  const id = input.id?.trim() || createId("aauqry");
  if (queries.has(id)) {
    throw new Error(`analytics audit query exists: ${id}`);
  }

  const events = listAnalyticsAuditEvents({
    category: input.category,
    subjectId: input.subjectId,
  });
  const trailed = new Set(listAnalyticsTrails().map((t) => t.eventId));
  const matched = events.filter((e) => trailed.has(e.id));

  const query: AnalyticsAuditQuery = {
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

export function getAnalyticsAuditQuery(
  id: string,
): AnalyticsAuditQuery | undefined {
  const query = queries.get(id.trim());
  return query ? cloneQuery(query) : undefined;
}

export function listAnalyticsAuditQueries(): AnalyticsAuditQuery[] {
  return [...queries.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuery);
}

export function clearAnalyticsAuditQueries(): void {
  queries.clear();
}
