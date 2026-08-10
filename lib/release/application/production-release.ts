/**
 * ARL-5 — Application Production Release Manager
 * Deterministic ApplicationProductionRelease domain on top of ARL-4.
 * Baseline: arl4-deployment-evidence-v1.
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
  APPLICATION_DEPLOYMENT_EVIDENCE_DEPLOY_REF,
  APPLICATION_DEPLOYMENT_EVIDENCE_VERSION,
  ARL_4_ID,
  ARL3_RELEASE_VERIFICATION_BASELINE,
  buildApplicationDeploymentEvidence,
  getApplicationDeploymentEvidence,
  type ApplicationDeploymentEvidence,
  type ApplicationDeploymentEnvironment,
} from "./deployment";
import type { ApplicationReleaseVerificationStatus } from "./verification";

export const ARL_5_ID = "ARL-5" as const;
export const APPLICATION_PRODUCTION_RELEASE_CAPABILITY =
  "ApplicationProductionRelease" as const;
export const APPLICATION_PRODUCTION_RELEASE_VERSION =
  "arl-5-production-release-1" as const;
/** ARL-4 deployment evidence pack baseline. */
export const ARL4_DEPLOYMENT_EVIDENCE_BASELINE =
  "arl4-deployment-evidence-v1" as const;

export const APPLICATION_PRODUCTION_RELEASE_GATES = [
  "DEPLOYMENT_EVIDENCE",
  "VERIFICATION_PASS",
  "GA_BASELINE_LOCK",
  "ROLLBACK_READY",
  "NO_LIVE_DEPLOY",
] as const;
export type ApplicationProductionReleaseGate =
  (typeof APPLICATION_PRODUCTION_RELEASE_GATES)[number];

export const APPLICATION_PRODUCTION_RELEASE_STATUSES = [
  "READY",
  "BLOCKED",
] as const;
export type ApplicationProductionReleaseStatus =
  (typeof APPLICATION_PRODUCTION_RELEASE_STATUSES)[number];

export type ApplicationProductionReleaseGateResult = Readonly<{
  gate: ApplicationProductionReleaseGate;
  passed: boolean;
  detail: string;
}>;

export type ApplicationProductionRelease = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ARL_5_ID;
  capability: typeof APPLICATION_PRODUCTION_RELEASE_CAPABILITY;
  version: typeof APPLICATION_PRODUCTION_RELEASE_VERSION;
  baselineTag: typeof ARL4_DEPLOYMENT_EVIDENCE_BASELINE;
  productionReleaseId: string;
  status: ApplicationProductionReleaseStatus;
  certification: "certified" | "blocked";
  environment: ApplicationDeploymentEnvironment;
  deploymentRef: typeof APPLICATION_DEPLOYMENT_EVIDENCE_DEPLOY_REF;
  evidenceId: string;
  verificationId: string;
  verificationStatus: ApplicationReleaseVerificationStatus;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  gates: readonly ApplicationProductionReleaseGateResult[];
  rollbackReference: ReleaseHealthRollbackReference;
  parentPack: typeof ARL_4_ID;
  parentVersion: typeof APPLICATION_DEPLOYMENT_EVIDENCE_VERSION;
  parentBaseline: typeof ARL3_RELEASE_VERIFICATION_BASELINE;
  evidenceFingerprint: string;
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

let cached: ApplicationProductionRelease | null = null;

