/**
 * PG-1.3 — Deployment Evidence Foundation
 * Read-only deterministic deployment evidence contract (no live deploy).
 * Baseline: pg1-runtime-health-v1 (derives from PG-1.2).
 * No DB / UI / business logic / Project·Quote·Tender changes.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../ga-release";
import { RELEASE_ID } from "../release-readiness";
import {
  RELEASE_HEALTH_COMMIT_REF,
  getReleaseHealthRegistry,
  type ReleaseHealthRollbackReference,
  type ReleaseHealthVerificationStatus,
} from "./release-health-registry";
import {
  PG_1_2_ID,
  PG1_RELEASE_HEALTH_BASELINE,
  RUNTIME_HEALTH_VERSION,
  buildRuntimeHealthFoundation,
  getRuntimeHealthFoundation,
  type RuntimeHealthFoundation,
} from "./runtime-health-foundation";

export const PG_1_3_ID = "PG-1.3" as const;
export const DEPLOYMENT_EVIDENCE_CAPABILITY =
  "DeploymentEvidenceFoundation" as const;
export const DEPLOYMENT_EVIDENCE_VERSION =
  "pg-1.3-deployment-evidence-foundation-1" as const;
/** PG-1.2 runtime health pack baseline. */
export const PG1_RUNTIME_HEALTH_BASELINE = "pg1-runtime-health-v1" as const;

/**
 * Frozen deployment reference for the evidence contract.
 * Not resolved via live Vercel/API — foundation only.
 */
export const DEPLOYMENT_EVIDENCE_DEPLOY_REF =
  "deploy-evidence-ga-foundation-1" as const;

export type DeploymentEvidenceEnvironment = "production";
export type DeploymentEvidenceVerificationStatus =
  ReleaseHealthVerificationStatus;

export type DeploymentEvidenceReleaseReference = Readonly<{
  releaseId: typeof RELEASE_ID;
  gaVersion: typeof GA_RELEASE_VERSION;
  freezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  parentPack: typeof PG_1_2_ID;
  parentBaseline: typeof PG1_RUNTIME_HEALTH_BASELINE;
  parentVersion: typeof RUNTIME_HEALTH_VERSION;
  releaseHealthBaseline: typeof PG1_RELEASE_HEALTH_BASELINE;
}>;

export type DeploymentEvidenceCommitReference = Readonly<{
  sha: typeof RELEASE_HEALTH_COMMIT_REF;
  source: "release-wp-4-ga-1.0.0";
}>;

export type DeploymentEvidenceDeploymentReference = Readonly<{
  deploymentRef: typeof DEPLOYMENT_EVIDENCE_DEPLOY_REF;
  provider: "vercel";
  productionUrl: string | null;
  deploymentId: string | null;
  deployedAt: string | null;
  contractVersion: "pg-1.3-deploy-evidence-1";
}>;

export type DeploymentEvidenceFoundation = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof PG_1_3_ID;
  capability: typeof DEPLOYMENT_EVIDENCE_CAPABILITY;
  version: typeof DEPLOYMENT_EVIDENCE_VERSION;
  baselineTag: typeof PG1_RUNTIME_HEALTH_BASELINE;
  releaseReference: DeploymentEvidenceReleaseReference;
  commitReference: DeploymentEvidenceCommitReference;
  deploymentReference: DeploymentEvidenceDeploymentReference;
  environment: DeploymentEvidenceEnvironment;
  verificationStatus: DeploymentEvidenceVerificationStatus;
  rollbackReference: ReleaseHealthRollbackReference;
  runtimeHealthFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noLiveDeploy: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
  };
}>;

let cached: DeploymentEvidenceFoundation | null = null;

function cloneEvidence(
  row: DeploymentEvidenceFoundation,
): DeploymentEvidenceFoundation {
  return {
    ...row,
    releaseReference: { ...row.releaseReference },
    commitReference: { ...row.commitReference },
    deploymentReference: { ...row.deploymentReference },
    rollbackReference: {
      ...row.rollbackReference,
      restoreTargets: [...row.rollbackReference.restoreTargets],
    },
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<DeploymentEvidenceFoundation, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    releaseReference: row.releaseReference,
    commitReference: row.commitReference,
    deploymentReference: row.deploymentReference,
    environment: row.environment,
    verificationStatus: row.verificationStatus,
    rollbackReference: row.rollbackReference,
    runtimeHealthFingerprint: row.runtimeHealthFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<DeploymentEvidenceFoundation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFromRuntime(
  runtime: RuntimeHealthFoundation,
): DeploymentEvidenceFoundation {
  const health = getReleaseHealthRegistry();
  const withoutFp: Omit<DeploymentEvidenceFoundation, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: PG_1_3_ID,
    capability: DEPLOYMENT_EVIDENCE_CAPABILITY,
    version: DEPLOYMENT_EVIDENCE_VERSION,
    baselineTag: PG1_RUNTIME_HEALTH_BASELINE,
    releaseReference: {
      releaseId: RELEASE_ID,
      gaVersion: GA_RELEASE_VERSION,
      freezeVersion: GA_RELEASE_FREEZE_VERSION,
      parentPack: PG_1_2_ID,
      parentBaseline: PG1_RUNTIME_HEALTH_BASELINE,
      parentVersion: RUNTIME_HEALTH_VERSION,
      releaseHealthBaseline: PG1_RELEASE_HEALTH_BASELINE,
    },
    commitReference: {
      sha: RELEASE_HEALTH_COMMIT_REF,
      source: "release-wp-4-ga-1.0.0",
    },
    deploymentReference: {
      deploymentRef: DEPLOYMENT_EVIDENCE_DEPLOY_REF,
      provider: "vercel",
      productionUrl: health.deploymentMetadata.productionUrl,
      deploymentId: health.deploymentMetadata.deploymentId,
      deployedAt: health.deploymentMetadata.deployedAt,
      contractVersion: "pg-1.3-deploy-evidence-1",
    },
    environment: "production",
    verificationStatus: runtime.releaseStatus,
    rollbackReference: {
      ...health.rollbackReference,
      restoreTargets: [...health.rollbackReference.restoreTargets],
    },
    runtimeHealthFingerprint: runtime.fingerprint,
    scope: {
      readOnly: true,
      noLiveDeploy: true,
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

/** Build deployment evidence from PG-1.2 runtime health. */
export function buildDeploymentEvidenceFoundation(): DeploymentEvidenceFoundation {
  const runtime = getRuntimeHealthFoundation();
  const out = deriveFromRuntime(runtime);
  cached = cloneEvidence(out);
  return cloneEvidence(cached);
}

/** Get last built evidence, or build if none cached. */
export function getDeploymentEvidenceFoundation(): DeploymentEvidenceFoundation {
  if (!cached) {
    return buildDeploymentEvidenceFoundation();
  }
  return cloneEvidence(cached);
}

/** Stable content fingerprint for determinism checks. */
export function deploymentEvidenceFoundationFingerprint(
  row?: DeploymentEvidenceFoundation,
): string {
  const v = row ?? getDeploymentEvidenceFoundation();
  return v.fingerprint;
}

/** Test helper — clears deployment evidence cache only. */
export function clearDeploymentEvidenceFoundation(): void {
  cached = null;
}

/** Ensure runtime health then build evidence (verify scripts). */
export function ensureRuntimeThenBuildDeploymentEvidence(): DeploymentEvidenceFoundation {
  buildRuntimeHealthFoundation();
  clearDeploymentEvidenceFoundation();
  return buildDeploymentEvidenceFoundation();
}
