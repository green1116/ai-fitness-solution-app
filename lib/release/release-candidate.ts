/**
 * Release / WP-2 — Release Candidate
 * Deterministic release candidate derived from WP-1 Release Readiness.
 * Additive. No mocks. No core model changes.
 * Baseline: v80-pilot-ga-1.0.0 + Release WP-1.
 */

import { createHash } from "node:crypto";

import {
  RELEASE_ID,
  RELEASE_READINESS_BASELINE,
  getReleaseReadiness,
  type ReleaseReadiness,
  type ReleaseRollbackGate,
} from "./release-readiness";

export const RELEASE_WP2_ID = "WP-2" as const;
export const RELEASE_CANDIDATE_CAPABILITY = "ReleaseCandidate" as const;
export const RELEASE_CANDIDATE_VERSION =
  "release-wp-2-candidate-1" as const;
/** Reuses Pilot GA + Release WP-1 baseline. */
export const RELEASE_CANDIDATE_BASELINE = RELEASE_READINESS_BASELINE;

export type ReleaseCandidate = Readonly<{
  version: typeof RELEASE_CANDIDATE_VERSION;
  baseline: typeof RELEASE_CANDIDATE_BASELINE;
  status: "READY" | "BLOCKED";
  fingerprint: string;
  rollback: ReleaseRollbackGate;
  certification: "certified" | "blocked";
  capability: typeof RELEASE_CANDIDATE_CAPABILITY;
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof RELEASE_WP2_ID;
  readinessFingerprint: string;
  readinessStatus: ReleaseReadiness["status"];
}>;

let cached: ReleaseCandidate | null = null;

function cloneCandidate(row: ReleaseCandidate): ReleaseCandidate {
  return {
    ...row,
    rollback: {
      ...row.rollback,
      restoreTargets: [...row.rollback.restoreTargets],
    },
  };
}

function stablePayload(row: Omit<ReleaseCandidate, "fingerprint">): string {
  return JSON.stringify({
    version: row.version,
    baseline: row.baseline,
    status: row.status,
    rollback: row.rollback,
    certification: row.certification,
    capability: row.capability,
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    readinessFingerprint: row.readinessFingerprint,
    readinessStatus: row.readinessStatus,
  });
}

function computeFingerprint(
  row: Omit<ReleaseCandidate, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveFromReadiness(readiness: ReleaseReadiness): ReleaseCandidate {
  const ready =
    readiness.status === "READY" &&
    readiness.rollback.ready === true &&
    readiness.checks.rollbackOk === true &&
    readiness.epFreezes.every((e) => e.certification === "certified");

  const withoutFp: Omit<ReleaseCandidate, "fingerprint"> = {
    version: RELEASE_CANDIDATE_VERSION,
    baseline: RELEASE_CANDIDATE_BASELINE,
    status: ready ? "READY" : "BLOCKED",
    rollback: {
      ready: readiness.rollback.ready,
      strategy: readiness.rollback.strategy,
      restoreTargets: [...readiness.rollback.restoreTargets],
      mocked: false,
    },
    certification: ready ? "certified" : "blocked",
    capability: RELEASE_CANDIDATE_CAPABILITY,
    releaseId: RELEASE_ID,
    workPackageId: RELEASE_WP2_ID,
    readinessFingerprint: readiness.fingerprint,
    readinessStatus: readiness.status,
  };

  return {
    ...withoutFp,
    fingerprint: computeFingerprint(withoutFp),
  };
}

/**
 * Build Release Candidate from WP-1 Release Readiness.
 */
export function buildReleaseCandidate(): ReleaseCandidate {
  const readiness = getReleaseReadiness();
  const out = deriveFromReadiness(readiness);
  cached = cloneCandidate(out);
  return cloneCandidate(cached);
}

/**
 * Get the last built candidate, or build if none cached.
 */
export function getReleaseCandidate(): ReleaseCandidate {
  if (!cached) {
    return buildReleaseCandidate();
  }
  return cloneCandidate(cached);
}

/** Stable content fingerprint for determinism checks. */
export function releaseCandidateFingerprint(
  row?: ReleaseCandidate,
): string {
  const v = row ?? getReleaseCandidate();
  return v.fingerprint;
}

/** Test helper — clears candidate cache only. */
export function clearReleaseCandidate(): void {
  cached = null;
}
