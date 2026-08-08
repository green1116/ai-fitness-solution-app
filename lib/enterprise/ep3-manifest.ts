/**
 * EP-3 / WP-9 — Closure & Freeze Manifest
 * Freezes WP-1~WP-8. Baseline: v80-pilot-ga-1.0.0.
 * Documentation / certification only — no new business capability.
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

import { PILOT_GA_VERSION } from "@/lib/pilot/v80/intake/ga-release.schema";

export const EP_3_WP9_ID = "WP-9" as const;
export const EP_3_FREEZE_VERSION = "ep-3-freeze-1.0.0" as const;
export const EP_3_CODENAME = "Enterprise Collaboration Freeze" as const;
export const EP_3_FREEZE_DATE = "2026-08-07" as const;
/** Frozen Pilot GA baseline — EP-3 reuses this only. */
export const EP_3_BASELINE = PILOT_GA_VERSION;

export type Ep3WorkPackageStatus = "frozen";

export type Ep3WorkPackageEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  getApi: string;
  deriveFrom: readonly string[];
  status: Ep3WorkPackageStatus;
}>;

export type Ep3Manifest = Readonly<{
  version: typeof EP_3_FREEZE_VERSION;
  codename: typeof EP_3_CODENAME;
  freezeDate: typeof EP_3_FREEZE_DATE;
  baseline: typeof EP_3_BASELINE;
  generatedAt: string;
  fingerprint: string;
  scope: {
    workPackages: "WP-1~WP-8";
    closure: "WP-9";
    noNewBusinessCapability: true;
    projectQuoteTenderModelsUnchanged: true;
    additiveOnly: true;
    readOnlyRegistries: true;
  };
  workPackages: readonly Ep3WorkPackageEntry[];
  dependencyChain: readonly string[];
  certification: "certified" | "blocked";
}>;

/**
 * Frozen catalog of EP-3 work packages (WP-1~WP-8).
 * Order matches dependency chain.
 */
export const EP_3_WORK_PACKAGES: readonly Ep3WorkPackageEntry[] = [
  {
    id: "WP-1",
    name: "Collaboration Context",
    capability: "CollaborationContext",
    modulePath: "lib/enterprise/collaboration-context.ts",
    verifyScript: "scripts/verify-ep3-wp1.ts",
    buildApi: "buildCollaborationContext",
    getApi: "getCollaborationContext",
    deriveFrom: [],
    status: "frozen",
  },
  {
    id: "WP-2",
    name: "Collaboration Thread Registry",
    capability: "CollaborationThreadRegistry",
    modulePath: "lib/enterprise/collaboration-thread-registry.ts",
    verifyScript: "scripts/verify-ep3-wp2.ts",
    buildApi: "buildCollaborationThreadRegistry",
    getApi: "getCollaborationThreadRegistry",
    deriveFrom: ["WP-1"],
    status: "frozen",
  },
  {
    id: "WP-3",
    name: "Collaboration Message Registry",
    capability: "CollaborationMessageRegistry",
    modulePath: "lib/enterprise/collaboration-message-registry.ts",
    verifyScript: "scripts/verify-ep3-wp3.ts",
    buildApi: "buildCollaborationMessageRegistry",
    getApi: "getCollaborationMessageRegistry",
    deriveFrom: ["WP-2"],
    status: "frozen",
  },
  {
    id: "WP-4",
    name: "Collaboration Reaction Registry",
    capability: "CollaborationReactionRegistry",
    modulePath: "lib/enterprise/collaboration-reaction-registry.ts",
    verifyScript: "scripts/verify-ep3-wp4.ts",
    buildApi: "buildCollaborationReactionRegistry",
    getApi: "getCollaborationReactionRegistry",
    deriveFrom: ["WP-3"],
    status: "frozen",
  },
  {
    id: "WP-5",
    name: "Collaboration Presence Registry",
    capability: "CollaborationPresenceRegistry",
    modulePath: "lib/enterprise/collaboration-presence-registry.ts",
    verifyScript: "scripts/verify-ep3-wp5.ts",
    buildApi: "buildCollaborationPresenceRegistry",
    getApi: "getCollaborationPresenceRegistry",
    deriveFrom: ["WP-4"],
    status: "frozen",
  },
  {
    id: "WP-6",
    name: "Collaboration Status Registry",
    capability: "CollaborationStatusRegistry",
    modulePath: "lib/enterprise/collaboration-status-registry.ts",
    verifyScript: "scripts/verify-ep3-wp6.ts",
    buildApi: "buildCollaborationStatusRegistry",
    getApi: "getCollaborationStatusRegistry",
    deriveFrom: ["WP-5"],
    status: "frozen",
  },
  {
    id: "WP-7",
    name: "Collaboration Snapshot",
    capability: "CollaborationSnapshot",
    modulePath: "lib/enterprise/collaboration-snapshot.ts",
    verifyScript: "scripts/verify-ep3-wp7.ts",
    buildApi: "buildCollaborationSnapshot",
    getApi: "getCollaborationSnapshot",
    deriveFrom: ["WP-1", "WP-2", "WP-3", "WP-4", "WP-5", "WP-6"],
    status: "frozen",
  },
  {
    id: "WP-8",
    name: "Collaboration Query",
    capability: "CollaborationQuery",
    modulePath: "lib/enterprise/collaboration-query.ts",
    verifyScript: "scripts/verify-ep3-wp8.ts",
    buildApi: "buildCollaborationQuery",
    getApi: "getCollaborationQuery",
    deriveFrom: ["WP-7"],
    status: "frozen",
  },
] as const;

