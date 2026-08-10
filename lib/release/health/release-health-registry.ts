/**
 * PG-1.1 — Production Release Health Registry
 * Read-only deterministic registry foundation.
 * Baseline: post-ga-production-baseline-v1 (reuses GA release train).
 * No DB / UI / business logic / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
  buildGaRelease,
  getGaRelease,
  type GaRelease,
} from "../ga-release";
import { RELEASE_ID, type ReleaseRollbackGate } from "../release-readiness";

export const PG_1_1_ID = "PG-1.1" as const;
export const RELEASE_HEALTH_REGISTRY_CAPABILITY =
  "ReleaseHealthRegistry" as const;
export const RELEASE_HEALTH_REGISTRY_VERSION =
  "pg-1.1-release-health-registry-1" as const;
/** Post-GA production foundation baseline. */
export const POST_GA_PRODUCTION_BASELINE =
  "post-ga-production-baseline-v1" as const;
/**
 * Frozen commit reference for the certified GA release tag
 * (`release-wp-4-ga-1.0.0`). Not resolved via live git.
 */
export const RELEASE_HEALTH_COMMIT_REF =
  "a2407e3afda8f031ee04d38d9061cd6d9e3fc50b" as const;
export const RELEASE_HEALTH_GA_TAG = GA_RELEASE_VERSION;
export const RELEASE_HEALTH_FREEZE_TAG = GA_RELEASE_FREEZE_VERSION;

export type ReleaseHealthVerificationStatus = "PASS" | "FAIL" | "PENDING";

/**
 * Deployment metadata contract — shape only; registry does not deploy.
 * Live fields stay unset in the foundation record for determinism.
 */
export type ReleaseHealthDeploymentMetadata = Readonly<{
  environment: "production";
  provider: "vercel";
  /** Present when a production deploy is recorded by a later pack. */
  productionUrl: string | null;
  deploymentId: string | null;
  deployedAt: string | null;
  contractVersion: "pg-1.1-deploy-meta-1";
}>;

export type ReleaseHealthRollbackReference = Readonly<{
  strategy: ReleaseRollbackGate["strategy"];
  ready: boolean;
  gaVersion: typeof GA_RELEASE_VERSION;
  freezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  restoreTargets: readonly string[];
  mocked: false;
}>;

export type ReleaseHealthRecord = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_1_1_ID;
  capability: typeof RELEASE_HEALTH_REGISTRY_CAPABILITY;
  version: typeof RELEASE_HEALTH_REGISTRY_VERSION;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  baselineTag: typeof POST_GA_PRODUCTION_BASELINE;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  gaTag: typeof RELEASE_HEALTH_GA_TAG;
  freezeTag: typeof RELEASE_HEALTH_FREEZE_TAG;
  verificationStatus: ReleaseHealthVerificationStatus;
  rollbackReference: ReleaseHealthRollbackReference;
  deploymentMetadata: ReleaseHealthDeploymentMetadata;
  gaFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
  };
}>;

let cached: ReleaseHealthRecord | null = null;

function cloneRecord(row: ReleaseHealthRecord): ReleaseHealthRecord {
  return {
    ...row,
    rollbackReference: {
      ...row.rollbackReference,
      restoreTargets: [...row.rollbackReference.restoreTargets],
    },
    deploymentMetadata: { ...row.deploymentMetadata },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<ReleaseHealthRecord, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    commitReference: row.commitReference,
    baselineTag: row.baselineTag,
    gaBaseline: row.gaBaseline,
    gaTag: row.gaTag,
    freezeTag: row.freezeTag,
    verificationStatus: row.verificationStatus,
    rollbackReference: row.rollbackReference,
    deploymentMetadata: row.deploymentMetadata,
    gaFingerprint: row.gaFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ReleaseHealthRecord, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveVerification(ga: GaRelease): ReleaseHealthVerificationStatus {
  if (
    ga.status === "GA" &&
    ga.certification === "certified" &&
    ga.rollback.ready === true &&
    ga.productionStatus === "PASS" &&
    ga.fingerprint.length === 64
  ) {
    return "PASS";
  }
  if (ga.status === "BLOCKED" || ga.certification === "blocked") {
    return "FAIL";
  }
  return "PENDING";
}

function deriveFromGa(ga: GaRelease): ReleaseHealthRecord {
  const withoutFp: Omit<ReleaseHealthRecord, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_1_1_ID,
    capability: RELEASE_HEALTH_REGISTRY_CAPABILITY,
    version: RELEASE_HEALTH_REGISTRY_VERSION,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    baselineTag: POST_GA_PRODUCTION_BASELINE,
    gaBaseline: GA_RELEASE_BASELINE,
    gaTag: RELEASE_HEALTH_GA_TAG,
    freezeTag: RELEASE_HEALTH_FREEZE_TAG,
    verificationStatus: deriveVerification(ga),
    rollbackReference: {
      strategy: ga.rollback.strategy,
      ready: ga.rollback.ready,
      gaVersion: GA_RELEASE_VERSION,
      freezeVersion: GA_RELEASE_FREEZE_VERSION,
      restoreTargets: [...ga.rollback.restoreTargets],
      mocked: false,
    },
    deploymentMetadata: {
      environment: "production",
      provider: "vercel",
      productionUrl: null,
      deploymentId: null,
      deployedAt: null,
      contractVersion: "pg-1.1-deploy-meta-1",
    },
    gaFingerprint: ga.fingerprint,
    scope: {
      readOnly: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build release health registry from current GA release. */
export function buildReleaseHealthRegistry(): ReleaseHealthRecord {
  const ga = getGaRelease();
  const out = deriveFromGa(ga);
  cached = cloneRecord(out);
  return cloneRecord(cached);
}

/** Get last built health record, or build if none cached. */
export function getReleaseHealthRegistry(): ReleaseHealthRecord {
  if (!cached) {
    return buildReleaseHealthRegistry();
  }
  return cloneRecord(cached);
}

/** Stable content fingerprint for determinism checks. */
export function releaseHealthRegistryFingerprint(
  row?: ReleaseHealthRecord,
): string {
  const v = row ?? getReleaseHealthRegistry();
  return v.fingerprint;
}

/** Test helper — clears health registry cache only. */
export function clearReleaseHealthRegistry(): void {
  cached = null;
}

/** Ensure GA is built before health registry (verify scripts). */
export function ensureGaThenBuildReleaseHealth(): ReleaseHealthRecord {
  buildGaRelease();
  clearReleaseHealthRegistry();
  return buildReleaseHealthRegistry();
}
