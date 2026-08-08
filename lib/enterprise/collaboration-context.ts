/**
 * EP-3 / WP-1 — Collaboration Context
 * Read-only composition of EP-1 organizations + EP-2 WorkspaceSnapshot.
 * Additive. No new registry. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0.
 */

import {
  EP_ORGANIZATION_REGISTRY_BASELINE,
  getOrganizationRegistry,
  type OrganizationRegistry,
} from "./organization-registry";
import {
  getWorkspaceSnapshot,
  type WorkspaceSnapshot,
} from "./workspace-snapshot";
import type { WorkspaceMemberRegistry } from "./workspace-member-registry";
import type { WorkspaceRoleRegistry } from "./workspace-role-registry";
import type { WorkspaceActivityRegistry } from "./workspace-activity-registry";
import type { WorkspaceTaskRegistry } from "./workspace-task-registry";
import type { WorkspaceRegistry } from "./workspace-registry";

export const EP_3_ID = "EP-3" as const;
export const EP_3_WP1_ID = "WP-1" as const;
export const COLLABORATION_CONTEXT_CAPABILITY =
  "CollaborationContext" as const;
export const EP_COLLABORATION_CONTEXT_VERSION =
  "ep-3-wp-1-collaboration-context-1" as const;
/** Reuses Pilot GA + EP-1 / EP-2 baseline. */
export const EP_COLLABORATION_CONTEXT_BASELINE =
  EP_ORGANIZATION_REGISTRY_BASELINE;

export const COLLABORATION_CONTEXT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type CollaborationContextStatus =
  (typeof COLLABORATION_CONTEXT_STATUSES)[number];

export type CollaborationParticipant = Readonly<{
  memberId: string;
  memberType: string;
  status: string;
}>;

export type CollaborationRoleRef = Readonly<{
  roleId: string;
  roleType: string;
  memberId: string;
  status: string;
}>;

export type CollaborationActivityRef = Readonly<{
  activityId: string;
  activityType: string;
  status: string;
}>;

export type CollaborationTaskRef = Readonly<{
  taskId: string;
  taskType: string;
  status: string;
}>;

export type CollaborationContext = Readonly<{
  workspaceId: string;
  organizationId: string;
  participants: readonly CollaborationParticipant[];
  roles: readonly CollaborationRoleRef[];
  activities: readonly CollaborationActivityRef[];
  tasks: readonly CollaborationTaskRef[];
  status: CollaborationContextStatus;
}>;

let cachedContext: CollaborationContext[] | null = null;

function cloneContext(row: CollaborationContext): CollaborationContext {
  return {
    workspaceId: row.workspaceId,
    organizationId: row.organizationId,
    participants: row.participants.map((p) => ({ ...p })),
    roles: row.roles.map((r) => ({ ...r })),
    activities: row.activities.map((a) => ({ ...a })),
    tasks: row.tasks.map((t) => ({ ...t })),
    status: row.status,
  };
}

function sortStable(
  rows: readonly CollaborationContext[],
): CollaborationContext[] {
  return [...rows].sort((a, b) => {
    const byWs = a.workspaceId.localeCompare(b.workspaceId);
    if (byWs !== 0) return byWs;
    return a.organizationId.localeCompare(b.organizationId);
  });
}

function deriveStatus(
  workspace: WorkspaceRegistry,
  organization: OrganizationRegistry,
): CollaborationContextStatus {
  if (workspace.status === "ACTIVE" && organization.status === "ACTIVE") {
    return "ACTIVE";
  }
  if (
    workspace.status === "SUSPENDED" ||
    organization.status === "SUSPENDED"
  ) {
    return "SUSPENDED";
  }
  return "INACTIVE";
}

function mapParticipants(
  members: readonly WorkspaceMemberRegistry[],
): CollaborationParticipant[] {
  return [...members]
    .sort((a, b) => a.memberId.localeCompare(b.memberId))
    .map((m) => ({
      memberId: m.memberId,
      memberType: m.memberType,
      status: m.status,
    }));
}

