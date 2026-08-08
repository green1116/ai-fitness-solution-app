/**
 * EP-4 / WP-11 — Closure & Freeze Manifest
 * Freezes WP-1~WP-10. Baseline: v80-pilot-ga-1.0.0.
 * Documentation / certification only — no new business capability.
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

import { PILOT_GA_VERSION } from "@/lib/pilot/v80/intake/ga-release.schema";

export const EP_4_WP11_ID = "WP-11" as const;
export const EP_4_FREEZE_VERSION = "ep-4-freeze-1.0.0" as const;
export const EP_4_CODENAME = "Enterprise Application Workflow Freeze" as const;
export const EP_4_FREEZE_DATE = "2026-08-08" as const;
/** Frozen Pilot GA baseline — EP-4 reuses this only. */
export const EP_4_BASELINE = PILOT_GA_VERSION;

export type Ep4WorkPackageStatus = "frozen";

export type Ep4WorkPackageEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  getApi: string;
  deriveFrom: readonly string[];
  status: Ep4WorkPackageStatus;
}>;

export type Ep4Manifest = Readonly<{
  version: typeof EP_4_FREEZE_VERSION;
  codename: typeof EP_4_CODENAME;
  freezeDate: typeof EP_4_FREEZE_DATE;
  baseline: typeof EP_4_BASELINE;
  generatedAt: string;
  fingerprint: string;
  scope: {
    workPackages: "WP-1~WP-10";
    closure: "WP-11";
    noNewBusinessCapability: true;
    projectQuoteTenderModelsUnchanged: true;
    additiveOnly: true;
    readOnlyRegistries: true;
    productionUiIntegrated: true;
  };
  workPackages: readonly Ep4WorkPackageEntry[];
  dependencyChain: readonly string[];
  productionRoutes: readonly string[];
  productionHandlers: readonly string[];
  productionUiHost: string;
  certification: "certified" | "blocked";
}>;

/**
 * Frozen catalog of EP-4 work packages (WP-1~WP-10).
 * Order matches dependency chain.
 */
