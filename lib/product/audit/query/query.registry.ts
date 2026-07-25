/**
 * Product Audit — Query registry
 */

import { listAuditEvents } from "../event/event.registry";
import { listTrails } from "../trail/trail.registry";
import type { AuditQuery, QueryAuditTrailInput } from "./query.types";

const queries = new Map<string, AuditQuery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuery(query: AuditQuery): AuditQuery {
  return {
    ...query,
    matchedEventIds: [...query.matchedEventIds],
    metadata: { ...query.metadata },
  };
}

export function queryAuditTrail(input: QueryAuditTrailInput): AuditQuery {
  const id = input.id?.trim() || createId("audqry");
  if (queries.has(id)) throw new Error(`audit query already exists: ${id}`);

  const events = listAuditEvents({
    category: input.category,
    actorId: input.actorId,
  });
  const trailed = new Set(listTrails().map((t) => t.eventId));
  const matched = events.filter((e) => trailed.has(e.id));

  const query: AuditQuery = {
    id,
    category: input.category,
    actorId: input.actorId?.trim() || undefined,
    matchCount: matched.length,
    matchedEventIds: matched.map((e) => e.id),
    detail: `matches=${matched.length}`,
    metadata: { ...(input.metadata ?? {}) },
    queriedAt: nowIso(),
  };
  queries.set(id, query);
  return cloneQuery(query);
}

export function getAuditQuery(id: string): AuditQuery | undefined {
  const query = queries.get(id.trim());
  return query ? cloneQuery(query) : undefined;
}

export function listAuditQueries(): AuditQuery[] {
  return [...queries.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuery);
}

export function clearAuditQueries(): void {
  queries.clear();
}
