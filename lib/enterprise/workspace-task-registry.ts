/**
 * EP-2 / WP-9 — Enterprise Workspace Task Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-8.
 * Derives from WorkspaceActivity (WP-8).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_ACTIVITY_REGISTRY_BASELINE,
  getWorkspaceActivityRegistry,
  type WorkspaceActivityRegistry,
  type WorkspaceActivityType,
} from "./workspace-activity-registry";

export const EP_2_WP9_ID = "WP-9" as const;
export const WORKSPACE_TASK_REGISTRY_CAPABILITY =
  "WorkspaceTaskRegistry" as const;
export const EP_WORKSPACE_TASK_REGISTRY_VERSION =
  "ep-2-wp-9-workspace-task-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-8 baseline. */
export const EP_WORKSPACE_TASK_REGISTRY_BASELINE =
  EP_WORKSPACE_ACTIVITY_REGISTRY_BASELINE;

export const WORKSPACE_TASK_TYPES = [
  "ONBOARD",
  "ADMINISTER",
  "EXECUTE",
  "REVIEW",
] as const;
export type WorkspaceTaskType = (typeof WORKSPACE_TASK_TYPES)[number];

export const WORKSPACE_TASK_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceTaskStatus = (typeof WORKSPACE_TASK_STATUSES)[number];

export type WorkspaceTaskRegistry = Readonly<{
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
  taskType: WorkspaceTaskType;
  status: WorkspaceTaskStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type TaskSeedDef = Readonly<{
  taskIdSuffix: string;
  taskType: WorkspaceTaskType;
}>;

/** One task template per WP-8 activityType (scale-safe). */
const TASK_DEFS_BY_ACTIVITY_TYPE: Readonly<
  Record<WorkspaceActivityType, readonly TaskSeedDef[]>
> = {
  LOGIN: [
    {
      taskIdSuffix: "onboard",
      taskType: "ONBOARD",
    },
  ],
  ADMIN_ACTION: [
    {
      taskIdSuffix: "administer",
      taskType: "ADMINISTER",
    },
  ],
  EDIT_ACTION: [
    {
      taskIdSuffix: "execute",
      taskType: "EXECUTE",
    },
  ],
  READ_ACTION: [
    {
      taskIdSuffix: "review",
      taskType: "REVIEW",
    },
  ],
};

let cachedRegistry: WorkspaceTaskRegistry[] | null = null;

function cloneEntry(row: WorkspaceTaskRegistry): WorkspaceTaskRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceTaskRegistry[],
): WorkspaceTaskRegistry[] {
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
    return a.taskId.localeCompare(b.taskId);
  });
}

function fingerprint(rows: readonly WorkspaceTaskRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}|${r.activityId}|${r.taskId}|${r.taskType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromActivities(
  activities: readonly WorkspaceActivityRegistry[],
): WorkspaceTaskRegistry[] {
  const rows: WorkspaceTaskRegistry[] = [];
  for (const activity of activities) {
    const defs = TASK_DEFS_BY_ACTIVITY_TYPE[activity.activityType] ?? [];
    for (const def of defs) {
      const taskId = `task-${activity.activityId}-${def.taskIdSuffix}`;
      const status: WorkspaceTaskStatus =
        activity.status === "ACTIVE" ? "ACTIVE" : activity.status;
      rows.push({
        id: `ep.wstask.reg.${activity.workspaceId}.${activity.memberId}.${activity.roleId}.${activity.permissionId}.${activity.accessId}.${activity.sessionId}.${activity.eventId}.${activity.activityId}.${taskId}`,
        workspaceId: activity.workspaceId,
        memberId: activity.memberId,
        roleId: activity.roleId,
        permissionId: activity.permissionId,
        accessId: activity.accessId,
        sessionId: activity.sessionId,
        eventId: activity.eventId,
        activityId: activity.activityId,
        taskId,
        taskType: def.taskType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Task Registry from WP-8 activities.
 */
export function buildWorkspaceTaskRegistry(): WorkspaceTaskRegistry[] {
  const activities = getWorkspaceActivityRegistry();
  const out = sortStable(seedFromActivities(activities)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceTaskRegistry(): WorkspaceTaskRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceTaskRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceTaskRegistryFingerprint(
  rows?: readonly WorkspaceTaskRegistry[],
): string {
  const list = rows ?? getWorkspaceTaskRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceTaskRegistry(): void {
  cachedRegistry = null;
}
