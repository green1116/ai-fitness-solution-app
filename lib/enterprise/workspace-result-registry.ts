/**
 * EP-2 / WP-13 — Enterprise Workspace Result Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-12.
 * Derives from WorkspaceExecution (WP-12).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_EXECUTION_REGISTRY_BASELINE,
  getWorkspaceExecutionRegistry,
  type WorkspaceExecutionRegistry,
  type WorkspaceExecutionType,
} from "./workspace-execution-registry";

export const EP_2_WP13_ID = "WP-13" as const;
export const WORKSPACE_RESULT_REGISTRY_CAPABILITY =
  "WorkspaceResultRegistry" as const;
export const EP_WORKSPACE_RESULT_REGISTRY_VERSION =
  "ep-2-wp-13-workspace-result-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-12 baseline. */
export const EP_WORKSPACE_RESULT_REGISTRY_BASELINE =
  EP_WORKSPACE_EXECUTION_REGISTRY_BASELINE;

export const WORKSPACE_RESULT_TYPES = [
  "SUCCESS",
  "PARTIAL",
  "AGGREGATE",
  "PENDING",
] as const;
export type WorkspaceResultType = (typeof WORKSPACE_RESULT_TYPES)[number];

export const WORKSPACE_RESULT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceResultStatus = (typeof WORKSPACE_RESULT_STATUSES)[number];

export type WorkspaceResultRegistry = Readonly<{
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
  resultId: string;
  resultType: WorkspaceResultType;
  status: WorkspaceResultStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type ResultSeedDef = Readonly<{
  resultIdSuffix: string;
  resultType: WorkspaceResultType;
}>;

/** One result template per WP-12 executionType (scale-safe). */
const RESULT_DEFS_BY_EXECUTION_TYPE: Readonly<
  Record<WorkspaceExecutionType, readonly ResultSeedDef[]>
> = {
  IMMEDIATE: [
    {
      resultIdSuffix: "success",
      resultType: "SUCCESS",
    },
  ],
  SCHEDULED: [
    {
      resultIdSuffix: "partial",
      resultType: "PARTIAL",
    },
  ],
  BATCH: [
    {
      resultIdSuffix: "aggregate",
      resultType: "AGGREGATE",
    },
  ],
  HELD: [
    {
      resultIdSuffix: "pending",
      resultType: "PENDING",
    },
  ],
};

let cachedRegistry: WorkspaceResultRegistry[] | null = null;

function cloneEntry(row: WorkspaceResultRegistry): WorkspaceResultRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceResultRegistry[],
): WorkspaceResultRegistry[] {
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
    const byExec = a.executionId.localeCompare(b.executionId);
    if (byExec !== 0) return byExec;
    return a.resultId.localeCompare(b.resultId);
  });
}

function fingerprint(rows: readonly WorkspaceResultRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}|${r.activityId}|${r.taskId}|${r.queueId}|${r.assignmentId}|${r.executionId}|${r.resultId}|${r.resultType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromExecutions(
  executions: readonly WorkspaceExecutionRegistry[],
): WorkspaceResultRegistry[] {
  const rows: WorkspaceResultRegistry[] = [];
  for (const execution of executions) {
    const defs = RESULT_DEFS_BY_EXECUTION_TYPE[execution.executionType] ?? [];
    for (const def of defs) {
      const resultId = `result-${execution.executionId}-${def.resultIdSuffix}`;
      const status: WorkspaceResultStatus =
        execution.status === "ACTIVE" ? "ACTIVE" : execution.status;
      rows.push({
        id: `ep.wsresult.reg.${execution.workspaceId}.${execution.memberId}.${execution.roleId}.${execution.permissionId}.${execution.accessId}.${execution.sessionId}.${execution.eventId}.${execution.activityId}.${execution.taskId}.${execution.queueId}.${execution.assignmentId}.${execution.executionId}.${resultId}`,
        workspaceId: execution.workspaceId,
        memberId: execution.memberId,
        roleId: execution.roleId,
        permissionId: execution.permissionId,
        accessId: execution.accessId,
        sessionId: execution.sessionId,
        eventId: execution.eventId,
        activityId: execution.activityId,
        taskId: execution.taskId,
        queueId: execution.queueId,
        assignmentId: execution.assignmentId,
        executionId: execution.executionId,
        resultId,
        resultType: def.resultType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Result Registry from WP-12 executions.
 */
export function buildWorkspaceResultRegistry(): WorkspaceResultRegistry[] {
  const executions = getWorkspaceExecutionRegistry();
  const out = sortStable(seedFromExecutions(executions)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceResultRegistry(): WorkspaceResultRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceResultRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceResultRegistryFingerprint(
  rows?: readonly WorkspaceResultRegistry[],
): string {
  const list = rows ?? getWorkspaceResultRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceResultRegistry(): void {
  cachedRegistry = null;
}