export const EP_4_WORK_PACKAGES: readonly Ep4WorkPackageEntry[] = [
  {
    id: "WP-1",
    name: "Workflow Context",
    capability: "WorkflowContext",
    modulePath: "lib/enterprise/workflow-context.ts",
    verifyScript: "scripts/verify-ep4-wp1.ts",
    buildApi: "buildWorkflowContext",
    getApi: "getWorkflowContext",
    deriveFrom: [],
    status: "frozen",
  },
  {
    id: "WP-2",
    name: "Application Workflow Definition",
    capability: "WorkflowDefinition",
    modulePath: "lib/enterprise/workflow-definition.ts",
    verifyScript: "scripts/verify-ep4-wp2.ts",
    buildApi: "buildWorkflowDefinition",
    getApi: "getWorkflowDefinition",
    deriveFrom: ["WP-1"],
    status: "frozen",
  },
  {
    id: "WP-3",
    name: "Application Workflow View",
    capability: "WorkflowView",
    modulePath: "lib/enterprise/workflow-view.ts",
    verifyScript: "scripts/verify-ep4-wp3.ts",
    buildApi: "buildWorkflowView",
    getApi: "getWorkflowView",
    deriveFrom: ["WP-2"],
    status: "frozen",
  },
  {
    id: "WP-4",
    name: "Application Workflow API",
    capability: "WorkflowApi",
    modulePath: "lib/enterprise/workflow-api.ts",
    verifyScript: "scripts/verify-ep4-wp4.ts",
    buildApi: "buildWorkflowApi",
    getApi: "getWorkflowApi",
    deriveFrom: ["WP-3"],
    status: "frozen",
  },
  {
    id: "WP-5",
    name: "Application Workflow UI Contract",
    capability: "WorkflowUiContract",
    modulePath: "lib/enterprise/workflow-ui-contract.ts",
    verifyScript: "scripts/verify-ep4-wp5.ts",
    buildApi: "buildWorkflowUiContract",
    getApi: "getWorkflowUiContract",
    deriveFrom: ["WP-4"],
    status: "frozen",
  },
  {
    id: "WP-6",
    name: "Application Workflow Executor",
    capability: "WorkflowExecutor",
    modulePath: "lib/enterprise/workflow-executor.ts",
    verifyScript: "scripts/verify-ep4-wp6.ts",
    buildApi: "buildWorkflowExecutor",
    getApi: "getWorkflowExecutor",
    deriveFrom: ["WP-5"],
    status: "frozen",
  },
  {
    id: "WP-7",
    name: "Workflow Integration",
    capability: "WorkflowIntegration",
    modulePath: "lib/enterprise/workflow-integration.ts",
    verifyScript: "scripts/verify-ep4-wp7.ts",
    buildApi: "buildWorkflowIntegration",
    getApi: "getWorkflowIntegration",
    deriveFrom: ["WP-6"],
    status: "frozen",
  },
  {
    id: "WP-8",
    name: "Workflow Entry Panel",
    capability: "WorkflowEntryPanel",
    modulePath: "lib/enterprise/workflow-entry-panel.ts",
    verifyScript: "scripts/verify-ep4-wp8.ts",
    buildApi: "buildWorkflowEntryPanel",
    getApi: "getWorkflowEntryPanel",
    deriveFrom: ["WP-7"],
    status: "frozen",
  },
  {
    id: "WP-9",
    name: "Production UI Integration",
    capability: "WorkflowProductionUi",
    modulePath: "lib/enterprise/workflow-production-ui.ts",
    verifyScript: "scripts/verify-ep4-wp9.ts",
    buildApi: "buildWorkflowProductionUi",
    getApi: "getWorkflowProductionUi",
    deriveFrom: ["WP-8"],
    status: "frozen",
  },
  {
    id: "WP-10",
    name: "End-to-End Verification",
    capability: "WorkflowE2eVerification",
    modulePath: "lib/enterprise/workflow-e2e.ts",
    verifyScript: "scripts/verify-ep4-wp10.ts",
    buildApi: "buildWorkflowE2eVerification",
    getApi: "getWorkflowE2eVerification",
    deriveFrom: ["WP-9"],
    status: "frozen",
  },
] as const;

export const EP_4_DEPENDENCY_CHAIN: readonly string[] =
  EP_4_WORK_PACKAGES.map((wp) => wp.id);

export const EP_4_CORE_MODELS_UNCHANGED = [
  "Project",
  "Quote",
  "Tender",
] as const;

/** Production host routes frozen with EP-4. */
export const EP_4_PRODUCTION_ROUTES = [
  "/pilot/intake",
  "/dashboard/command-center",
] as const;

/** Production handlers frozen with EP-4. */
export const EP_4_PRODUCTION_HANDLERS = [
  "uploadTenderIntake",
  "approveTenderIntake",
  "buildIntakeHandoffPackage",
  "postCommandDispatch",
] as const;

export const EP_4_PRODUCTION_UI_HOST = "WorkflowEntryPanelActions" as const;

export const EP_4_PRODUCTION_PAGE_FILES = {
  "/pilot/intake": "app/(pilot)/pilot/intake/page.tsx",
  "/dashboard/command-center": "app/dashboard/command-center/page.tsx",
} as const;

export const EP_4_PRODUCTION_UI_HOST_FILE =
  "components/enterprise/WorkflowEntryPanelActions.tsx" as const;

function stableCatalogPayload(): string {
  return JSON.stringify({
    version: EP_4_FREEZE_VERSION,
    codename: EP_4_CODENAME,
    freezeDate: EP_4_FREEZE_DATE,
    baseline: EP_4_BASELINE,
    workPackages: EP_4_WORK_PACKAGES,
    dependencyChain: EP_4_DEPENDENCY_CHAIN,
    coreModelsUnchanged: EP_4_CORE_MODELS_UNCHANGED,
    productionRoutes: EP_4_PRODUCTION_ROUTES,
    productionHandlers: EP_4_PRODUCTION_HANDLERS,
    productionUiHost: EP_4_PRODUCTION_UI_HOST,
  });
}

