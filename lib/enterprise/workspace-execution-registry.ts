/**
 * EP-2 / WP-12 — Enterprise Workspace Execution Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-11.
 * Derives from WorkspaceAssignment (WP-11).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_ASSIGNMENT_REGISTRY_BASELINE,
  getWorkspaceAssignmentRegistry,
  type WorkspaceAssignmentRegistry,
  type WorkspaceAssignmentType,
} from "./workspace-assignment-registry";

export const EP_2_WP12_ID = "WP-12" as const;
export const WORKSPACE_EXECUTION_REGISTRY_CAPABILITY =
  "WorkspaceExecutionRegistry" as const;
export const EP_WORKSPACE_EXECUTION_REGISTRY_VERSION =
  "ep-2-wp-12-workspace-execution-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-11 baseline. */
export const EP_WORKSPACE_EXECUTION_REGISTRY_BASELINE =
  EP_WORKSPACE_ASSIGNMENT_REGISTRY_BASELINE;

export const WORKSPACE_EXECUTION_TYPES = [
  "IMMEDIATE",
  "SCHEDULED",
  "BATCH",
  "HELD",
] as const;
export type WorkspaceExecutionType =
  (typeof WORKSPACE_EXECUTION_TYPES)[number];

export const WORKSPACE_EXECUTION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceExecutionStatus =
  (typeof WORKSPACE_EXECUTION_STATUSES)[number];

export type WorkspaceExecutionRegistry = Readonly<{
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
  executionId: string;
  executionType: WorkspaceExecutionType;
  status: WorkspaceExecutionStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type ExecutionSeedDef = Readonly<{
  executionIdSuffix: string;
  executionType: WorkspaceExecutionType;
}>;

/** One execution template per WP-11 assignmentType (scale-safe). */
const EXECUTION_DEFS_BY_ASSIGNMENT_TYPE: Readonly<
  Record<WorkspaceAssignmentType, readonly ExecutionSeedDef[]>
> = {
  AUTO: [
    {
      executionIdSuffix: "immediate",
      executionType: "IMMEDIATE",
    },
  ],
  MANUAL: [
    {
      executionIdSuffix: "scheduled",
      executionType: "SCHEDULED",
    },
  ],
  ROUND_ROBIN: [
    {
      executionIdSuffix: "batch",
      executionType: "BATCH",
    },
  ],
  DEFERRED: [
    {
      executionIdSuffix: "held",
      executionType: "HELD",
    },
  ],
};

let cachedRegistry: WorkspaceExecutionRegistry[] | null = null;

function cloneEntry(
  row: WorkspaceExecutionRegistry,
): WorkspaceExecutionRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceExecutionRegistry[],
): WorkspaceExecutionRegistry[] {
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
    const byAsgn = a.assignmentId.localeCompare(b.assignmentId);
    if (byAsgn !== 0) return byAsgn;
    return a.executionId.localeCompare(b.executionId);
  });
}

function fingerprint(rows: readonly WorkspaceExecutionRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}|${r.activityId}|${r.taskId}|${r.queueId}|${r.assignmentId}|${r.executionId}|${r.executionType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromAssignments(
  assignments: readonly WorkspaceAssignmentRegistry[],
): WorkspaceExecutionRegistry[] {
  const rows: WorkspaceExecutionRegistry[] = [];
  for (const assignment of assignments) {
    const defs =
      EXECUTION_DEFS_BY_ASSIGNMENT_TYPE[assignment.assignmentType] ?? [];
    for (const def of defs) {
      const executionId = `exec-${assignment.assignmentId}-${def.executionIdSuffix}`;
      const status: WorkspaceExecutionStatus =
        assignment.status === "ACTIVE" ? "ACTIVE" : assignment.status;
      rows.push({
        id: `ep.wsexec.reg.${assignment.workspaceId}.${assignment.memberId}.${assignment.roleId}.${assignment.permissionId}.${assignment.accessId}.${assignment.sessionId}.${assignment.eventId}.${assignment.activityId}.${assignment.taskId}.${assignment.queueId}.${assignment.assignmentId}.${executionId}`,
        workspaceId: assignment.workspaceId,
        memberId: assignment.memberId,
        roleId: assignment.roleId,
        permissionId: assignment.permissionId,
        accessId: assignment.accessId,
        sessionId: assignment.sessionId,
        eventId: assignment.eventId,
        activityId: assignment.activityId,
        taskId: assignment.taskId,
        queueId: assignment.queueId,
        assignmentId: assignment.assignmentId,
        executionId,
        executionType: def.executionType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Execution Registry from WP-11 assignments.
 */
export function buildWorkspaceExecutionRegistry(): WorkspaceExecutionRegistry[] {
  const assignments = getWorkspaceAssignmentRegistry();
  const out = sortStable(seedFromAssignments(assignments)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceExecutionRegistry(): WorkspaceExecutionRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceExecutionRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceExecutionRegistryFingerprint(
  rows?: readonly WorkspaceExecutionRegistry[],
): string {
  const list = rows ?? getWorkspaceExecutionRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceExecutionRegistry(): void {
  cachedRegistry = null;
}