function mapRoles(
  roles: readonly WorkspaceRoleRegistry[],
): CollaborationRoleRef[] {
  return [...roles]
    .sort((a, b) => {
      const byMem = a.memberId.localeCompare(b.memberId);
      if (byMem !== 0) return byMem;
      return a.roleId.localeCompare(b.roleId);
    })
    .map((r) => ({
      roleId: r.roleId,
      roleType: r.roleType,
      memberId: r.memberId,
      status: r.status,
    }));
}

function mapActivities(
  activities: readonly WorkspaceActivityRegistry[],
): CollaborationActivityRef[] {
  return [...activities]
    .sort((a, b) => a.activityId.localeCompare(b.activityId))
    .map((a) => ({
      activityId: a.activityId,
      activityType: a.activityType,
      status: a.status,
    }));
}

function mapTasks(
  tasks: readonly WorkspaceTaskRegistry[],
): CollaborationTaskRef[] {
  return [...tasks]
    .sort((a, b) => a.taskId.localeCompare(b.taskId))
    .map((t) => ({
      taskId: t.taskId,
      taskType: t.taskType,
      status: t.status,
    }));
}

/**
 * Deterministic pairing: sorted workspaces ↔ sorted organizations (index mod).
 */
function pairOrganization(
  workspaceIndex: number,
  organizations: readonly OrganizationRegistry[],
): OrganizationRegistry {
  const org = organizations[workspaceIndex % organizations.length];
  if (!org) {
    throw new Error("ASSERT: no organizations available for pairing");
  }
  return org;
}

function deriveContexts(
  organizations: readonly OrganizationRegistry[],
  snapshot: WorkspaceSnapshot,
): CollaborationContext[] {
  const orgs = [...organizations].sort((a, b) =>
    a.organizationId.localeCompare(b.organizationId),
  );
  const workspaces = [...snapshot.workspace].sort((a, b) =>
    a.workspaceId.localeCompare(b.workspaceId),
  );

  const rows: CollaborationContext[] = [];
  for (let i = 0; i < workspaces.length; i++) {
    const ws = workspaces[i]!;
    const org = pairOrganization(i, orgs);
    const workspaceId = ws.workspaceId;
    rows.push({
      workspaceId,
      organizationId: org.organizationId,
      participants: mapParticipants(
        snapshot.members.filter((m) => m.workspaceId === workspaceId),
      ),
      roles: mapRoles(
        snapshot.roles.filter((r) => r.workspaceId === workspaceId),
      ),
      activities: mapActivities(
        snapshot.activities.filter((a) => a.workspaceId === workspaceId),
      ),
      tasks: mapTasks(
        snapshot.tasks.filter((t) => t.workspaceId === workspaceId),
      ),
      status: deriveStatus(ws, org),
    });
  }
  return sortStable(rows);
}

/**
 * Build read-only Collaboration Context from EP-1 + EP-2 snapshot.
 */
export function buildCollaborationContext(): CollaborationContext[] {
  const organizations = getOrganizationRegistry();
  const snapshot = getWorkspaceSnapshot();
  const out = deriveContexts(organizations, snapshot).map(cloneContext);
  cachedContext = out.map(cloneContext);
  return cachedContext.map(cloneContext);
}

/**
 * Get the last built context, or build if none cached.
 */
export function getCollaborationContext(): CollaborationContext[] {
  if (!cachedContext) {
    return buildCollaborationContext();
  }
  return cachedContext.map(cloneContext);
}

/** Stable content fingerprint for determinism checks. */
export function collaborationContextFingerprint(
  rows?: readonly CollaborationContext[],
): string {
  const list = sortStable(rows ?? getCollaborationContext());
  return list
    .map((c) => {
      const participants = c.participants
        .map((p) => `${p.memberId}:${p.memberType}:${p.status}`)
        .join(",");
      const roles = c.roles
        .map((r) => `${r.roleId}:${r.roleType}:${r.memberId}:${r.status}`)
        .join(",");
      const activities = c.activities
        .map((a) => `${a.activityId}:${a.activityType}:${a.status}`)
        .join(",");
      const tasks = c.tasks
        .map((t) => `${t.taskId}:${t.taskType}:${t.status}`)
        .join(",");
      return `${c.workspaceId}|${c.organizationId}|${c.status}|${participants}|${roles}|${activities}|${tasks}`;
    })
    .join(";");
}

/** Test helper — clears context cache only. */
export function clearCollaborationContext(): void {
  cachedContext = null;
}
