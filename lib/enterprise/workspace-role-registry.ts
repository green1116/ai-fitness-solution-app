/**
 * EP-2 / WP-3 — Enterprise Workspace Role Registry
 * Deterministic read-only registry.
 * Baseline: v80-pilot-ga-1.0.0 + EP-2 WP-1~WP-2.
 * Derives from WorkspaceMember (WP-2).
 */

import { PILOT_GA_RELEASE_DATE } from "@/lib/pilot/v80/intake/ga-release.schema";

import {
  EP_WORKSPACE_MEMBER_REGISTRY_BASELINE,
  getWorkspaceMemberRegistry,
  type WorkspaceMemberRegistry,
  type WorkspaceMemberType,
} from "./workspace-member-registry";

export const EP_2_WP3_ID = "WP-3" as const;
export const WORKSPACE_ROLE_REGISTRY_CAPABILITY =
  "WorkspaceRoleRegistry" as const;
export const EP_WORKSPACE_ROLE_REGISTRY_VERSION =
  "ep-2-wp-3-workspace-role-registry-1" as const;
/** Reuses Pilot GA + EP-2 WP-1~WP-2 baseline. */
export const EP_WORKSPACE_ROLE_REGISTRY_BASELINE =
  EP_WORKSPACE_MEMBER_REGISTRY_BASELINE;

export const WORKSPACE_ROLE_TYPES = [
  "WORKSPACE_OWNER",
  "WORKSPACE_ADMIN",
  "WORKSPACE_CONTRIBUTOR",
  "WORKSPACE_VIEWER",
] as const;
export type WorkspaceRoleType = (typeof WORKSPACE_ROLE_TYPES)[number];

export const WORKSPACE_ROLE_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export type WorkspaceRoleStatus = (typeof WORKSPACE_ROLE_STATUSES)[number];

export type WorkspaceRoleRegistry = Readonly<{
  id: string;
  workspaceId: string;
  memberId: string;
  roleId: string;
  roleType: WorkspaceRoleType;
  status: WorkspaceRoleStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

type RoleSeedDef = Readonly<{
  roleIdSuffix: string;
  roleType: WorkspaceRoleType;
}>;

/** One role template per WP-2 memberType (scale-safe). */
const ROLE_DEFS_BY_MEMBER_TYPE: Readonly<
  Record<WorkspaceMemberType, readonly RoleSeedDef[]>
> = {
  OWNER: [
    {
      roleIdSuffix: "owner",
      roleType: "WORKSPACE_OWNER",
    },
  ],
  ADMIN: [
    {
      roleIdSuffix: "admin",
      roleType: "WORKSPACE_ADMIN",
    },
  ],
  MEMBER: [
    {
      roleIdSuffix: "contributor",
      roleType: "WORKSPACE_CONTRIBUTOR",
    },
  ],
  GUEST: [
    {
      roleIdSuffix: "viewer",
      roleType: "WORKSPACE_VIEWER",
    },
  ],
};

let cachedRegistry: WorkspaceRoleRegistry[] | null = null;

function cloneEntry(row: WorkspaceRoleRegistry): WorkspaceRoleRegistry {
  return { ...row };
}

function sortStable(
  rows: readonly WorkspaceRoleRegistry[],
): WorkspaceRoleRegistry[] {
  return [...rows].sort((a, b) => {
    const byWs = a.workspaceId.localeCompare(b.workspaceId);
    if (byWs !== 0) return byWs;
    const byMem = a.memberId.localeCompare(b.memberId);
    if (byMem !== 0) return byMem;
    return a.roleId.localeCompare(b.roleId);
  });
}

function fingerprint(rows: readonly WorkspaceRoleRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.memberId}|${r.roleId}|${r.roleType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

function seedFromMembers(
  members: readonly WorkspaceMemberRegistry[],
): WorkspaceRoleRegistry[] {
  const rows: WorkspaceRoleRegistry[] = [];
  for (const member of members) {
    const defs = ROLE_DEFS_BY_MEMBER_TYPE[member.memberType] ?? [];
    for (const def of defs) {
      const roleId = `role-${member.workspaceId}-${member.memberId}-${def.roleIdSuffix}`;
      const status: WorkspaceRoleStatus =
        member.status === "ACTIVE" ? "ACTIVE" : member.status;
      rows.push({
        id: `ep.wsr.reg.${member.workspaceId}.${member.memberId}.${roleId}`,
        workspaceId: member.workspaceId,
        memberId: member.memberId,
        roleId,
        roleType: def.roleType,
        status,
        createdAt: REGISTRY_CREATED_AT,
      });
    }
  }
  return rows;
}

/**
 * Build the deterministic Workspace Role Registry from WP-2 members.
 */
export function buildWorkspaceRoleRegistry(): WorkspaceRoleRegistry[] {
  const members = getWorkspaceMemberRegistry();
  const out = sortStable(seedFromMembers(members)).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceRoleRegistry(): WorkspaceRoleRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceRoleRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceRoleRegistryFingerprint(
  rows?: readonly WorkspaceRoleRegistry[],
): string {
  const list = rows ?? getWorkspaceRoleRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceRoleRegistry(): void {
  cachedRegistry = null;
}
