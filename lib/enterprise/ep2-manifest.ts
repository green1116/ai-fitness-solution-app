/**
 * EP-2 / WP-16 — Closure & Freeze Manifest
 * Freezes WP-1~WP-15. Baseline: v80-pilot-ga-1.0.0.
 * Documentation / certification only — no new business capability.
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

import { PILOT_GA_VERSION } from "@/lib/pilot/v80/intake/ga-release.schema";

export const EP_2_WP16_ID = "WP-16" as const;
export const EP_2_FREEZE_VERSION = "ep-2-freeze-1.0.0" as const;
export const EP_2_CODENAME = "Enterprise Workspace Registry Freeze" as const;
export const EP_2_FREEZE_DATE = "2026-08-07" as const;
/** Frozen Pilot GA baseline — EP-2 reuses this only. */
export const EP_2_BASELINE = PILOT_GA_VERSION;

export type Ep2WorkPackageStatus = "frozen";

export type Ep2WorkPackageEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  getApi: string;
  deriveFrom: readonly string[];
  status: Ep2WorkPackageStatus;
}>;

export type Ep2Manifest = Readonly<{
  version: typeof EP_2_FREEZE_VERSION;
  codename: typeof EP_2_CODENAME;
  freezeDate: typeof EP_2_FREEZE_DATE;
  baseline: typeof EP_2_BASELINE;
  generatedAt: string;
  fingerprint: string;
  scope: {
    workPackages: "WP-1~WP-15";
    closure: "WP-16";
    noNewBusinessCapability: true;
    projectQuoteTenderModelsUnchanged: true;
    additiveOnly: true;
    readOnlyRegistries: true;
  };
  workPackages: readonly Ep2WorkPackageEntry[];
  dependencyChain: readonly string[];
  certification: "certified" | "blocked";
}>;

/**
 * Frozen catalog of EP-2 work packages (WP-1~WP-15).
 * Order matches dependency chain.
 */
