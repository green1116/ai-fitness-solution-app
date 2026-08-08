/**
 * EP-2 / WP-15 — Enterprise Workspace Query
 * Read-only derived views over WorkspaceSnapshot (WP-14).
 * No new registry. Deterministic. Baseline: v80-pilot-ga-1.0.0.
 */

import {
  EP_WORKSPACE_SNAPSHOT_BASELINE,
  getWorkspaceSnapshot,
  type WorkspaceSnapshot,
} from "./workspace-snapshot";

export const EP_2_WP15_ID = "WP-15" as const;
export const WORKSPACE_QUERY_CAPABILITY = "WorkspaceQuery" as const;
export const EP_WORKSPACE_QUERY_VERSION =
  "ep-2-wp-15-workspace-query-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-14 baseline. */
export const EP_WORKSPACE_QUERY_BASELINE = EP_WORKSPACE_SNAPSHOT_BASELINE;

const TOP_LIMIT = 3 as const;

export type WorkspaceQueryCounts = Readonly<{
  members: number;
  roles: number;
  permissions: number;
  access: number;
  sessions: number;
  events: number;
  activities: number;
  tasks: number;
  queues: number;
  assignments: number;
  executions: number;
  results: number;
}>;

export type WorkspaceQueryTopItem = Readonly<{
  key: string;
  label: string;
  count: number;
}>;

export type WorkspaceQuery = Readonly<{
  workspaceId: string;
  summary: string;
  counts: WorkspaceQueryCounts;
  topMembers: readonly WorkspaceQueryTopItem[];
  topRoles: readonly WorkspaceQueryTopItem[];
  topPermissions: readonly WorkspaceQueryTopItem[];
  topActivities: readonly WorkspaceQueryTopItem[];
  topTasks: readonly WorkspaceQueryTopItem[];
  topResults: readonly WorkspaceQueryTopItem[];
}>;

let cachedQuery: WorkspaceQuery[] | null = null;

function cloneQuery(row: WorkspaceQuery): WorkspaceQuery {
  return {
    workspaceId: row.workspaceId,
    summary: row.summary,
    counts: { ...row.counts },
    topMembers: row.topMembers.map((t) => ({ ...t })),
    topRoles: row.topRoles.map((t) => ({ ...t })),
    topPermissions: row.topPermissions.map((t) => ({ ...t })),
    topActivities: row.topActivities.map((t) => ({ ...t })),
    topTasks: row.topTasks.map((t) => ({ ...t })),
    topResults: row.topResults.map((t) => ({ ...t })),
  };
}

function countBy<T>(
  rows: readonly T[],
  keyOf: (row: T) => string,
  labelOf: (row: T) => string,
): WorkspaceQueryTopItem[] {
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
  snapshot: WorkspaceSnapshot,
  workspaceId: string,
): WorkspaceQuery {
  const ws = snapshot.workspace.find((w) => w.workspaceId === workspaceId);
  const members = forWorkspace(snapshot.members, workspaceId);
  const roles = forWorkspace(snapshot.roles, workspaceId);
  const permissions = forWorkspace(snapshot.permissions, workspaceId);
  const access = forWorkspace(snapshot.access, workspaceId);
  const sessions = forWorkspace(snapshot.sessions, workspaceId);
  const events = forWorkspace(snapshot.events, workspaceId);
  const activities = forWorkspace(snapshot.activities, workspaceId);
  const tasks = forWorkspace(snapshot.tasks, workspaceId);
  const queues = forWorkspace(snapshot.queues, workspaceId);
  const assignments = forWorkspace(snapshot.assignments, workspaceId);
  const executions = forWorkspace(snapshot.executions, workspaceId);
  const results = forWorkspace(snapshot.results, workspaceId);

  const summary = ws
    ? `${ws.workspaceName} · ${ws.workspaceType} · ${ws.status}`
    : `${workspaceId} · UNKNOWN · UNKNOWN`;

  return {
    workspaceId,
    summary,
    counts: {
      members: members.length,
      roles: roles.length,
      permissions: permissions.length,
      access: access.length,
      sessions: sessions.length,
      events: events.length,
      activities: activities.length,
      tasks: tasks.length,
      queues: queues.length,
      assignments: assignments.length,
      executions: executions.length,
      results: results.length,
    },
    topMembers: countBy(
      members,
      (r) => r.memberId,
      (r) => r.memberType,
    ),
    topRoles: countBy(
      roles,
      (r) => r.roleId,
      (r) => r.roleType,
    ),
    topPermissions: countBy(
      permissions,
      (r) => r.permissionId,
      (r) => r.permissionType,
    ),
    topActivities: countBy(
      activities,
      (r) => r.activityId,
      (r) => r.activityType,
    ),
    topTasks: countBy(
      tasks,
      (r) => r.taskId,
      (r) => r.taskType,
    ),
    topResults: countBy(
      results,
      (r) => r.resultId,
      (r) => r.resultType,
    ),
  };
}

function deriveQueries(snapshot: WorkspaceSnapshot): WorkspaceQuery[] {
  const ids = [...new Set(snapshot.workspace.map((w) => w.workspaceId))].sort(
    (a, b) => a.localeCompare(b),
  );
  return ids.map((workspaceId) => queryOne(snapshot, workspaceId));
}

/**
 * Build read-only Workspace Query views from WorkspaceSnapshot.
 */
export function buildWorkspaceQuery(): WorkspaceQuery[] {
  const snapshot = getWorkspaceSnapshot();
  const out = deriveQueries(snapshot).map(cloneQuery);
  cachedQuery = out.map(cloneQuery);
  return cachedQuery.map(cloneQuery);
}

/**
 * Get the last built query, or build if none cached.
 */
export function getWorkspaceQuery(): WorkspaceQuery[] {
  if (!cachedQuery) {
    return buildWorkspaceQuery();
  }
  return cachedQuery.map(cloneQuery);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceQueryFingerprint(
  rows?: readonly WorkspaceQuery[],
): string {
  const list = rows ?? getWorkspaceQuery();
  return [...list]
    .sort((a, b) => a.workspaceId.localeCompare(b.workspaceId))
    .map((q) => {
      const tops = [
        q.topMembers,
        q.topRoles,
        q.topPermissions,
        q.topActivities,
        q.topTasks,
        q.topResults,
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
export function clearWorkspaceQuery(): void {
  cachedQuery = null;
}