export const EP_3_DEPENDENCY_CHAIN: readonly string[] =
  EP_3_WORK_PACKAGES.map((wp) => wp.id);

export const EP_3_CORE_MODELS_UNCHANGED = [
  "Project",
  "Quote",
  "Tender",
] as const;

function stableCatalogPayload(): string {
  return JSON.stringify({
    version: EP_3_FREEZE_VERSION,
    codename: EP_3_CODENAME,
    freezeDate: EP_3_FREEZE_DATE,
    baseline: EP_3_BASELINE,
    workPackages: EP_3_WORK_PACKAGES,
    dependencyChain: EP_3_DEPENDENCY_CHAIN,
    coreModelsUnchanged: EP_3_CORE_MODELS_UNCHANGED,
  });
}

/** Deterministic fingerprint of the frozen EP-3 catalog (excludes generatedAt). */
export function computeEp3Fingerprint(): string {
  return createHash("sha256").update(stableCatalogPayload()).digest("hex");
}

export function listEp3ArtifactPresence(cwd = process.cwd()): Array<{
  path: string;
  present: boolean;
}> {
  const paths = [
    ...EP_3_WORK_PACKAGES.flatMap((wp) => [wp.modulePath, wp.verifyScript]),
    "lib/enterprise/index.ts",
    "lib/enterprise/ep3-manifest.ts",
    "scripts/verify-ep3.ts",
  ];
  return paths.map((p) => ({
    path: p,
    present: existsSync(path.join(cwd, p)),
  }));
}

export function validateEp3DependencyChain(): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const known = new Set(EP_3_WORK_PACKAGES.map((wp) => wp.id));

  if (EP_3_WORK_PACKAGES.length !== 8) {
    errors.push(`expected 8 work packages, got ${EP_3_WORK_PACKAGES.length}`);
  }

  for (let i = 0; i < EP_3_WORK_PACKAGES.length; i++) {
    const wp = EP_3_WORK_PACKAGES[i]!;
    const expectedId = `WP-${i + 1}`;
    if (wp.id !== expectedId) {
      errors.push(`index ${i}: expected ${expectedId}, got ${wp.id}`);
    }
    for (const dep of wp.deriveFrom) {
      if (!known.has(dep)) {
        errors.push(`${wp.id} derives from unknown ${dep}`);
      }
      const depIndex = EP_3_WORK_PACKAGES.findIndex((x) => x.id === dep);
      if (depIndex < 0 || depIndex >= i) {
        errors.push(`${wp.id} must derive from earlier WP, got ${dep}`);
      }
    }
  }

  for (let i = 0; i < EP_3_DEPENDENCY_CHAIN.length; i++) {
    if (EP_3_DEPENDENCY_CHAIN[i] !== EP_3_WORK_PACKAGES[i]?.id) {
      errors.push(`dependency chain mismatch at ${i}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Build the EP-3 freeze manifest (read-only certification snapshot).
 */
export function buildEp3Manifest(): Ep3Manifest {
  const artifacts = listEp3ArtifactPresence();
  const chain = validateEp3DependencyChain();
  const allPresent = artifacts.every((a) => a.present);
  const fingerprint = computeEp3Fingerprint();

  return {
    version: EP_3_FREEZE_VERSION,
    codename: EP_3_CODENAME,
    freezeDate: EP_3_FREEZE_DATE,
    baseline: EP_3_BASELINE,
    generatedAt: new Date().toISOString(),
    fingerprint,
    scope: {
      workPackages: "WP-1~WP-8",
      closure: "WP-9",
      noNewBusinessCapability: true,
      projectQuoteTenderModelsUnchanged: true,
      additiveOnly: true,
      readOnlyRegistries: true,
    },
    workPackages: EP_3_WORK_PACKAGES,
    dependencyChain: EP_3_DEPENDENCY_CHAIN,
    certification: allPresent && chain.ok ? "certified" : "blocked",
  };
}
