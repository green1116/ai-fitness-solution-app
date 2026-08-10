/**
 * ARL-4 — Application Deployment Evidence Layer
 * Deterministic ApplicationDeploymentEvidence domain on top of ARL-3.
 * Baseline: arl3-release-verification-v1.
 * No GA baseline mutation / Project·Quote·Tender / redesign / live deploy.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../ga-release";
import {
  RELEASE_HEALTH_COMMIT_REF,
  type ReleaseHealthRollbackReference,
} from "../health/release-health-registry";
import { RELEASE_ID } from "../release-readiness";
import {
  APPLICATION_RELEASE_VERIFICATION_VERSION,
  ARL_3_ID,
  ARL2_RELEASE_CANDIDATE_BASELINE,
  buildApplicationReleaseVerification,
  getApplicationReleaseVerification,
  type ApplicationReleaseVerification,
  type ApplicationReleaseVerificationStatus,
} from "./verification";

export const ARL_4_ID = "ARL-4" as const;
export const APPLICATION_DEPLOYMENT_EVIDENCE_CAPABILITY =
  "ApplicationDeploymentEvidence" as const;
export const APPLICATION_DEPLOYMENT_EVIDENCE_VERSION =
  "arl-4-deployment-evidence-1" as const;
/** ARL-3 release verification pack baseline. */
export const ARL3_RELEASE_VERIFICATION_BASELINE =
  "arl3-release-verification-v1" as const;

/**
 * Frozen deployment reference for the evidence contract.
 * Not resolved via live Vercel/API — foundation only.
 */
export const APPLICATION_DEPLOYMENT_EVIDENCE_DEPLOY_REF =
  "arl4-deploy-evidence-foundation-1" as const;

export type ApplicationDeploymentEnvironment = "production";

export type ApplicationDeploymentEvidence = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ARL_4_ID;
  capability: typeof APPLICATION_DEPLOYMENT_EVIDENCE_CAPABILITY;
  version: typeof APPLICATION_DEPLOYMENT_EVIDENCE_VERSION;
  baselineTag: typeof ARL3_RELEASE_VERIFICATION_BASELINE;
  evidenceId: string;
  environment: ApplicationDeploymentEnvironment;
  provider: "vercel";
  deploymentRef: typeof APPLICATION_DEPLOYMENT_EVIDENCE_DEPLOY_REF;
  productionUrl: string | null;
  deploymentId: string | null;
  deployedAt: string | null;
  contractVersion: "arl-4-deploy-evidence-1";
  verificationId: string;
  verificationStatus: ApplicationReleaseVerificationStatus;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  rollbackReference: ReleaseHealthRollbackReference;
  parentPack: typeof ARL_3_ID;
  parentVersion: typeof APPLICATION_RELEASE_VERIFICATION_VERSION;
  parentBaseline: typeof ARL2_RELEASE_CANDIDATE_BASELINE;
  verificationFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noLiveDeploy: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: ApplicationDeploymentEvidence | null = null;

function cloneEvidence(
  row: ApplicationDeploymentEvidence,
): ApplicationDeploymentEvidence {
  return {
    ...row,
    rollbackReference: {
      ...row.rollbackReference,
      restoreTargets: [...row.rollbackReference.restoreTargets],
    },
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ApplicationDeploymentEvidence, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    evidenceId: row.evidenceId,
    environment: row.environment,
    provider: row.provider,
    deploymentRef: row.deploymentRef,
    productionUrl: row.productionUrl,
    deploymentId: row.deploymentId,
    deployedAt: row.deployedAt,
    contractVersion: row.contractVersion,
    verificationId: row.verificationId,
    verificationStatus: row.verificationStatus,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    rollbackReference: row.rollbackReference,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    verificationFingerprint: row.verificationFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ApplicationDeploymentEvidence, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFromVerification(
  verification: ApplicationReleaseVerification,
): ApplicationDeploymentEvidence {
  const withoutFp: Omit<ApplicationDeploymentEvidence, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ARL_4_ID,
    capability: APPLICATION_DEPLOYMENT_EVIDENCE_CAPABILITY,
    version: APPLICATION_DEPLOYMENT_EVIDENCE_VERSION,
    baselineTag: ARL3_RELEASE_VERIFICATION_BASELINE,
    evidenceId: "arl4-evidence-application-1",
    environment: "production",
    provider: "vercel",
    deploymentRef: APPLICATION_DEPLOYMENT_EVIDENCE_DEPLOY_REF,
    productionUrl: null,
    deploymentId: null,
    deployedAt: null,
    contractVersion: "arl-4-deploy-evidence-1",
    verificationId: verification.verificationId,
    verificationStatus: verification.status,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    rollbackReference: {
      ...verification.rollbackReference,
      restoreTargets: [...verification.rollbackReference.restoreTargets],
    },
    parentPack: ARL_3_ID,
    parentVersion: APPLICATION_RELEASE_VERIFICATION_VERSION,
    parentBaseline: ARL2_RELEASE_CANDIDATE_BASELINE,
    verificationFingerprint: verification.fingerprint,
    scope: {
      readOnly: true,
      noLiveDeploy: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
      gaBaselineUnchanged: true,
    },
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/** Build ApplicationDeploymentEvidence from ARL-3 verification. */
export function buildApplicationDeploymentEvidence(): ApplicationDeploymentEvidence {
  const verification = getApplicationReleaseVerification();
  const out = deriveFromVerification(verification);
  cached = cloneEvidence(out);
  return cloneEvidence(cached);
}

/** Get last built evidence, or build if none cached. */
export function getApplicationDeploymentEvidence(): ApplicationDeploymentEvidence {
  if (!cached) {
    return buildApplicationDeploymentEvidence();
  }
  return cloneEvidence(cached);
}

/** Stable content fingerprint for determinism checks. */
export function applicationDeploymentEvidenceFingerprint(
  row?: ApplicationDeploymentEvidence,
): string {
  const v = row ?? getApplicationDeploymentEvidence();
  return v.fingerprint;
}

/** Test helper — clears ARL-4 cache only. */
export function clearApplicationDeploymentEvidence(): void {
  cached = null;
}

/** Ensure ARL-3 then build ARL-4 (verify scripts). */
export function ensureVerificationThenBuildApplicationDeploymentEvidence(): ApplicationDeploymentEvidence {
  buildApplicationReleaseVerification();
  clearApplicationDeploymentEvidence();
  return buildApplicationDeploymentEvidence();
}
