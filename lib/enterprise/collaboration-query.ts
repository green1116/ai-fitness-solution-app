/**
 * EP-3 / WP-8 — Collaboration Query
 * Read-only derived views over CollaborationSnapshot (WP-7).
 * No new registry. Deterministic. Baseline: v80-pilot-ga-1.0.0.
 */

import {
  EP_COLLABORATION_SNAPSHOT_BASELINE,
  getCollaborationSnapshot,
  type CollaborationSnapshot,
} from "./collaboration-snapshot";

export const EP_3_WP8_ID = "WP-8" as const;
export const COLLABORATION_QUERY_CAPABILITY = "CollaborationQuery" as const;
export const EP_COLLABORATION_QUERY_VERSION =
  "ep-3-wp-8-collaboration-query-1" as const;
/** Reuses Pilot GA + EP-3 WP-1~WP-7 baseline. */
export const EP_COLLABORATION_QUERY_BASELINE =
  EP_COLLABORATION_SNAPSHOT_BASELINE;

const TOP_LIMIT = 3 as const;

export type CollaborationQueryCounts = Readonly<{
  contexts: number;
  threads: number;
  messages: number;
  reactions: number;
  presences: number;
  statuses: number;
  participants: number;
}>;

export type CollaborationQueryTopItem = Readonly<{
  key: string;
  label: string;
  count: number;
}>;

export type CollaborationQuery = Readonly<{
  workspaceId: string;
  summary: string;
  counts: CollaborationQueryCounts;
  topThreads: readonly CollaborationQueryTopItem[];
  topMessages: readonly CollaborationQueryTopItem[];
  topReactions: readonly CollaborationQueryTopItem[];
  topPresences: readonly CollaborationQueryTopItem[];
  topStatuses: readonly CollaborationQueryTopItem[];
}>;

let cachedQuery: CollaborationQuery[] | null = null;

function cloneQuery(row: CollaborationQuery): CollaborationQuery {
  return {
    workspaceId: row.workspaceId,
    summary: row.summary,
    counts: { ...row.counts },
    topThreads: row.topThreads.map((t) => ({ ...t })),
    topMessages: row.topMessages.map((t) => ({ ...t })),
    topReactions: row.topReactions.map((t) => ({ ...t })),
    topPresences: row.topPresences.map((t) => ({ ...t })),
    topStatuses: row.topStatuses.map((t) => ({ ...t })),
  };
}

function countBy<T>(
  rows: readonly T[],
  keyOf: (row: T) => string,
  labelOf: (row: T) => string,
): CollaborationQueryTopItem[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const row of rows) {
    const key = keyOf(row);
    const label = labelOf(row);
    const prev = map.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      map.set(key, { label, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.key.localeCompare(b.key);
    })
    .slice(0, TOP_LIMIT);
}

function forWorkspace<T extends { workspaceId: string }>(
  rows: readonly T[],
  workspaceId: string,
): T[] {
  return rows.filter((r) => r.workspaceId === workspaceId);
}

function queryOne(
  snapshot: CollaborationSnapshot,
  workspaceId: string,
): CollaborationQuery {
  const ctx = snapshot.context.find((c) => c.workspaceId === workspaceId);
  const threads = forWorkspace(snapshot.threads, workspaceId);
  const messages = forWorkspace(snapshot.messages, workspaceId);
  const reactions = forWorkspace(snapshot.reactions, workspaceId);
  const presences = forWorkspace(snapshot.presences, workspaceId);
  const statuses = forWorkspace(snapshot.statuses, workspaceId);
  const contexts = snapshot.context.filter((c) => c.workspaceId === workspaceId);

  const summary = ctx
    ? `${ctx.organizationId} · ${ctx.status} · participants ${ctx.participants.length}`
    : `${workspaceId} · UNKNOWN · participants 0`;

  return {
    workspaceId,
    summary,
    counts: {
      contexts: contexts.length,
      threads: threads.length,
      messages: messages.length,
      reactions: reactions.length,
      presences: presences.length,
      statuses: statuses.length,
      participants: ctx?.participants.length ?? 0,
    },
    topThreads: countBy(
      threads,
      (r) => r.threadId,
      (r) => r.threadType,
    ),
    topMessages: countBy(
      messages,
      (r) => r.messageId,
      (r) => r.messageType,
    ),
    topReactions: countBy(
      reactions,
      (r) => r.reactionId,
      (r) => r.reactionType,
    ),
    topPresences: countBy(
      presences,
      (r) => r.presenceId,
      (r) => r.presenceType,
    ),
    topStatuses: countBy(
      statuses,
      (r) => r.statusId,
      (r) => r.statusType,
    ),
  };
}

function deriveQueries(
  snapshot: CollaborationSnapshot,
): CollaborationQuery[] {
  const ids = [
    ...new Set(snapshot.context.map((c) => c.workspaceId)),
  ].sort((a, b) => a.localeCompare(b));
  return ids.map((workspaceId) => queryOne(snapshot, workspaceId));
}

/**
 * Build read-only Collaboration Query views from CollaborationSnapshot.
 */
export function buildCollaborationQuery(): CollaborationQuery[] {
  const snapshot = getCollaborationSnapshot();
  const out = deriveQueries(snapshot).map(cloneQuery);
  cachedQuery = out.map(cloneQuery);
  return cachedQuery.map(cloneQuery);
}

/**
 * Get the last built query, or build if none cached.
 */
export function getCollaborationQuery(): CollaborationQuery[] {
  if (!cachedQuery) {
    return buildCollaborationQuery();
  }
  return cachedQuery.map(cloneQuery);
}

/** Stable content fingerprint for determinism checks. */
export function collaborationQueryFingerprint(
  rows?: readonly CollaborationQuery[],
): string {
  const list = rows ?? getCollaborationQuery();
  return [...list]
    .sort((a, b) => a.workspaceId.localeCompare(b.workspaceId))
    .map((q) => {
      const tops = [
        q.topThreads,
        q.topMessages,
        q.topReactions,
        q.topPresences,
        q.topStatuses,
      ]
        .map((items) =>
          items.map((t) => `${t.key}:${t.label}:${t.count}`).join(","),
        )
        .join("|");
      const counts = Object.entries(q.counts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join(",");
      return `${q.workspaceId}|${q.summary}|${counts}|${tops}`;
    })
    .join(";");
}

/** Test helper — clears query cache only. */
export function clearCollaborationQuery(): void {
  cachedQuery = null;
}