export const EP_2_WORK_PACKAGES: readonly Ep2WorkPackageEntry[] = [
  {
    id: "WP-1",
    name: "Workspace Registry",
    capability: "WorkspaceRegistry",
    modulePath: "lib/enterprise/workspace-registry.ts",
    verifyScript: "scripts/verify-ep-wp1.ts",
    buildApi: "buildWorkspaceRegistry",
    getApi: "getWorkspaceRegistry",
    deriveFrom: [],
    status: "frozen",
  },
  {
    id: "WP-2",
    name: "Workspace Member Registry",
    capability: "WorkspaceMemberRegistry",
    modulePath: "lib/enterprise/workspace-member-registry.ts",
    verifyScript: "scripts/verify-ep-wp2.ts",
    buildApi: "buildWorkspaceMemberRegistry",
    getApi: "getWorkspaceMemberRegistry",
    deriveFrom: ["WP-1"],
    status: "frozen",
  },
  {
    id: "WP-3",
    name: "Workspace Role Registry",
    capability: "WorkspaceRoleRegistry",
    modulePath: "lib/enterprise/workspace-role-registry.ts",
    verifyScript: "scripts/verify-ep-wp3.ts",
    buildApi: "buildWorkspaceRoleRegistry",
    getApi: "getWorkspaceRoleRegistry",
    deriveFrom: ["WP-2"],
    status: "frozen",
  },
  {
    id: "WP-4",
    name: "Workspace Permission Registry",
    capability: "WorkspacePermissionRegistry",
    modulePath: "lib/enterprise/workspace-permission-registry.ts",
    verifyScript: "scripts/verify-ep-wp4.ts",
    buildApi: "buildWorkspacePermissionRegistry",
    getApi: "getWorkspacePermissionRegistry",
    deriveFrom: ["WP-3"],
    status: "frozen",
  },
  {
    id: "WP-5",
    name: "Workspace Access Registry",
    capability: "WorkspaceAccessRegistry",
    modulePath: "lib/enterprise/workspace-access-registry.ts",
    verifyScript: "scripts/verify-ep-wp5.ts",
    buildApi: "buildWorkspaceAccessRegistry",
    getApi: "getWorkspaceAccessRegistry",
    deriveFrom: ["WP-4"],
    status: "frozen",
  },
  {
    id: "WP-6",
    name: "Workspace Session Registry",
    capability: "WorkspaceSessionRegistry",
    modulePath: "lib/enterprise/workspace-session-registry.ts",
    verifyScript: "scripts/verify-ep-wp6.ts",
    buildApi: "buildWorkspaceSessionRegistry",
    getApi: "getWorkspaceSessionRegistry",
    deriveFrom: ["WP-5"],
    status: "frozen",
  },
  {
    id: "WP-7",
    name: "Workspace Event Registry",
    capability: "WorkspaceEventRegistry",
    modulePath: "lib/enterprise/workspace-event-registry.ts",
    verifyScript: "scripts/verify-ep-wp7.ts",
    buildApi: "buildWorkspaceEventRegistry",
    getApi: "getWorkspaceEventRegistry",
    deriveFrom: ["WP-6"],
    status: "frozen",
  },
  {
    id: "WP-8",
    name: "Workspace Activity Registry",
    capability: "WorkspaceActivityRegistry",
    modulePath: "lib/enterprise/workspace-activity-registry.ts",
    verifyScript: "scripts/verify-ep-wp8.ts",
    buildApi: "buildWorkspaceActivityRegistry",
    getApi: "getWorkspaceActivityRegistry",
    deriveFrom: ["WP-7"],
    status: "frozen",
  },
  {
    id: "WP-9",
    name: "Workspace Task Registry",
    capability: "WorkspaceTaskRegistry",
    modulePath: "lib/enterprise/workspace-task-registry.ts",
    verifyScript: "scripts/verify-ep-wp9.ts",
    buildApi: "buildWorkspaceTaskRegistry",
    getApi: "getWorkspaceTaskRegistry",
    deriveFrom: ["WP-8"],
    status: "frozen",
  },
  {
    id: "WP-10",
    name: "Workspace Queue Registry",
    capability: "WorkspaceQueueRegistry",
    modulePath: "lib/enterprise/workspace-queue-registry.ts",
    verifyScript: "scripts/verify-ep-wp10.ts",
    buildApi: "buildWorkspaceQueueRegistry",
    getApi: "getWorkspaceQueueRegistry",
    deriveFrom: ["WP-9"],
    status: "frozen",
  },
  {
    id: "WP-11",
    name: "Workspace Assignment Registry",
    capability: "WorkspaceAssignmentRegistry",
    modulePath: "lib/enterprise/workspace-assignment-registry.ts",
    verifyScript: "scripts/verify-ep-wp11.ts",
    buildApi: "buildWorkspaceAssignmentRegistry",
    getApi: "getWorkspaceAssignmentRegistry",
    deriveFrom: ["WP-10"],
    status: "frozen",
  },
  {
    id: "WP-12",
    name: "Workspace Execution Registry",
    capability: "WorkspaceExecutionRegistry",
    modulePath: "lib/enterprise/workspace-execution-registry.ts",
    verifyScript: "scripts/verify-ep-wp12.ts",
    buildApi: "buildWorkspaceExecutionRegistry",
    getApi: "getWorkspaceExecutionRegistry",
    deriveFrom: ["WP-11"],
    status: "frozen",
  },
  {
    id: "WP-13",
    name: "Workspace Result Registry",
    capability: "WorkspaceResultRegistry",
    modulePath: "lib/enterprise/workspace-result-registry.ts",
    verifyScript: "scripts/verify-ep-wp13.ts",
    buildApi: "buildWorkspaceResultRegistry",
    getApi: "getWorkspaceResultRegistry",
    deriveFrom: ["WP-12"],
    status: "frozen",
  },
  {
    id: "WP-14",
    name: "Workspace Snapshot",
    capability: "WorkspaceSnapshot",
    modulePath: "lib/enterprise/workspace-snapshot.ts",
    verifyScript: "scripts/verify-ep-wp14.ts",
    buildApi: "buildWorkspaceSnapshot",
    getApi: "getWorkspaceSnapshot",
    deriveFrom: [
      "WP-1",
      "WP-2",
      "WP-3",
      "WP-4",
      "WP-5",
      "WP-6",
      "WP-7",
      "WP-8",
      "WP-9",
      "WP-10",
      "WP-11",
      "WP-12",
      "WP-13",
    ],
    status: "frozen",
  },
  {
    id: "WP-15",
    name: "Workspace Query",
    capability: "WorkspaceQuery",
    modulePath: "lib/enterprise/workspace-query.ts",
    verifyScript: "scripts/verify-ep-wp15.ts",
    buildApi: "buildWorkspaceQuery",
    getApi: "getWorkspaceQuery",
    deriveFrom: ["WP-14"],
    status: "frozen",
  },
] as const;

