/**
 * EP-4 / WP-1 — Workflow Context
 * Read-only composition of EP-1 organizations + EP-2 WorkspaceSnapshot + EP-3 CollaborationSnapshot.
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
import {
  getCollaborationSnapshot,
  type CollaborationSnapshot,
} from "./collaboration-snapshot";
import type { WorkspaceRegistry } from "./workspace-registry";
import type { WorkspaceMemberRegistry } from "./workspace-member-registry";
import type { WorkspaceTaskRegistry } from "./workspace-task-registry";
import type { WorkspaceAssignmentRegistry } from "./workspace-assignment-registry";
import type { WorkspaceActivityRegistry } from "./workspace-activity-registry";

export const EP_4_ID = "EP-4" as const;
export const EP_4_WP1_ID = "WP-1" as const;
export const WORKFLOW_CONTEXT_CAPABILITY = "WorkflowContext" as const;
export const EP_WORKFLOW_CONTEXT_VERSION =
  "ep-4-wp-1-workflow-context-1" as const;
/** Reuses Pilot GA + EP-1 / EP-2 / EP-3 baseline. */
export const EP_WORKFLOW_CONTEXT_BASELINE = EP_ORGANIZATION_REGISTRY_BASELINE;

export const WORKFLOW_CONTEXT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkflowContextStatus =
  (typeof WORKFLOW_CONTEXT_STATUSES)[number];

export type WorkflowParticipant = Readonly<{
  memberId: string;
  memberType: string;
  status: string;
}>;

export type WorkflowTaskRef = Readonly<{
  taskId: string;
  taskType: string;
  status: string;
}>;

export type WorkflowAssignmentRef = Readonly<{
  assignmentId: string;
  assignmentType: string;
  status: string;
}>;

export type WorkflowActivityRef = Readonly<{
  activityId: string;
  activityType: string;
  status: string;
}>;

export type WorkflowContext = Readonly<{
  workflowId: string;
  organizationId: string;
  workspaceId: string;
  participants: readonly WorkflowParticipant[];
  tasks: readonly WorkflowTaskRef[];
  assignments: readonly WorkflowAssignmentRef[];
  activities: readonly WorkflowActivityRef[];
  status: WorkflowContextStatus;
}>;

let cachedContext: WorkflowContext[] | null = null;

function cloneContext(row: WorkflowContext): WorkflowContext {
  return {
    workflowId: row.workflowId,
    organizationId: row.organizationId,
    workspaceId: row.workspaceId,
    participants: row.participants.map((p) => ({ ...p })),
    tasks: row.tasks.map((t) => ({ ...t })),
    assignments: row.assignments.map((a) => ({ ...a })),
    activities: row.activities.map((a) => ({ ...a })),
    status: row.status,
  };
}

function sortStable(rows: readonly WorkflowContext[]): WorkflowContext[] {
  return [...rows].sort((a, b) => {
    const byWf = a.workflowId.localeCompare(b.workflowId);
    if (byWf !== 0) return byWf;
    const byOrg = a.organizationId.localeCompare(b.organizationId);
    if (byOrg !== 0) return byOrg;
    return a.workspaceId.localeCompare(b.workspaceId);
  });
}

function deriveStatus(
  workspace: WorkspaceRegistry,
  organization: OrganizationRegistry,
  collabStatus?: string,
): WorkflowContextStatus {
  if (
    workspace.status === "ACTIVE" &&
    organization.status === "ACTIVE" &&
    (collabStatus === undefined || collabStatus === "ACTIVE")
  ) {
    return "ACTIVE";
  }
  if (
    workspace.status === "SUSPENDED" ||
    organization.status === "SUSPENDED" ||
    collabStatus === "SUSPENDED"
  ) {
    return "SUSPENDED";
  }
  return "INACTIVE";
}

function mapParticipants(
  members: readonly WorkspaceMemberRegistry[],
): WorkflowParticipant[] {
  return [...members]
    .sort((a, b) => a.memberId.localeCompare(b.memberId))
    .map((m) => ({
      memberId: m.memberId,
      memberType: m.memberType,
      status: m.status,
    }));
}

function mapTasks(tasks: readonly WorkspaceTaskRegistry[]): WorkflowTaskRef[] {
  return [...tasks]
    .sort((a, b) => a.taskId.localeCompare(b.taskId))
    .map((t) => ({
      taskId: t.taskId,
      taskType: t.taskType,
      status: t.status,
    }));
}

