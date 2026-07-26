/**
 * Product M10 — AI Runtime Audit query registry (declarative match record)
 */

import type {
  AiRuntimeAuditEventKind,
  AiRuntimeAuditQuery,
  QueryAiRuntimeAuditTrailInput,
} from "./audit.types";
import { listAiRuntimeAuditEvents } from "./event.registry";
import { listAiRuntimeAuditTrails } from "./trail.registry";

const queries = new Map<string, AiRuntimeAuditQuery>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuery(query: AiRuntimeAuditQuery): AiRuntimeAuditQuery {
  return {
    ...query,
    matchedEventIds: [...query.matchedEventIds],
    metadata: { ...query.metadata },
  };
}

export function queryAiRuntimeAuditTrail(
  input: QueryAiRuntimeAuditTrailInput,
): AiRuntimeAuditQuery {
  const queryKey = input.queryKey.trim().toUpperCase();
  if (!queryKey) throw new Error("query.queryKey is required");
  if (keys.has(queryKey)) {
    throw new Error(`queryKey already exists: ${queryKey}`);
  }

  const id = input.id?.trim() || createId("airtaqry");
  if (queries.has(id)) throw new Error(`audit query already exists: ${id}`);

  const policyKeyRef = input.policyKeyRef?.trim().toUpperCase();
  const events = listAiRuntimeAuditEvents({
    kind: input.kind,
    policyKeyRef,
  });
  const trailed = new Set(listAiRuntimeAuditTrails().map((t) => t.eventId));
  const matched = events.filter((e) => trailed.has(e.id));

  const query: AiRuntimeAuditQuery = {
    id,
    queryKey,
    kind: input.kind,
    policyKeyRef,
    matchCount: matched.length,
    matchedEventIds: matched.map((e) => e.id),
    detail: `matches=${matched.length}`,
    metadata: { ...(input.metadata ?? {}) },
    queriedAt: nowIso(),
  };
  queries.set(id, query);
  keys.set(queryKey, id);
  return cloneQuery(query);
}

export function getAiRuntimeAuditQuery(
  id: string,
): AiRuntimeAuditQuery | undefined {
  const query = queries.get(id.trim());
  return query ? cloneQuery(query) : undefined;
}

export function listAiRuntimeAuditQueries(filter?: {
  kind?: AiRuntimeAuditEventKind;
  policyKeyRef?: string;
}): AiRuntimeAuditQuery[] {
  let result = [...queries.values()];
  if (filter?.kind) result = result.filter((q) => q.kind === filter.kind);
  if (filter?.policyKeyRef) {
    const policyKeyRef = filter.policyKeyRef.trim().toUpperCase();
    result = result.filter((q) => q.policyKeyRef === policyKeyRef);
  }
  return result
    .slice()
    .sort((a, b) => a.queryKey.localeCompare(b.queryKey))
    .map(cloneQuery);
}

export function clearAiRuntimeAuditQueries(): void {
  queries.clear();
  keys.clear();
}
