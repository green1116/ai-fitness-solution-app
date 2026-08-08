/**
 * Release / WP-4 — GA Release & Freeze
 * Freezes the release train from WP-3 Production Validation.
 * Additive. No mocks. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 + Release WP-1~WP-3.
 */

import { createHash } from "node:crypto";

import {
  RELEASE_ID,
  type ReleaseRollbackGate,
} from "./release-readiness";
import {
  PRODUCTION_VALIDATION_BASELINE,
  getProductionValidation,
  type ProductionValidation,
} from "./production-validation";

export const RELEASE_WP4_ID = "WP-4" as const;
export const GA_RELEASE_CAPABILITY = "GaRelease" as const;
export const GA_RELEASE_VERSION = "release-wp-4-ga-1.0.0" as const;
export const GA_RELEASE_FREEZE_VERSION = "release-ga-freeze-1.0.0" as const;
export const GA_RELEASE_CODENAME = "Enterprise Release GA Freeze" as const;
export const GA_RELEASE_FREEZE_DATE = "2026-08-08" as const;
/** Reuses Pilot GA + Release WP-1~WP-3 baseline. */
export const GA_RELEASE_BASELINE = PRODUCTION_VALIDATION_BASELINE;

export type GaRelease = Readonly<{
  version: typeof GA_RELEASE_VERSION;
  baseline: typeof GA_RELEASE_BASELINE;
  status: "GA" | "BLOCKED";
  certification: "certified" | "blocked";
  fingerprint: string;
  rollback: ReleaseRollbackGate;
  capability: typeof GA_RELEASE_CAPABILITY;
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RELEASE_WP4_ID;
  freezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  codename: typeof GA_RELEASE_CODENAME;
  freezeDate: typeof GA_RELEASE_FREEZE_DATE;
  productionStatus: ProductionValidation["status"];
  productionFingerprint: string;
  scope: {
    workPackages: "WP-1~WP-3";
    closure: "WP-4";
    noNewBusinessCapability: true;
    additiveOnly: true;
    productionValidated: true;
  };
}>;

let cached: GaRelease | null = null;

function cloneGa(row: GaRelease): GaRelease {
  return {
    ...row,
    rollback: {
      ...row.rollback,
      restoreTargets: [...row.rollback.restoreTargets],
    },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<GaRelease, "fingerprint">): string {
  return JSON.stringify({
    version: row.version,
    baseline: row.baseline,
    status: row.status,
    certification: row.certification,
    rollback: row.rollback,
    capability: row.capability,
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    freezeVersion: row.freezeVersion,
    codename: row.codename,
    freezeDate: row.freezeDate,
    productionStatus: row.productionStatus,
    productionFingerprint: row.productionFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<GaRelease, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFromProduction(
  production: ProductionValidation,
): GaRelease {
  const gaReady =
    production.status === "PASS" &&
    production.mocked === false &&
    production.rollback.ready === true &&
    production.checks.productionRoutes === true &&
    production.checks.actions === true &&
    production.checks.apis === true &&
    production.checks.noMock === true &&
    production.checks.rollback === true &&
    production.checks.fingerprint === true &&
    production.fingerprint.length === 64;

  const withoutFp: Omit<GaRelease, "fingerprint"> = {
    version: GA_RELEASE_VERSION,
    baseline: GA_RELEASE_BASELINE,
    status: gaReady ? "GA" : "BLOCKED",
    certification: gaReady ? "certified" : "blocked",
    rollback: {
      ready: production.rollback.ready,
      strategy: production.rollback.strategy,
      restoreTargets: [...production.rollback.restoreTargets],
      mocked: false,
    },
    capability: GA_RELEASE_CAPABILITY,
    releaseId: RELEASE_ID,
    workPackageId: RELEASE_WP4_ID,
    freezeVersion: GA_RELEASE_FREEZE_VERSION,
    codename: GA_RELEASE_CODENAME,
    freezeDate: GA_RELEASE_FREEZE_DATE,
    productionStatus: production.status,
    productionFingerprint: production.fingerprint,
    scope: {
      workPackages: "WP-1~WP-3",
      closure: "WP-4",
      noNewBusinessCapability: true,
      additiveOnly: true,
      productionValidated: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/**
 * Build GA Release & Freeze from WP-3 Production Validation.
 */
export function buildGaRelease(): GaRelease {
  const production = getProductionValidation();
  const out = deriveFromProduction(production);
  cached = cloneGa(out);
  return cloneGa(cached);
}

/**
 * Get the last built GA release, or build if none cached.
 */
export function getGaRelease(): GaRelease {
  if (!cached) {
    return buildGaRelease();
  }
  return cloneGa(cached);
}

/** Stable content fingerprint for determinism checks. */
export function gaReleaseFingerprint(row?: GaRelease): string {
  const v = row ?? getGaRelease();
  return v.fingerprint;
}

/** Test helper — clears GA release cache only. */
export function clearGaRelease(): void {
  cached = null;
}