/** Deterministic fingerprint of the frozen EP-4 catalog (excludes generatedAt). */
export function computeEp4Fingerprint(): string {
  return createHash("sha256").update(stableCatalogPayload()).digest("hex");
}

export function listEp4ArtifactPresence(cwd = process.cwd()): Array<{
  path: string;
  present: boolean;
}> {
  const paths = [
    ...EP_4_WORK_PACKAGES.flatMap((wp) => [wp.modulePath, wp.verifyScript]),
    "lib/enterprise/index.ts",
    "lib/enterprise/ep4-manifest.ts",
    "scripts/verify-ep4.ts",
    EP_4_PRODUCTION_UI_HOST_FILE,
    ...Object.values(EP_4_PRODUCTION_PAGE_FILES),
  ];
  return paths.map((p) => ({
    path: p,
    present: existsSync(path.join(cwd, p)),
  }));
}

export function validateEp4DependencyChain(): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const known = new Set(EP_4_WORK_PACKAGES.map((wp) => wp.id));

  if (EP_4_WORK_PACKAGES.length !== 10) {
    errors.push(`expected 10 work packages, got ${EP_4_WORK_PACKAGES.length}`);
  }

  for (let i = 0; i < EP_4_WORK_PACKAGES.length; i++) {
    const wp = EP_4_WORK_PACKAGES[i]!;
    const expectedId = `WP-${i + 1}`;
    if (wp.id !== expectedId) {
      errors.push(`index ${i}: expected ${expectedId}, got ${wp.id}`);
    }
    for (const dep of wp.deriveFrom) {
      if (!known.has(dep)) {
        errors.push(`${wp.id} derives from unknown ${dep}`);
      }
      const depIndex = EP_4_WORK_PACKAGES.findIndex((x) => x.id === dep);
      if (depIndex < 0 || depIndex >= i) {
        errors.push(`${wp.id} must derive from earlier WP, got ${dep}`);
      }
    }
  }

  for (let i = 0; i < EP_4_DEPENDENCY_CHAIN.length; i++) {
    if (EP_4_DEPENDENCY_CHAIN[i] !== EP_4_WORK_PACKAGES[i]?.id) {
      errors.push(`dependency chain mismatch at ${i}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Build the EP-4 freeze manifest (read-only certification snapshot).
 */
export function buildEp4Manifest(): Ep4Manifest {
  const artifacts = listEp4ArtifactPresence();
  const chain = validateEp4DependencyChain();
  const allPresent = artifacts.every((a) => a.present);
  const fingerprint = computeEp4Fingerprint();

  return {
    version: EP_4_FREEZE_VERSION,
    codename: EP_4_CODENAME,
    freezeDate: EP_4_FREEZE_DATE,
    baseline: EP_4_BASELINE,
    generatedAt: new Date().toISOString(),
    fingerprint,
    scope: {
      workPackages: "WP-1~WP-10",
      closure: "WP-11",
      noNewBusinessCapability: true,
      projectQuoteTenderModelsUnchanged: true,
      additiveOnly: true,
      readOnlyRegistries: true,
      productionUiIntegrated: true,
    },
    workPackages: EP_4_WORK_PACKAGES,
    dependencyChain: EP_4_DEPENDENCY_CHAIN,
    productionRoutes: [...EP_4_PRODUCTION_ROUTES],
    productionHandlers: [...EP_4_PRODUCTION_HANDLERS],
    productionUiHost: EP_4_PRODUCTION_UI_HOST,
    certification: allPresent && chain.ok ? "certified" : "blocked",
  };
}
