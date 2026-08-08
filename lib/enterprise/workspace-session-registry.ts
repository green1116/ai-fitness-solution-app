/**
 * EP-2 / WP-6 — Enterprise Workspace Session Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-5.
 * Derives from WorkspaceAccess (WP-5).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_ACCESS_REGISTRY_BASELINE,
  getWorkspaceAccessRegistry,
  type WorkspaceAccessRegistry,
  type WorkspaceAccessType,
} from "./workspace-access-registry";

export const EP_2_WP6_ID = "WP-6" as const;
export const WORKSPACE_SESSION_REGISTRY_CAPABILITY =
  "WorkspaceSessionRegistry" as const;
export const EP_WORKSPACE_SESSION_REGISTRY_VERSION =
  "ep-2-wp-6-workspace-session-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-5 baseline. */
export const EP_WORKSPACE_SESSION_REGISTRY_BASELINE =
  EP_WORKSPACE_ACCESS_REGISTRY_BASELINE;

export const WORKSPACE_SESSION_TYPES = [
  "INTERACTIVE",
  "PRIVILEGED",
  "COLLABORATIVE",
  "OBSERVER",
] as const;
export type WorkspaceSessionType = (typeof WORKSPACE_SESSION_TYPES)[number];

export const WORKSPACE_SESSION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceSessionStatus =
  (typeof WORKSPACE_SESSION_STATUSES)[number];

export type WorkspaceSessionRegistry = Readonly<{
  id: string;
  workspaceId: string;
  memberId: string;
  roleId: string;
  permissionId: string;
  accessId: string;
  sessionId: string;
  sessionType: WorkspaceSessionType;
  status: WorkspaceSessionStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type SessionSeedDef = Readonly<{
  sessionIdSuffix: string;
  sessionType: WorkspaceSessionType;
}>;

/** One session template per WP-5 accessType (scale-safe). */
const SESSION_DEFS_BY_ACCESS_TYPE: Readonly<
  Record<WorkspaceAccessType, readonly SessionSeedDef[]>
> = {
  FULL: [
    {
      sessionIdSuffix: "interactive",
      sessionType: "INTERACTIVE",
    },
  ],
  ELEVATED: [
    {
      sessionIdSuffix: "privileged",
      sessionType: "PRIVILEGED",
    },
  ],
  STANDARD: [
    {
      sessionIdSuffix: "collaborative",
      sessionType: "COLLABORATIVE",
    },
  ],
  READ_ONLY: [
    {
      sessionIdSuffix: "observer",
      sessionType: "OBSERVER",
    },
  ],
};

let cachedRegistry: WorkspaceSessionRegistry[] | null = null;

function cloneEntry(row: WorkspaceSessionRegistry): WorkspaceSessionRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceSessionRegistry[],
): WorkspaceSessionRegistry[] {
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
    return a.sessionId.localeCompare(b.sessionId);
  });
}

function fingerprint(rows: readonly WorkspaceSessionRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.permissionId}|${r.accessId}|${r.sessionId}|${r.sessionType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromAccess(
  accessRows: readonly WorkspaceAccessRegistry[],
): WorkspaceSessionRegistry[] {
  const rows: WorkspaceSessionRegistry[] = [];
  for (const access of accessRows) {
    const defs = SESSION_DEFS_BY_ACCESS_TYPE[access.accessType] ?? [];
    for (const def of defs) {
      const sessionId = `sess-${access.accessId}-${def.sessionIdSuffix}`;
      const status: WorkspaceSessionStatus =
        access.status === "ACTIVE" ? "ACTIVE" : access.status;
      rows.push({
        id: `ep.wss.reg.${access.workspaceId}.${access.memberId}.${access.roleId}.${access.permissionId}.${access.accessId}.${sessionId}`,
        workspaceId: access.workspaceId,
        memberId: access.memberId,
        roleId: access.roleId,
        permissionId: access.permissionId,
        accessId: access.accessId,
        sessionId,
        sessionType: def.sessionType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Session Registry from WP-5 access.
 */
export function buildWorkspaceSessionRegistry(): WorkspaceSessionRegistry[] {
  const accessRows = getWorkspaceAccessRegistry();
  const out = sortStable(seedFromAccess(accessRows)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceSessionRegistry(): WorkspaceSessionRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceSessionRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceSessionRegistryFingerprint(
  rows?: readonly WorkspaceSessionRegistry[],
): string {
  const list = rows ?? getWorkspaceSessionRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceSessionRegistry(): void {
  cachedRegistry = null;
}