function cloneRelease(
  row: ApplicationProductionRelease,
): ApplicationProductionRelease {
  return {
    ...row,
    gates: row.gates.map((g) => ({ ...g })),
    rollbackReference: {
      ...row.rollbackReference,
      restoreTargets: [...row.rollbackReference.restoreTargets],
    },
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ApplicationProductionRelease, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    productionReleaseId: row.productionReleaseId,
    status: row.status,
    certification: row.certification,
    environment: row.environment,
    deploymentRef: row.deploymentRef,
    evidenceId: row.evidenceId,
    verificationId: row.verificationId,
    verificationStatus: row.verificationStatus,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    gates: row.gates,
    rollbackReference: row.rollbackReference,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    evidenceFingerprint: row.evidenceFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ApplicationProductionRelease, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function evaluateGates(
  evidence: ApplicationDeploymentEvidence,
): ApplicationProductionReleaseGateResult[] {
  return [
    {
      gate: "DEPLOYMENT_EVIDENCE",
      passed:
        evidence.fingerprint.length === 64 &&
        evidence.deploymentRef === APPLICATION_DEPLOYMENT_EVIDENCE_DEPLOY_REF,
      detail: `evidenceId=${evidence.evidenceId}`,
    },
    {
      gate: "VERIFICATION_PASS",
      passed: evidence.verificationStatus === "PASS",
      detail: `verificationStatus=${evidence.verificationStatus}`,
    },
    {
      gate: "GA_BASELINE_LOCK",
      passed:
        evidence.gaBaseline === GA_RELEASE_BASELINE &&
        evidence.scope.gaBaselineUnchanged === true,
      detail: `gaBaseline=${evidence.gaBaseline}`,
    },
    {
      gate: "ROLLBACK_READY",
      passed:
        evidence.rollbackReference.ready === true &&
        evidence.rollbackReference.mocked === false &&
        evidence.rollbackReference.restoreTargets.length === 4,
      detail: `strategy=${evidence.rollbackReference.strategy}`,
    },
    {
      gate: "NO_LIVE_DEPLOY",
      passed:
        evidence.scope.noLiveDeploy === true &&
        evidence.productionUrl === null &&
        evidence.deploymentId === null &&
        evidence.deployedAt === null,
      detail: "live fields unset",
    },
  ];
}

function deriveFromEvidence(
  evidence: ApplicationDeploymentEvidence,
): ApplicationProductionRelease {
  const gates = evaluateGates(evidence);
  const ready = gates.every((g) => g.passed);

  const withoutFp: Omit<ApplicationProductionRelease, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ARL_5_ID,
    capability: APPLICATION_PRODUCTION_RELEASE_CAPABILITY,
    version: APPLICATION_PRODUCTION_RELEASE_VERSION,
    baselineTag: ARL4_DEPLOYMENT_EVIDENCE_BASELINE,
    productionReleaseId: "arl5-production-release-1",
    status: ready ? "READY" : "BLOCKED",
    certification: ready ? "certified" : "blocked",
    environment: evidence.environment,
    deploymentRef: APPLICATION_DEPLOYMENT_EVIDENCE_DEPLOY_REF,
    evidenceId: evidence.evidenceId,
    verificationId: evidence.verificationId,
    verificationStatus: evidence.verificationStatus,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    gates,
    rollbackReference: {
      ...evidence.rollbackReference,
      restoreTargets: [...evidence.rollbackReference.restoreTargets],
    },
    parentPack: ARL_4_ID,
    parentVersion: APPLICATION_DEPLOYMENT_EVIDENCE_VERSION,
    parentBaseline: ARL3_RELEASE_VERIFICATION_BASELINE,
    evidenceFingerprint: evidence.fingerprint,
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

/** Build ApplicationProductionRelease from ARL-4 deployment evidence. */
export function buildApplicationProductionRelease(): ApplicationProductionRelease {
  const evidence = getApplicationDeploymentEvidence();
  const out = deriveFromEvidence(evidence);
  cached = cloneRelease(out);
  return cloneRelease(cached);
}

/** Get last built production release, or build if none cached. */
export function getApplicationProductionRelease(): ApplicationProductionRelease {
  if (!cached) {
    return buildApplicationProductionRelease();
  }
  return cloneRelease(cached);
}

/** Stable content fingerprint for determinism checks. */
export function applicationProductionReleaseFingerprint(
  row?: ApplicationProductionRelease,
): string {
  const v = row ?? getApplicationProductionRelease();
  return v.fingerprint;
}

/** Test helper — clears ARL-5 cache only. */
export function clearApplicationProductionRelease(): void {
  cached = null;
}

/** Ensure ARL-4 then build ARL-5 (verify scripts). */
export function ensureEvidenceThenBuildApplicationProductionRelease(): ApplicationProductionRelease {
  buildApplicationDeploymentEvidence();
  clearApplicationProductionRelease();
  return buildApplicationProductionRelease();
}
