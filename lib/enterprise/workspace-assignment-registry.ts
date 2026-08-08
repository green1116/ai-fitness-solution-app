/**
 * EP-2 / WP-11 — Enterprise Workspace Assignment Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-10.
 * Derives from WorkspaceQueue (WP-10).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_QUEUE_REGISTRY_BASELINE,
  getWorkspaceQueueRegistry,
  type WorkspaceQueueRegistry,
  type WorkspaceQueueType,
} from "./workspace-queue-registry";

export const EP_2_WP11_ID = "WP-11" as const;
export const WORKSPACE_ASSIGNMENT_REGISTRY_CAPABILITY =
  "WorkspaceAssignmentRegistry" as const;
export const EP_WORKSPACE_ASSIGNMENT_REGISTRY_VERSION =
  "ep-2-wp-11-workspace-assignment-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-10 baseline. */
export const EP_WORKSPACE_ASSIGNMENT_REGISTRY_BASELINE =
  EP_WORKSPACE_QUEUE_REGISTRY_BASELINE;

export const WORKSPACE_ASSIGNMENT_TYPES = [
  "AUTO",
  "MANUAL",
  "ROUND_ROBIN",
  "DEFERRED",
] as const;
export type WorkspaceAssignmentType =
  (typeof WORKSPACE_ASSIGNMENT_TYPES)[number];

export const WORKSPACE_ASSIGNMENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceAssignmentStatus =
  (typeof WORKSPACE_ASSIGNMENT_STATUSES)[number];

export type WorkspaceAssignmentRegistry = Readonly<{
  id: string;
  workspaceId: string;
  memberId: string;
  roleId: string;
  permissionId: string;
  accessId: string;
  sessionId: string;
  eventId: string;
  activityId: string;
  taskId: string;
  queueId: string;
  assignmentId: string;
  assignmentType: WorkspaceAssignmentType;
  status: WorkspaceAssignmentStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type AssignmentSeedDef = Readonly<{
  assignmentIdSuffix: string;
  assignmentType: WorkspaceAssignmentType;
}>;

/** One assignment template per WP-10 queueType (scale-safe). */
const ASSIGNMENT_DEFS_BY_QUEUE_TYPE: Readonly<
  Record<WorkspaceQueueType, readonly AssignmentSeedDef[]>
> = {
  INTAKE: [
    {
      assignmentIdSuffix: "auto",
      assignmentType: "AUTO",
    },
  ],
  PRIORITY: [
    {
      assignmentIdSuffix: "manual",
      assignmentType: "MANUAL",
    },
  ],
  STANDARD: [
    {
      assignmentIdSuffix: "round-robin",
      assignmentType: "ROUND_ROBIN",
    },
  ],
  BACKLOG: [
    {
      assignmentIdSuffix: "deferred",
      assignmentType: "DEFERRED",
    },
  ],
};

let cachedRegistry: WorkspaceAssignmentRegistry[] | null = null;

function cloneEntry(
  row: WorkspaceAssignmentRegistry,
): WorkspaceAssignmentRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceAssignmentRegistry[],
): WorkspaceAssignmentRegistry[] {
  return [...rows].sort((a, b) => {
    const byWs = a.workspaceId.localeCompare(b.workspaceId);
    if (byWs !== 0) return byWs;
    const byMem = a.memberId.localeCompare(b.memberId);
    if (byMem !== 0) return byMem;
    const byRole = a.roleId.localeCompare(b.roleId);
    if (byRole !== 0) return byRole;
    const byPerm = a.permissionId.localeCompare(b.permissionId);
    if (byPerm !== 0) return byPerm;
    const byAcc = a.accessId.localeCompare(b.accessId);
    if (byAcc !== 0) return byAcc;
    const bySess = a.sessionId.localeCompare(b.sessionId);
    if (bySess !== 0) return bySess;
    const byEvt = a.eventId.localeCompare(b.eventId);
    if (byEvt !== 0) return byEvt;
    const byAct = a.activityId.localeCompare(b.activityId);
    if (byAct !== 0) return byAct;
    const byTask = a.taskId.localeCompare(b.taskId);
    if (byTask !== 0) return byTask;
    const byQueue = a.queueId.localeCompare(b.queueId);
    if (byQueue !== 0) return byQueue;
    return a.assignmentId.localeCompare(b.assignmentId);
  });
}

function fingerprint(rows: readonly WorkspaceAssignmentRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}|${r.activityId}|${r.taskId}|${r.queueId}|${r.assignmentId}|${r.assignmentType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromQueues(
  queues: readonly WorkspaceQueueRegistry[],
): WorkspaceAssignmentRegistry[] {
  const rows: WorkspaceAssignmentRegistry[] = [];
  for (const queue of queues) {
    const defs = ASSIGNMENT_DEFS_BY_QUEUE_TYPE[queue.queueType] ?? [];
    for (const def of defs) {
      const assignmentId = `asgn-${queue.queueId}-${def.assignmentIdSuffix}`;
      const status: WorkspaceAssignmentStatus =
        queue.status === "ACTIVE" ? "ACTIVE" : queue.status;
      rows.push({
        id: `ep.wsasgn.reg.${queue.workspaceId}.${queue.memberId}.${queue.roleId}.${queue.permissionId}.${queue.accessId}.${queue.sessionId}.${queue.eventId}.${queue.activityId}.${queue.taskId}.${queue.queueId}.${assignmentId}`,
        workspaceId: queue.workspaceId,
        memberId: queue.memberId,
        roleId: queue.roleId,
        permissionId: queue.permissionId,
        accessId: queue.accessId,
        sessionId: queue.sessionId,
        eventId: queue.eventId,
        activityId: queue.activityId,
        taskId: queue.taskId,
        queueId: queue.queueId,
        assignmentId,
        assignmentType: def.assignmentType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Assignment Registry from WP-10 queues.
 */
export function buildWorkspaceAssignmentRegistry(): WorkspaceAssignmentRegistry[] {
  const queues = getWorkspaceQueueRegistry();
  const out = sortStable(seedFromQueues(queues)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceAssignmentRegistry(): WorkspaceAssignmentRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceAssignmentRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceAssignmentRegistryFingerprint(
  rows?: readonly WorkspaceAssignmentRegistry[],
): string {
  const list = rows ?? getWorkspaceAssignmentRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceAssignmentRegistry(): void {
  cachedRegistry = null;
}