function mapAssignments(
  assignments: readonly WorkspaceAssignmentRegistry[],
): WorkflowAssignmentRef[] {
  return [...assignments]
    .sort((a, b) => a.assignmentId.localeCompare(b.assignmentId))
    .map((a) => ({
      assignmentId: a.assignmentId,
      assignmentType: a.assignmentType,
      status: a.status,
    }));
}

function mapActivities(
  activities: readonly WorkspaceActivityRegistry[],
): WorkflowActivityRef[] {
  return [...activities]
    .sort((a, b) => a.activityId.localeCompare(b.activityId))
    .map((a) => ({
      activityId: a.activityId,
      activityType: a.activityType,
      status: a.status,
    }));
}

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
  workspaceSnapshot: WorkspaceSnapshot,
  collaborationSnapshot: CollaborationSnapshot,
): WorkflowContext[] {
  const orgs = [...organizations].sort((a, b) =>
    a.organizationId.localeCompare(b.organizationId),
  );
  const workspaces = [...workspaceSnapshot.workspace].sort((a, b) =>
    a.workspaceId.localeCompare(b.workspaceId),
  );

  const rows: WorkflowContext[] = [];
  for (let i = 0; i < workspaces.length; i++) {
    const ws = workspaces[i]!;
    const org = pairOrganization(i, orgs);
    const workspaceId = ws.workspaceId;
    const collab = collaborationSnapshot.context.find(
      (c) => c.workspaceId === workspaceId,
    );
    const workflowId = `wf-${workspaceId}`;
    rows.push({
      workflowId,
      organizationId: org.organizationId,
      workspaceId,
      participants: mapParticipants(
        workspaceSnapshot.members.filter((m) => m.workspaceId === workspaceId),
      ),
      tasks: mapTasks(
        workspaceSnapshot.tasks.filter((t) => t.workspaceId === workspaceId),
      ),
      assignments: mapAssignments(
        workspaceSnapshot.assignments.filter(
          (a) => a.workspaceId === workspaceId,
        ),
      ),
      activities: mapActivities(
        workspaceSnapshot.activities.filter(
          (a) => a.workspaceId === workspaceId,
        ),
      ),
      status: deriveStatus(ws, org, collab?.status),
    });
  }
  return sortStable(rows);
}

/**
 * Build read-only Workflow Context from EP-1 + EP-2 + EP-3 snapshots.
 */
export function buildWorkflowContext(): WorkflowContext[] {
  const organizations = getOrganizationRegistry();
  const workspaceSnapshot = getWorkspaceSnapshot();
  const collaborationSnapshot = getCollaborationSnapshot();
  const out = deriveContexts(
    organizations,
    workspaceSnapshot,
    collaborationSnapshot,
  ).map(cloneContext);
  cachedContext = out.map(cloneContext);
  return cachedContext.map(cloneContext);
}

/**
 * Get the last built context, or build if none cached.
 */
export function getWorkflowContext(): WorkflowContext[] {
  if (!cachedContext) {
    return buildWorkflowContext();
  }
  return cachedContext.map(cloneContext);
}

/** Stable content fingerprint for determinism checks. */
export function workflowContextFingerprint(
  rows?: readonly WorkflowContext[],
): string {
  const list = sortStable(rows ?? getWorkflowContext());
  return list
    .map((c) => {
      const participants = c.participants
        .map((p) => `${p.memberId}:${p.memberType}:${p.status}`)
        .join(",");
      const tasks = c.tasks
        .map((t) => `${t.taskId}:${t.taskType}:${t.status}`)
        .join(",");
      const assignments = c.assignments
        .map((a) => `${a.assignmentId}:${a.assignmentType}:${a.status}`)
        .join(",");
      const activities = c.activities
        .map((a) => `${a.activityId}:${a.activityType}:${a.status}`)
        .join(",");
      return `${c.workflowId}|${c.organizationId}|${c.workspaceId}|${c.status}|${participants}|${tasks}|${assignments}|${activities}`;
    })
    .join(";");
}

/** Test helper — clears context cache only. */
export function clearWorkflowContext(): void {
  cachedContext = null;
}
