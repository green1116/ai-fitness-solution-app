/**
 * ARL-3 — Application Release Verification Pipeline
 * Deterministic ApplicationReleaseVerification domain on top of ARL-2.
 * Baseline: arl2-release-candidate-v1.
 * No GA baseline mutation / Project·Quote·Tender / redesign.
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
  APPLICATION_RELEASE_CANDIDATE_VERSION,
  ARL_2_ID,
  ARL1_RELEASE_CHANGE_BASELINE,
  buildApplicationReleaseCandidate,
  getApplicationReleaseCandidate,
  type ApplicationReleaseCandidate,
  type ApplicationReleaseCandidateStatus,
} from "./candidate";

export const ARL_3_ID = "ARL-3" as const;
export const APPLICATION_RELEASE_VERIFICATION_CAPABILITY =
  "ApplicationReleaseVerification" as const;
export const APPLICATION_RELEASE_VERIFICATION_VERSION =
  "arl-3-release-verification-1" as const;
/** ARL-2 release candidate pack baseline. */
export const ARL2_RELEASE_CANDIDATE_BASELINE =
  "arl2-release-candidate-v1" as const;

export const APPLICATION_RELEASE_VERIFICATION_CHECKS = [
  "CANDIDATE_READY",
  "GATES_COMPLETE",
  "GA_BASELINE_INTACT",
  "ROLLBACK_INTACT",
  "FINGERPRINT_STABLE",
] as const;
export type ApplicationReleaseVerificationCheck =
  (typeof APPLICATION_RELEASE_VERIFICATION_CHECKS)[number];

export const APPLICATION_RELEASE_VERIFICATION_STATUSES = [
  "PASS",
  "FAIL",
] as const;
export type ApplicationReleaseVerificationStatus =
  (typeof APPLICATION_RELEASE_VERIFICATION_STATUSES)[number];

export type ApplicationReleaseVerificationCheckResult = Readonly<{
  check: ApplicationReleaseVerificationCheck;
  passed: boolean;
  detail: string;
}>;

export type ApplicationReleaseVerification = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ARL_3_ID;
  capability: typeof APPLICATION_RELEASE_VERIFICATION_CAPABILITY;
  version: typeof APPLICATION_RELEASE_VERIFICATION_VERSION;
  baselineTag: typeof ARL2_RELEASE_CANDIDATE_BASELINE;
  verificationId: string;
  status: ApplicationReleaseVerificationStatus;
  certification: "certified" | "blocked";
  candidateId: string;
  candidateStatus: ApplicationReleaseCandidateStatus;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  checks: readonly ApplicationReleaseVerificationCheckResult[];
  passedCount: number;
  failedCount: number;
  rollbackReference: ReleaseHealthRollbackReference;
  parentPack: typeof ARL_2_ID;
  parentVersion: typeof APPLICATION_RELEASE_CANDIDATE_VERSION;
  parentBaseline: typeof ARL1_RELEASE_CHANGE_BASELINE;
  candidateFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: ApplicationReleaseVerification | null = null;

function cloneVerification(
  row: ApplicationReleaseVerification,
): ApplicationReleaseVerification {
  return {
    ...row,
    checks: row.checks.map((c) => ({ ...c })),
    rollbackReference: {
      ...row.rollbackReference,
      restoreTargets: [...row.rollbackReference.restoreTargets],
    },
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ApplicationReleaseVerification, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    verificationId: row.verificationId,
    status: row.status,
    certification: row.certification,
    candidateId: row.candidateId,
    candidateStatus: row.candidateStatus,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    checks: row.checks,
    passedCount: row.passedCount,
    failedCount: row.failedCount,
    rollbackReference: row.rollbackReference,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    candidateFingerprint: row.candidateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ApplicationReleaseVerification, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function evaluateChecks(
  candidate: ApplicationReleaseCandidate,
): ApplicationReleaseVerificationCheckResult[] {
  return [
    {
      check: "CANDIDATE_READY",
      passed:
        candidate.status === "READY" && candidate.certification === "certified",
      detail: `status=${candidate.status}`,
    },
    {
      check: "GATES_COMPLETE",
      passed:
        candidate.gates.length > 0 && candidate.gates.every((g) => g.passed),
      detail: `gates=${candidate.gates.length}`,
    },
    {
      check: "GA_BASELINE_INTACT",
      passed:
        candidate.gaBaseline === GA_RELEASE_BASELINE &&
        candidate.scope.gaBaselineUnchanged === true,
      detail: `gaBaseline=${candidate.gaBaseline}`,
    },
    {
      check: "ROLLBACK_INTACT",
      passed:
        candidate.rollbackReference.ready === true &&
        candidate.rollbackReference.mocked === false &&
        candidate.rollbackReference.restoreTargets.length === 4,
      detail: `strategy=${candidate.rollbackReference.strategy}`,
    },
    {
      check: "FINGERPRINT_STABLE",
      passed: candidate.fingerprint.length === 64,
      detail: `fpLen=${candidate.fingerprint.length}`,
    },
  ];
}

function deriveFromCandidate(
  candidate: ApplicationReleaseCandidate,
): ApplicationReleaseVerification {
  const checks = evaluateChecks(candidate);
  const passedCount = checks.filter((c) => c.passed).length;
  const failedCount = checks.length - passedCount;
  const pass = failedCount === 0;

  const withoutFp: Omit<ApplicationReleaseVerification, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ARL_3_ID,
    capability: APPLICATION_RELEASE_VERIFICATION_CAPABILITY,
    version: APPLICATION_RELEASE_VERIFICATION_VERSION,
    baselineTag: ARL2_RELEASE_CANDIDATE_BASELINE,
    verificationId: "arl3-verify-application-1",
    status: pass ? "PASS" : "FAIL",
    certification: pass ? "certified" : "blocked",
    candidateId: candidate.candidateId,
    candidateStatus: candidate.status,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    checks,
    passedCount,
    failedCount,
    rollbackReference: {
      ...candidate.rollbackReference,
      restoreTargets: [...candidate.rollbackReference.restoreTargets],
    },
    parentPack: ARL_2_ID,
    parentVersion: APPLICATION_RELEASE_CANDIDATE_VERSION,
    parentBaseline: ARL1_RELEASE_CHANGE_BASELINE,
    candidateFingerprint: candidate.fingerprint,
    scope: {
      readOnly: true,
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

/** Build ApplicationReleaseVerification from ARL-2 candidate. */
export function buildApplicationReleaseVerification(): ApplicationReleaseVerification {
  const candidate = getApplicationReleaseCandidate();
  const out = deriveFromCandidate(candidate);
  cached = cloneVerification(out);
  return cloneVerification(cached);
}

/** Get last built verification, or build if none cached. */
export function getApplicationReleaseVerification(): ApplicationReleaseVerification {
  if (!cached) {
    return buildApplicationReleaseVerification();
  }
  return cloneVerification(cached);
}

/** Stable content fingerprint for determinism checks. */
export function applicationReleaseVerificationFingerprint(
  row?: ApplicationReleaseVerification,
): string {
  const v = row ?? getApplicationReleaseVerification();
  return v.fingerprint;
}

/** Test helper — clears ARL-3 cache only. */
export function clearApplicationReleaseVerification(): void {
  cached = null;
}

/** Ensure ARL-2 then build ARL-3 (verify scripts). */
export function ensureCandidateThenBuildApplicationReleaseVerification(): ApplicationReleaseVerification {
  buildApplicationReleaseCandidate();
  clearApplicationReleaseVerification();
  return buildApplicationReleaseVerification();
}
