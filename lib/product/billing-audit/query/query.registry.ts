/**
 * Product Billing Audit — Query registry
 */

import { listBillingAuditEvents } from "../event/event.registry";
import { listBillingTrails } from "../trail/trail.registry";
import type {
  BillingAuditQuery,
  QueryBillingAuditInput,
} from "./query.types";

const queries = new Map<string, BillingAuditQuery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuery(query: BillingAuditQuery): BillingAuditQuery {
  return {
    ...query,
    matchedEventIds: [...query.matchedEventIds],
    metadata: { ...query.metadata },
  };
}

export function queryBillingAudit(
  input: QueryBillingAuditInput,
): BillingAuditQuery {
  const id = input.id?.trim() || createId("bauqry");
  if (queries.has(id)) throw new Error(`billing audit query exists: ${id}`);

  const events = listBillingAuditEvents({
    category: input.category,
    accountId: input.accountId,
  });
  const trailed = new Set(listBillingTrails().map((t) => t.eventId));
  const matched = events.filter((e) => trailed.has(e.id));

  const query: BillingAuditQuery = {
    id,
    category: input.category,
    accountId: input.accountId?.trim() || undefined,
    matchCount: matched.length,
    matchedEventIds: matched.map((e) => e.id),
    detail: `matches=${matched.length}`,
    metadata: { ...(input.metadata ?? {}) },
    queriedAt: nowIso(),
  };
  queries.set(id, query);
  return cloneQuery(query);
}

export function getBillingAuditQuery(
  id: string,
): BillingAuditQuery | undefined {
  const query = queries.get(id.trim());
  return query ? cloneQuery(query) : undefined;
}

export function listBillingAuditQueries(): BillingAuditQuery[] {
  return [...queries.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneQuery);
}

export function clearBillingAuditQueries(): void {
  queries.clear();
}
