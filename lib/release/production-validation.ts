/**
 * Release / WP-3 — Production Validation
 * Validates production surfaces against WP-2 Release Candidate.
 * Additive. No mocks. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 + Release WP-1~WP-2.
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

import {
  EP_4_PRODUCTION_HANDLERS,
  EP_4_PRODUCTION_PAGE_FILES,
  EP_4_PRODUCTION_ROUTES,
  EP_4_PRODUCTION_UI_HOST,
  EP_4_PRODUCTION_UI_HOST_FILE,
} from "@/lib/enterprise/ep4-manifest";
import { WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO } from "@/lib/enterprise/workflow-production-ui";

import {
  RELEASE_ID,
  getReleaseReadiness,
  type ReleaseRollbackGate,
} from "./release-readiness";
import {
  RELEASE_CANDIDATE_BASELINE,
  getReleaseCandidate,
  type ReleaseCandidate,
} from "./release-candidate";

export const RELEASE_WP3_ID = "WP-3" as const;
export const PRODUCTION_VALIDATION_CAPABILITY =
  "ProductionValidation" as const;
export const PRODUCTION_VALIDATION_VERSION =
  "release-wp-3-production-validation-1" as const;
/** Reuses Pilot GA + Release WP-1~WP-2 baseline. */
export const PRODUCTION_VALIDATION_BASELINE = RELEASE_CANDIDATE_BASELINE;

export type ProductionValidationChecks = Readonly<{
  productionRoutes: boolean;
  actions: boolean;
  apis: boolean;
  noMock: boolean;
  rollback: boolean;
  fingerprint: boolean;
}>;

export type ProductionValidation = Readonly<{
  version: typeof PRODUCTION_VALIDATION_VERSION;
  baseline: typeof PRODUCTION_VALIDATION_BASELINE;
  capability: typeof PRODUCTION_VALIDATION_CAPABILITY;
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RELEASE_WP3_ID;
  status: "PASS" | "FAIL";
  fingerprint: string;
  candidateFingerprint: string;
  routes: readonly string[];
  handlers: readonly string[];
  uiHostComponent: string;
  rollback: ReleaseRollbackGate;
  checks: ProductionValidationChecks;
  mocked: false;
}>;

let cached: ProductionValidation | null = null;

function cloneValidation(row: ProductionValidation): ProductionValidation {
  return {
    ...row,
    routes: [...row.routes],
    handlers: [...row.handlers],
    checks: { ...row.checks },
    rollback: {
      ...row.rollback,
      restoreTargets: [...row.rollback.restoreTargets],
    },
  };
}

function root(...parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}

function stablePayload(row: Omit<ProductionValidation, "fingerprint">): string {
  return JSON.stringify({
    version: row.version,
    baseline: row.baseline,
    capability: row.capability,
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    status: row.status,
    candidateFingerprint: row.candidateFingerprint,
    routes: row.routes,
    handlers: row.handlers,
    uiHostComponent: row.uiHostComponent,
    rollback: row.rollback,
    checks: row.checks,
    mocked: row.mocked,
  });
}

function computeFingerprint(
  row: Omit<ProductionValidation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function validateRoutes(): boolean {
  if (!existsSync(root(EP_4_PRODUCTION_UI_HOST_FILE))) return false;
  for (const route of EP_4_PRODUCTION_ROUTES) {
    const pageFile = EP_4_PRODUCTION_PAGE_FILES[route];
    if (!existsSync(root(pageFile))) return false;
  }
  return true;
}

function validateApis(): boolean {
  for (const scenario of Object.keys(
    WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO,
  ) as Array<keyof typeof WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO>) {
    const files = WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO[scenario];
    if (!existsSync(root(files.apiRouteFile))) return false;
    if (!existsSync(root(files.handlerFile))) return false;
  }
  return EP_4_PRODUCTION_HANDLERS.length === 4;
}

function validateActions(): boolean {
  if (!existsSync(root(EP_4_PRODUCTION_UI_HOST_FILE))) return false;
  for (const scenario of Object.keys(
    WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO,
  ) as Array<keyof typeof WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO>) {
    const files = WORKFLOW_PRODUCTION_SURFACE_BY_SCENARIO[scenario];
    if (!existsSync(root(files.uiFile))) return false;
  }
  return true;
}

function deriveFromCandidate(
  candidate: ReleaseCandidate,
): ProductionValidation {
  const readiness = getReleaseReadiness();

  const productionRoutes = validateRoutes();
  const actions =
    validateActions() &&
    readiness.checks.actionsOk === true &&
    candidate.status === "READY";
  const apis =
    validateApis() &&
    readiness.checks.apisOk === true &&
    JSON.stringify([...readiness.handlers]) ===
      JSON.stringify([...EP_4_PRODUCTION_HANDLERS]);
  const noMock =
    candidate.rollback.mocked === false &&
    readiness.checks.noMock === true &&
    candidate.certification === "certified";
  const rollback =
    candidate.rollback.ready === true &&
    readiness.checks.rollbackOk === true &&
    candidate.rollback.restoreTargets.length === 4;
  const fingerprintOk =
    candidate.fingerprint.length === 64 &&
    readiness.fingerprint.length === 64 &&
    candidate.readinessFingerprint === readiness.fingerprint;

  const checks: ProductionValidationChecks = {
    productionRoutes,
    actions,
    apis,
    noMock,
    rollback,
    fingerprint: fingerprintOk,
  };

  const allPass =
    checks.productionRoutes &&
    checks.actions &&
    checks.apis &&
    checks.noMock &&
    checks.rollback &&
    checks.fingerprint &&
    candidate.status === "READY" &&
    candidate.certification === "certified";

  const withoutFp: Omit<ProductionValidation, "fingerprint"> = {
    version: PRODUCTION_VALIDATION_VERSION,
    baseline: PRODUCTION_VALIDATION_BASELINE,
    capability: PRODUCTION_VALIDATION_CAPABILITY,
    releaseId: RELEASE_ID,
    workPackageId: RELEASE_WP3_ID,
    status: allPass ? "PASS" : "FAIL",
    candidateFingerprint: candidate.fingerprint,
    routes: [...EP_4_PRODUCTION_ROUTES],
    handlers: [...EP_4_PRODUCTION_HANDLERS],
    uiHostComponent: EP_4_PRODUCTION_UI_HOST,
    rollback: {
      ready: candidate.rollback.ready,
      strategy: candidate.rollback.strategy,
      restoreTargets: [...candidate.rollback.restoreTargets],
      mocked: false,
    },
    checks,
    mocked: false,
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/**
 * Build production validation from WP-2 Release Candidate.
 */
export function buildProductionValidation(): ProductionValidation {
  const candidate = getReleaseCandidate();
  const out = deriveFromCandidate(candidate);
  cached = cloneValidation(out);
  return cloneValidation(cached);
}

/**
 * Get the last built validation, or build if none cached.
 */
export function getProductionValidation(): ProductionValidation {
  if (!cached) {
    return buildProductionValidation();
  }
  return cloneValidation(cached);
}

/** Stable content fingerprint for determinism checks. */
export function productionValidationFingerprint(
  row?: ProductionValidation,
): string {
  const v = row ?? getProductionValidation();
  return v.fingerprint;
}

/** Test helper — clears production validation cache only. */
export function clearProductionValidation(): void {
  cached = null;
}
