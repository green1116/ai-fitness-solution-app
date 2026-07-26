/**
 * Product Notification Audit — Query registry (offline filter)
 */

import { listNotificationAuditEvents } from "../event/event.registry";
import type {
  NotificationAuditQuery,
  RunNotificationAuditQueryInput,
} from "./query.types";

const queries = new Map<string, NotificationAuditQuery>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQuery(query: NotificationAuditQuery): NotificationAuditQuery {
  return {
    ...query,
    matchedEventIds: [...query.matchedEventIds],
    metadata: { ...query.metadata },
  };
}

export function runNotificationAuditQuery(
  input: RunNotificationAuditQueryInput,
): NotificationAuditQuery {
  const queryKey = input.queryKey.trim().toUpperCase();
  if (!queryKey) throw new Error("query.queryKey is required");

  const category = input.category?.trim().toUpperCase();
  const subjectKey = input.subjectKey?.trim().toUpperCase();

  let events = listNotificationAuditEvents();
  if (category) {
    events = events.filter((e) => e.category === category);
  }
  if (subjectKey) {
    events = events.filter((e) => e.subjectKey === subjectKey);
  }

  const id = input.id?.trim() || createId("naudqry");
  if (queries.has(id)) throw new Error(`query already exists: ${id}`);

  const query: NotificationAuditQuery = {
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

export function getNotificationAuditQuery(
  id: string,
): NotificationAuditQuery | undefined {
  const query = queries.get(id.trim());
  return query ? cloneQuery(query) : undefined;
}

export function listNotificationAuditQueries(): NotificationAuditQuery[] {
  return [...queries.values()]
    .slice()
    .sort((a, b) => a.queryKey.localeCompare(b.queryKey))
    .map(cloneQuery);
}

export function clearNotificationAuditQueries(): void {
  queries.clear();
}
