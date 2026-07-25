/**
 * Product CRM Audit — Query registry
 */

import { listCrmAuditEvents } from "../event/event.registry";
import { listCrmTrails } from "../trail/trail.registry";
import type { CrmAuditQuery, QueryCrmAuditInput } from "./query.types";

const queries = new Map<string, CrmAuditQuery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuery(query: CrmAuditQuery): CrmAuditQuery {
  return {
    ...query,
    matchedEventIds: [...query.matchedEventIds],
    metadata: { ...query.metadata },
  };
}

export function queryCrmAudit(input: QueryCrmAuditInput): CrmAuditQuery {
  const id = input.id?.trim() || createId("crauqry");
  if (queries.has(id)) throw new Error(`crm audit query exists: ${id}`);

  const events = listCrmAuditEvents({
    category: input.category,
    customerId: input.customerId,
  });
  const trailed = new Set(listCrmTrails().map((t) => t.eventId));
  const matched = events.filter((e) => trailed.has(e.id));

  const query: CrmAuditQuery = {
    id,
    category: input.category,
    customerId: input.customerId?.trim() || undefined,
    matchCount: matched.length,
    matchedEventIds: matched.map((e) => e.id),
    detail: `matches=${matched.length}`,
    metadata: { ...(input.metadata ?? {}) },
    queriedAt: nowIso(),
  };
  queries.set(id, query);
  return cloneQuery(query);
}

export function getCrmAuditQuery(id: string): CrmAuditQuery | undefined {
  const query = queries.get(id.trim());
  return query ? cloneQuery(query) : undefined;
}

export function listCrmAuditQueries(): CrmAuditQuery[] {
  return [...queries.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuery);
}

export function clearCrmAuditQueries(): void {
  queries.clear();
}
