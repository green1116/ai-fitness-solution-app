/**
 * EP-2 / WP-7 — Enterprise Workspace Event Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-6.
 * Derives from WorkspaceSession (WP-6).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_SESSION_REGISTRY_BASELINE,
  getWorkspaceSessionRegistry,
  type WorkspaceSessionRegistry,
  type WorkspaceSessionType,
} from "./workspace-session-registry";

export const EP_2_WP7_ID = "WP-7" as const;
export const WORKSPACE_EVENT_REGISTRY_CAPABILITY =
  "WorkspaceEventRegistry" as const;
export const EP_WORKSPACE_EVENT_REGISTRY_VERSION =
  "ep-2-wp-7-workspace-event-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-6 baseline. */
export const EP_WORKSPACE_EVENT_REGISTRY_BASELINE =
  EP_WORKSPACE_SESSION_REGISTRY_BASELINE;

export const WORKSPACE_EVENT_TYPES = [
  "SESSION_OPENED",
  "PRIVILEGE_USED",
  "COLLABORATION",
  "VIEWED",
] as const;
export type WorkspaceEventType = (typeof WORKSPACE_EVENT_TYPES)[number];

export const WORKSPACE_EVENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceEventStatus = (typeof WORKSPACE_EVENT_STATUSES)[number];

export type WorkspaceEventRegistry = Readonly<{
  id: string;
  workspaceId: string;
  memberId: string;
  roleId: string;
  permissionId: string;
  accessId: string;
  sessionId: string;
  eventId: string;
  eventType: WorkspaceEventType;
  status: WorkspaceEventStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type EventSeedDef = Readonly<{
  eventIdSuffix: string;
  eventType: WorkspaceEventType;
}>;

/** One event template per WP-6 sessionType (scale-safe). */
const EVENT_DEFS_BY_SESSION_TYPE: Readonly<
  Record<WorkspaceSessionType, readonly EventSeedDef[]>
> = {
  INTERACTIVE: [
    {
      eventIdSuffix: "opened",
      eventType: "SESSION_OPENED",
    },
  ],
  PRIVILEGED: [
    {
      eventIdSuffix: "privilege",
      eventType: "PRIVILEGE_USED",
    },
  ],
  COLLABORATIVE: [
    {
      eventIdSuffix: "collab",
      eventType: "COLLABORATION",
    },
  ],
  OBSERVER: [
    {
      eventIdSuffix: "viewed",
      eventType: "VIEWED",
    },
  ],
};

let cachedRegistry: WorkspaceEventRegistry[] | null = null;

function cloneEntry(row: WorkspaceEventRegistry): WorkspaceEventRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceEventRegistry[],
): WorkspaceEventRegistry[] {
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
    return a.eventId.localeCompare(b.eventId);
  });
}

function fingerprint(rows: readonly WorkspaceEventRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.eventId}|${r.eventType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromSessions(
  sessions: readonly WorkspaceSessionRegistry[],
): WorkspaceEventRegistry[] {
  const rows: WorkspaceEventRegistry[] = [];
  for (const session of sessions) {
    const defs = EVENT_DEFS_BY_SESSION_TYPE[session.sessionType] ?? [];
    for (const def of defs) {
      const eventId = `evt-${session.sessionId}-${def.eventIdSuffix}`;
      const status: WorkspaceEventStatus =
        session.status === "ACTIVE" ? "ACTIVE" : session.status;
      rows.push({
        id: `ep.wse.reg.${session.workspaceId}.${session.memberId}.${session.roleId}.${session.permissionId}.${session.accessId}.${session.sessionId}.${eventId}`,
        workspaceId: session.workspaceId,
        memberId: session.memberId,
        roleId: session.roleId,
        permissionId: session.permissionId,
        accessId: session.accessId,
        sessionId: session.sessionId,
        eventId,
        eventType: def.eventType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Event Registry from WP-6 sessions.
 */
export function buildWorkspaceEventRegistry(): WorkspaceEventRegistry[] {
  const sessions = getWorkspaceSessionRegistry();
  const out = sortStable(seedFromSessions(sessions)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceEventRegistry(): WorkspaceEventRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceEventRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceEventRegistryFingerprint(
  rows?: readonly WorkspaceEventRegistry[],
): string {
  const list = rows ?? getWorkspaceEventRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceEventRegistry(): void {
  cachedRegistry = null;
}
