/**
 * EP-2 / WP-8 — Enterprise Workspace Activity Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-7.
 * Derives from WorkspaceEvent (WP-7).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_EVENT_REGISTRY_BASELINE,
  getWorkspaceEventRegistry,
  type WorkspaceEventRegistry,
  type WorkspaceEventType,
} from "./workspace-event-registry";

export const EP_2_WP8_ID = "WP-8" as const;
export const WORKSPACE_ACTIVITY_REGISTRY_CAPABILITY =
  "WorkspaceActivityRegistry" as const;
export const EP_WORKSPACE_ACTIVITY_REGISTRY_VERSION =
  "ep-2-wp-8-workspace-activity-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-7 baseline. */
export const EP_WORKSPACE_ACTIVITY_REGISTRY_BASELINE =
  EP_WORKSPACE_EVENT_REGISTRY_BASELINE;

export const WORKSPACE_ACTIVITY_TYPES = [
  "LOGIN",
  "ADMIN_ACTION",
  "EDIT_ACTION",
  "READ_ACTION",
] as const;
export type WorkspaceActivityType = (typeof WORKSPACE_ACTIVITY_TYPES)[number];

export const WORKSPACE_ACTIVITY_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceActivityStatus =
  (typeof WORKSPACE_ACTIVITY_STATUSES)[number];

export type WorkspaceActivityRegistry = Readonly<{
  id: string;
  workspaceId: string;
  memberId: string;
  roleId: string;
  permissionId: string;
  accessId: string;
  sessionId: string;
  eventId: string;
  activityId: string;
  activityType: WorkspaceActivityType;
  status: WorkspaceActivityStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type ActivitySeedDef = Readonly<{
  activityIdSuffix: string;
  activityType: WorkspaceActivityType;
}>;

/** One activity template per WP-7 eventType (scale-safe). */
const ACTIVITY_DEFS_BY_EVENT_TYPE: Readonly<
  Record<WorkspaceEventType, readonly ActivitySeedDef[]>
> = {
  SESSION_OPENED: [
    {
      activityIdSuffix: "login",
      activityType: "LOGIN",
    },
  ],
  PRIVILEGE_USED: [
    {
      activityIdSuffix: "admin",
      activityType: "ADMIN_ACTION",
    },
  ],
  COLLABORATION: [
    {
      activityIdSuffix: "edit",
      activityType: "EDIT_ACTION",
    },
  ],
  VIEWED: [
    {
      activityIdSuffix: "read",
      activityType: "READ_ACTION",
    },
  ],
};

let cachedRegistry: WorkspaceActivityRegistry[] | null = null;

function cloneEntry(row: WorkspaceActivityRegistry): WorkspaceActivityRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceActivityRegistry[],
): WorkspaceActivityRegistry[] {
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
    return a.activityId.localeCompare(b.activityId);
  });
}

function fingerprint(rows: readonly WorkspaceActivityRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}|${r.activityId}|${r.activityType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromEvents(
  events: readonly WorkspaceEventRegistry[],
): WorkspaceActivityRegistry[] {
  const rows: WorkspaceActivityRegistry[] = [];
  for (const event of events) {
    const defs = ACTIVITY_DEFS_BY_EVENT_TYPE[event.eventType] ?? [];
    for (const def of defs) {
      const activityId = `act-${event.eventId}-${def.activityIdSuffix}`;
      const status: WorkspaceActivityStatus =
        event.status === "ACTIVE" ? "ACTIVE" : event.status;
      rows.push({
        id: `ep.wsact.reg.${event.workspaceId}.${event.memberId}.${event.roleId}.${event.permissionId}.${event.accessId}.${event.sessionId}.${event.eventId}.${activityId}`,
        workspaceId: event.workspaceId,
        memberId: event.memberId,
        roleId: event.roleId,
        permissionId: event.permissionId,
        accessId: event.accessId,
        sessionId: event.sessionId,
        eventId: event.eventId,
        activityId,
        activityType: def.activityType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Activity Registry from WP-7 events.
 */
export function buildWorkspaceActivityRegistry(): WorkspaceActivityRegistry[] {
  const events = getWorkspaceEventRegistry();
  const out = sortStable(seedFromEvents(events)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceActivityRegistry(): WorkspaceActivityRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceActivityRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceActivityRegistryFingerprint(
  rows?: readonly WorkspaceActivityRegistry[],
): string {
  const list = rows ?? getWorkspaceActivityRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceActivityRegistry(): void {
  cachedRegistry = null;
}
