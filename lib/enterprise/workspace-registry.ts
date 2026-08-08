/**
 * EP-2 / WP-1 — Enterprise Workspace Registry
 * Deterministic read-only registry. Baseline: v80-pilot-ga-1.0.0.
 * No DB writes, no Project/Quote/Tender changes.
 */

import {
  PILOT_GA_RELEASE_DATE,
  PILOT_GA_VERSION,
} from "@/lib/pilot/v80/intake/ga-release.schema";

export const EP_2_ID = "EP-2" as const;
export const EP_2_WP1_ID = "WP-1" as const;
export const WORKSPACE_REGISTRY_CAPABILITY = "WorkspaceRegistry" as const;
export const EP_WORKSPACE_REGISTRY_VERSION =
  "ep-2-wp-1-workspace-registry-1" as const;
/** Frozen Pilot GA baseline — EP-2 reuses this only. */
export const EP_WORKSPACE_REGISTRY_BASELINE = PILOT_GA_VERSION;

export const WORKSPACE_TYPES = [
  "DEFAULT",
  "PROJECT",
  "SHARED",
  "ENTERPRISE",
] as const;
export type WorkspaceType = (typeof WORKSPACE_TYPES)[number];

export const WORKSPACE_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];

export type WorkspaceRegistry = Readonly<{
  id: string;
  workspaceId: string;
  workspaceName: string;
  workspaceType: WorkspaceType;
  status: WorkspaceStatus;
  createdAt: string;
}>;

const REGISTRY_CREATED_AT = `${PILOT_GA_RELEASE_DATE}T00:00:00.000Z`;

/**
 * Seed catalog for enterprise workspaces (no Prisma / migration).
 * Stable ids; fixed createdAt from Pilot GA freeze date.
 */
const WORKSPACE_SEED: readonly WorkspaceRegistry[] = [
  {
    id: "ep.ws.reg.default",
    workspaceId: "ws-ep-default",
    workspaceName: "EP Default Workspace",
    workspaceType: "DEFAULT",
    status: "ACTIVE",
    createdAt: REGISTRY_CREATED_AT,
  },
  {
    id: "ep.ws.reg.project",
    workspaceId: "ws-ep-project",
    workspaceName: "EP Project Workspace",
    workspaceType: "PROJECT",
    status: "ACTIVE",
    createdAt: REGISTRY_CREATED_AT,
  },
  {
    id: "ep.ws.reg.shared",
    workspaceId: "ws-ep-shared",
    workspaceName: "EP Shared Workspace",
    workspaceType: "SHARED",
    status: "ACTIVE",
    createdAt: REGISTRY_CREATED_AT,
  },
  {
    id: "ep.ws.reg.enterprise",
    workspaceId: "ws-ep-enterprise",
    workspaceName: "EP Enterprise Workspace",
    workspaceType: "ENTERPRISE",
    status: "ACTIVE",
    createdAt: REGISTRY_CREATED_AT,
  },
];

let cachedRegistry: WorkspaceRegistry[] | null = null;

function cloneEntry(row: WorkspaceRegistry): WorkspaceRegistry {
  return { ...row };
}

function sortStable(rows: readonly WorkspaceRegistry[]): WorkspaceRegistry[] {
  return [...rows].sort((a, b) => a.workspaceId.localeCompare(b.workspaceId));
}

function fingerprint(rows: readonly WorkspaceRegistry[]): string {
  return rows
    .map(
      (r) =>
        `${r.id}|${r.workspaceId}|${r.workspaceName}|${r.workspaceType}|${r.status}|${r.createdAt}`,
    )
    .join(";");
}

/**
 * Build the deterministic Workspace Registry (read-only snapshot).
 */
export function buildWorkspaceRegistry(): WorkspaceRegistry[] {
  const out = sortStable(WORKSPACE_SEED).map(cloneEntry);
  cachedRegistry = out.map(cloneEntry);
  return cachedRegistry.map(cloneEntry);
}

/**
 * Get the last built registry, or build if none cached.
 */
export function getWorkspaceRegistry(): WorkspaceRegistry[] {
  if (!cachedRegistry) {
    return buildWorkspaceRegistry();
  }
  return cachedRegistry.map(cloneEntry);
}

/** Stable content fingerprint for determinism checks. */
export function workspaceRegistryFingerprint(
  rows?: readonly WorkspaceRegistry[],
): string {
  const list = rows ?? getWorkspaceRegistry();
  return fingerprint(sortStable(list));
}

/** Test helper — clears cache only. */
export function clearWorkspaceRegistry(): void {
  cachedRegistry = null;
}
