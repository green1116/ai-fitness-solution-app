/**
 * EP-2 / WP-14 — Enterprise Workspace Snapshot
 * Read-only aggregate over WP-1~WP-13. No new registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-13.
 * Reuses existing get* registry APIs only.
 */

import {
  EP_WORKSPACE_RESULT_REGISTRY_BASELINE,
  getWorkspaceResultRegistry,
  workspaceResultRegistryFingerprint,
  type WorkspaceResultRegistry,
} from "./workspace-result-registry";
import {
  getWorkspaceExecutionRegistry,
  workspaceExecutionRegistryFingerprint,
  type WorkspaceExecutionRegistry,
} from "./workspace-execution-registry";
import {
  getWorkspaceAssignmentRegistry,
  workspaceAssignmentRegistryFingerprint,
  type WorkspaceAssignmentRegistry,
} from "./workspace-assignment-registry";
import {
  getWorkspaceQueueRegistry,
  workspaceQueueRegistryFingerprint,
  type WorkspaceQueueRegistry,
} from "./workspace-queue-registry";
import {
  getWorkspaceTaskRegistry,
  workspaceTaskRegistryFingerprint,
  type WorkspaceTaskRegistry,
} from "./workspace-task-registry";
import {
  getWorkspaceActivityRegistry,
  workspaceActivityRegistryFingerprint,
  type WorkspaceActivityRegistry,
} from "./workspace-activity-registry";
import {
  getWorkspaceEventRegistry,
  workspaceEventRegistryFingerprint,
  type WorkspaceEventRegistry,
} from "./workspace-event-registry";
import {
  getWorkspaceSessionRegistry,
  workspaceSessionRegistryFingerprint,
  type WorkspaceSessionRegistry,
} from "./workspace-session-registry";
import {
  getWorkspaceAccessRegistry,
  workspaceAccessRegistryFingerprint,
  type WorkspaceAccessRegistry,
} from "./workspace-access-registry";
import {
  getWorkspacePermissionRegistry,
  workspacePermissionRegistryFingerprint,
  type WorkspacePermissionRegistry,
} from "./workspace-permission-registry";
import {
  getWorkspaceRoleRegistry,
  workspaceRoleRegistryFingerprint,
  type WorkspaceRoleRegistry,
} from "./workspace-role-registry";
import {
  getWorkspaceMemberRegistry,
  workspaceMemberRegistryFingerprint,
  type WorkspaceMemberRegistry,
} from "./workspace-member-registry";
import {
  getWorkspaceRegistry,
  workspaceRegistryFingerprint,
  type WorkspaceRegistry,
} from "./workspace-registry";

export const EP_2_WP14_ID = "WP-14" as const;
export const WORKSPACE_SNAPSHOT_CAPABILITY = "WorkspaceSnapshot" as const;
export const EP_WORKSPACE_SNAPSHOT_VERSION =
  "ep-2-wp-14-workspace-snapshot-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-13 baseline. */
export const EP_WORKSPACE_SNAPSHOT_BASELINE =
  EP_WORKSPACE_RESULT_REGISTRY_BASELINE;

export type WorkspaceSnapshot = Readonly<{
  workspace: readonly WorkspaceRegistry[];
  members: readonly WorkspaceMemberRegistry[];
  roles: readonly WorkspaceRoleRegistry[];
  permissions: readonly WorkspacePermissionRegistry[];
  access: readonly WorkspaceAccessRegistry[];
  sessions: readonly WorkspaceSessionRegistry[];
  events: readonly WorkspaceEventRegistry[];
  activities: readonly WorkspaceActivityRegistry[];
  tasks: readonly WorkspaceTaskRegistry[];
  queues: readonly WorkspaceQueueRegistry[];
  assignments: readonly WorkspaceAssignmentRegistry[];
  executions: readonly WorkspaceExecutionRegistry[];
  results: readonly WorkspaceResultRegistry[];
}>;

let cachedSnapshot: WorkspaceSnapshot | null = null;

function cloneSnapshot(snapshot: WorkspaceSnapshot): WorkspaceSnapshot {
  return {
    workspace: snapshot.workspace.map((r) => ({ ...r })),
    members: snapshot.members.map((r) => ({ ...r })),
    roles: snapshot.roles.map((r) => ({ ...r })),
    permissions: snapshot.permissions.map((r) => ({ ...r })),
    access: snapshot.access.map((r) => ({ ...r })),
    sessions: snapshot.sessions.map((r) => ({ ...r })),
    events: snapshot.events.map((r) => ({ ...r })),
    activities: snapshot.activities.map((r) => ({ ...r })),
    tasks: snapshot.tasks.map((r) => ({ ...r })),
    queues: snapshot.queues.map((r) => ({ ...r })),
    assignments: snapshot.assignments.map((r) => ({ ...r })),
    executions: snapshot.executions.map((r) => ({ ...r })),
    results: snapshot.results.map((r) => ({ ...r })),
  };
}

/**
 * Build a read-only Workspace Snapshot by reusing WP-1~WP-13 get* APIs.
 */
export function buildWorkspaceSnapshot(): WorkspaceSnapshot {
  const snapshot: WorkspaceSnapshot = {
    workspace: getWorkspaceRegistry(),
    members: getWorkspaceMemberRegistry(),
    roles: getWorkspaceRoleRegistry(),
    permissions: getWorkspacePermissionRegistry(),
    access: getWorkspaceAccessRegistry(),
    sessions: getWorkspaceSessionRegistry(),
    events: getWorkspaceEventRegistry(),
    activities: getWorkspaceActivityRegistry(),
    tasks: getWorkspaceTaskRegistry(),
    queues: getWorkspaceQueueRegistry(),
    assignments: getWorkspaceAssignmentRegistry(),
    executions: getWorkspaceExecutionRegistry(),
    results: getWorkspaceResultRegistry(),
  };
  cachedSnapshot = cloneSnapshot(snapshot);
  return cloneSnapshot(cachedSnapshot);
}

/**
 * Get the last built snapshot, or build if none cached.
 */
export function getWorkspaceSnapshot(): WorkspaceSnapshot {
  if (!cachedSnapshot) {
    return buildWorkspaceSnapshot();
  }
  return cloneSnapshot(cachedSnapshot);
}

/** Stable content fingerprint across all WP-1~WP-13 layers. */
export function workspaceSnapshotFingerprint(
  snapshot?: WorkspaceSnapshot,
): string {
  const s = snapshot ?? getWorkspaceSnapshot();
  return [
    workspaceRegistryFingerprint(s.workspace),
    workspaceMemberRegistryFingerprint(s.members),
    workspaceRoleRegistryFingerprint(s.roles),
    workspacePermissionRegistryFingerprint(s.permissions),
    workspaceAccessRegistryFingerprint(s.access),
    workspaceSessionRegistryFingerprint(s.sessions),
    workspaceEventRegistryFingerprint(s.events),
    workspaceActivityRegistryFingerprint(s.activities),
    workspaceTaskRegistryFingerprint(s.tasks),
    workspaceQueueRegistryFingerprint(s.queues),
    workspaceAssignmentRegistryFingerprint(s.assignments),
    workspaceExecutionRegistryFingerprint(s.executions),
    workspaceResultRegistryFingerprint(s.results),
  ].join("||");
}

/** Test helper — clears snapshot cache only (not underlying registries). */
export function clearWorkspaceSnapshot(): void {
  cachedSnapshot = null;
}
