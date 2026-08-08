/**
 * EP-2 / WP-2 — Enterprise Workspace Member Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1.
 * Derives from Workspace (WP-1).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_REGISTRY_BASELINE,
  getWorkspaceRegistry,
  type WorkspaceRegistry,
  type WorkspaceType,
} from "./workspace-registry";

export const EP_2_WP2_ID = "WP-2" as const;
export const WORKSPACE_MEMBER_REGISTRY_CAPABILITY =
  "WorkspaceMemberRegistry" as const;
export const EP_WORKSPACE_MEMBER_REGISTRY_VERSION =
  "ep-2-wp-2-workspace-member-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1 workspace baseline. */
export const EP_WORKSPACE_MEMBER_REGISTRY_BASELINE =
  EP_WORKSPACE_REGISTRY_BASELINE;

export const WORKSPACE_MEMBER_TYPES = [
  "OWNER",
  "ADMIN",
  "MEMBER",
  "GUEST",
] as const;
export type WorkspaceMemberType = (typeof WORKSPACE_MEMBER_TYPES)[number];

export const WORKSPACE_MEMBER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceMemberStatus = (typeof WORKSPACE_MEMBER_STATUSES)[number];

export type WorkspaceMemberRegistry = Readonly<{
  id: string;
  workspaceId: string;
  memberId: string;
  memberType: WorkspaceMemberType;
  status: WorkspaceMemberStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type MemberSeedDef = Readonly<{
  memberId: string;
  memberType: WorkspaceMemberType;
  status: WorkspaceMemberStatus;
}>;

/** Per-workspace-type member templates (applied to WP-1 workspaces). */
const MEMBER_DEFS_BY_WORKSPACE_TYPE: Readonly<
  Record<WorkspaceType, readonly MemberSeedDef[]>
> = {
  DEFAULT: [
    {
      memberId: "mem-owner",
      memberType: "OWNER",
      status: "ACTIVE",
    },
    {
      memberId: "mem-member",
      memberType: "MEMBER",
      status: "ACTIVE",
    },
  ],
  PROJECT: [
    {
      memberId: "mem-owner",
      memberType: "OWNER",
      status: "ACTIVE",
    },
    {
      memberId: "mem-admin",
      memberType: "ADMIN",
      status: "ACTIVE",
    },
    {
      memberId: "mem-member",
      memberType: "MEMBER",
      status: "ACTIVE",
    },
  ],
  SHARED: [
    {
      memberId: "mem-admin",
      memberType: "ADMIN",
      status: "ACTIVE",
    },
    {
      memberId: "mem-member",
      memberType: "MEMBER",
      status: "ACTIVE",
    },
    {
      memberId: "mem-guest",
      memberType: "GUEST",
      status: "ACTIVE",
    },
  ],
  ENTERPRISE: [
    {
      memberId: "mem-owner",
      memberType: "OWNER",
      status: "ACTIVE",
    },
    {
      memberId: "mem-admin",
      memberType: "ADMIN",
      status: "ACTIVE",
    },
    {
      memberId: "mem-member",
      memberType: "MEMBER",
      status: "ACTIVE",
    },
    {
      memberId: "mem-guest",
      memberType: "GUEST",
      status: "ACTIVE",
    },
  ],
};

let cachedRegistry: WorkspaceMemberRegistry[] | null = null;

function cloneEntry(row: WorkspaceMemberRegistry): WorkspaceMemberRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceMemberRegistry[],
): WorkspaceMemberRegistry[] {
  return [...rows].sort((a, b) => {
    const byWs = a.workspaceId.localeCompare(b.workspaceId);
    if (byWs !== 0) return byWs;
    return a.memberId.localeCompare(b.memberId);
  });
}

function fingerprint(rows: readonly WorkspaceMemberRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.memberType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromWorkspaces(
  workspaces: readonly WorkspaceRegistry[],
): WorkspaceMemberRegistry[] {
  const rows: WorkspaceMemberRegistry[] = [];
  for (const ws of workspaces) {
    const defs = MEMBER_DEFS_BY_WORKSPACE_TYPE[ws.workspaceType] ?? [];
    for (const def of defs) {
      const status: WorkspaceMemberStatus =
        ws.status === "ACTIVE" ? def.status : ws.status;
      rows.push({
        id: `ep.wsm.reg.${ws.workspaceId}.${def.memberId}`,
        workspaceId: ws.workspaceId,
        memberId: def.memberId,
        memberType: def.memberType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Member Registry from WP-1 workspaces.
 */
export function buildWorkspaceMemberRegistry(): WorkspaceMemberRegistry[] {
  const workspaces = getWorkspaceRegistry();
  const out = sortStable(seedFromWorkspaces(workspaces)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceMemberRegistry(): WorkspaceMemberRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceMemberRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceMemberRegistryFingerprint(
  rows?: readonly WorkspaceMemberRegistry[],
): string {
  const list = rows ?? getWorkspaceMemberRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceMemberRegistry(): void {
  cachedRegistry = null;
}
