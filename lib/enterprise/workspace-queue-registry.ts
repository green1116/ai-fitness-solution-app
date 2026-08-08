/**
 * EP-2 / WP-10 — Enterprise Workspace Queue Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-9.
 * Derives from WorkspaceTask (WP-9).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_TASK_REGISTRY_BASELINE,
  getWorkspaceTaskRegistry,
  type WorkspaceTaskRegistry,
  type WorkspaceTaskType,
} from "./workspace-task-registry";

export const EP_2_WP10_ID = "WP-10" as const;
export const WORKSPACE_QUEUE_REGISTRY_CAPABILITY =
  "WorkspaceQueueRegistry" as const;
export const EP_WORKSPACE_QUEUE_REGISTRY_VERSION =
  "ep-2-wp-10-workspace-queue-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-9 baseline. */
export const EP_WORKSPACE_QUEUE_REGISTRY_BASELINE =
  EP_WORKSPACE_TASK_REGISTRY_BASELINE;

export const WORKSPACE_QUEUE_TYPES = [
  "INTAKE",
  "PRIORITY",
  "STANDARD",
  "BACKLOG",
] as const;
export type WorkspaceQueueType = (typeof WORKSPACE_QUEUE_TYPES)[number];

export const WORKSPACE_QUEUE_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceQueueStatus = (typeof WORKSPACE_QUEUE_STATUSES)[number];

export type WorkspaceQueueRegistry = Readonly<{
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
  queueType: WorkspaceQueueType;
  status: WorkspaceQueueStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type QueueSeedDef = Readonly<{
  queueIdSuffix: string;
  queueType: WorkspaceQueueType;
}>;

/** One queue template per WP-9 taskType (scale-safe). */
const QUEUE_DEFS_BY_TASK_TYPE: Readonly<
  Record<WorkspaceTaskType, readonly QueueSeedDef[]>
> = {
  ONBOARD: [
    {
      queueIdSuffix: "intake",
      queueType: "INTAKE",
    },
  ],
  ADMINISTER: [
    {
      queueIdSuffix: "priority",
      queueType: "PRIORITY",
    },
  ],
  EXECUTE: [
    {
      queueIdSuffix: "standard",
      queueType: "STANDARD",
    },
  ],
  REVIEW: [
    {
      queueIdSuffix: "backlog",
      queueType: "BACKLOG",
    },
  ],
};

let cachedRegistry: WorkspaceQueueRegistry[] | null = null;

function cloneEntry(row: WorkspaceQueueRegistry): WorkspaceQueueRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceQueueRegistry[],
): WorkspaceQueueRegistry[] {
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
    return a.queueId.localeCompare(b.queueId);
  });
}

function fingerprint(rows: readonly WorkspaceQueueRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}|${r.activityId}|${r.taskId}|${r.queueId}|${r.queueType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromTasks(
  tasks: readonly WorkspaceTaskRegistry[],
): WorkspaceQueueRegistry[] {
  const rows: WorkspaceQueueRegistry[] = [];
  for (const task of tasks) {
    const defs = QUEUE_DEFS_BY_TASK_TYPE[task.taskType] ?? [];
    for (const def of defs) {
      const queueId = `queue-${task.taskId}-${def.queueIdSuffix}`;
      const status: WorkspaceQueueStatus =
        task.status === "ACTIVE" ? "ACTIVE" : task.status;
      rows.push({
        id: `ep.wsqueue.reg.${task.workspaceId}.${task.memberId}.${task.roleId}.${task.permissionId}.${task.accessId}.${task.sessionId}.${task.eventId}.${task.activityId}.${task.taskId}.${queueId}`,
        workspaceId: task.workspaceId,
        memberId: task.memberId,
        roleId: task.roleId,
        permissionId: task.permissionId,
        accessId: task.accessId,
        sessionId: task.sessionId,
        eventId: task.eventId,
        activityId: task.activityId,
        taskId: task.taskId,
        queueId,
        queueType: def.queueType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Queue Registry from WP-9 tasks.
 */
export function buildWorkspaceQueueRegistry(): WorkspaceQueueRegistry[] {
  const tasks = getWorkspaceTaskRegistry();
  const out = sortStable(seedFromTasks(tasks)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceQueueRegistry(): WorkspaceQueueRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceQueueRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceQueueRegistryFingerprint(
  rows?: readonly WorkspaceQueueRegistry[],
): string {
  const list = rows ?? getWorkspaceQueueRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceQueueRegistry(): void {
  cachedRegistry = null;
}