export const EP_2_DEPENDENCY_CHAIN: readonly string[] =
  EP_2_WORK_PACKAGES.map((wp) => wp.id);

export const EP_2_CORE_MODELS_UNCHANGED = [
  "Project",
  "Quote",
  "Tender",
] as const;

function stableCatalogPayload(): string {
  return JSON.stringify({
    version: EP_2_FREEZE_VERSION,
    codename: EP_2_CODENAME,
    freezeDate: EP_2_FREEZE_DATE,
    baseline: EP_2_BASELINE,
    workPackages: EP_2_WORK_PACKAGES,
    dependencyChain: EP_2_DEPENDENCY_CHAIN,
    coreModelsUnchanged: EP_2_CORE_MODELS_UNCHANGED,
  });
}

/** Deterministic fingerprint of the frozen EP-2 catalog (excludes generatedAt). */
export function computeEp2Fingerprint(): string {
  return createHash("sha256").update(stableCatalogPayload()).digest("hex");
}

export function listEp2ArtifactPresence(cwd = process.cwd()): Array<{
  path: string;
  present: boolean;
}> {
  const paths = [
    ...EP_2_WORK_PACKAGES.flatMap((wp) => [wp.modulePath, wp.verifyScript]),
    "lib/enterprise/index.ts",
    "lib/enterprise/ep2-manifest.ts",
    "scripts/verify-ep2.ts",
  ];
  return paths.map((p) => ({
    path: p,
    present: existsSync(path.join(cwd, p)),
  }));
}

export function validateEp2DependencyChain(): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const known = new Set(EP_2_WORK_PACKAGES.map((wp) => wp.id));

  if (EP_2_WORK_PACKAGES.length !== 15) {
    errors.push(`expected 15 work packages, got ${EP_2_WORK_PACKAGES.length}`);
  }

  for (let i = 0; i < EP_2_WORK_PACKAGES.length; i++) {
    const wp = EP_2_WORK_PACKAGES[i]!;
    const expectedId = `WP-${i + 1}`;
    if (wp.id !== expectedId) {
      errors.push(`index ${i}: expected ${expectedId}, got ${wp.id}`);
    }
    for (const dep of wp.deriveFrom) {
      if (!known.has(dep)) {
        errors.push(`${wp.id} derives from unknown ${dep}`);
      }
      const depIndex = EP_2_WORK_PACKAGES.findIndex((x) => x.id === dep);
      if (depIndex < 0 || depIndex >= i) {
        errors.push(`${wp.id} must derive from earlier WP, got ${dep}`);
      }
    }
  }

  for (let i = 0; i < EP_2_DEPENDENCY_CHAIN.length; i++) {
    if (EP_2_DEPENDENCY_CHAIN[i] !== EP_2_WORK_PACKAGES[i]?.id) {
      errors.push(`dependency chain mismatch at ${i}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Build the EP-2 freeze manifest (read-only certification snapshot).
 */
export function buildEp2Manifest(): Ep2Manifest {
  const artifacts = listEp2ArtifactPresence();
  const chain = validateEp2DependencyChain();
  const allPresent = artifacts.every((a) => a.present);
  const fingerprint = computeEp2Fingerprint();

  return {
    version: EP_2_FREEZE_VERSION,
    codename: EP_2_CODENAME,
    freezeDate: EP_2_FREEZE_DATE,
    baseline: EP_2_BASELINE,
    generatedAt: new Date().toISOString(),
    fingerprint,
    scope: {
      workPackages: "WP-1~WP-15",
      closure: "WP-16",
      noNewBusinessCapability: true,
      projectQuoteTenderModelsUnchanged: true,
      additiveOnly: true,
      readOnlyRegistries: true,
    },
    workPackages: EP_2_WORK_PACKAGES,
    dependencyChain: EP_2_DEPENDENCY_CHAIN,
    certification: allPresent && chain.ok ? "certified" : "blocked",
  };
}
