/**
 * ARL-2 — Application Release Candidate Engine
 * Deterministic ApplicationReleaseCandidate domain on top of ARL-1.
 * Baseline: arl1-release-change-v1.
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
  APPLICATION_RELEASE_CHANGE_VERSION,
  ARL_1_ID,
  PG3_COMMERCIAL_GROWTH_FREEZE_BASELINE,
  buildApplicationReleaseChange,
  getApplicationReleaseChange,
  type ApplicationReleaseChangeFoundation,
  type ApplicationReleaseChangeStatus,
} from "./change";

export const ARL_2_ID = "ARL-2" as const;
export const APPLICATION_RELEASE_CANDIDATE_CAPABILITY =
  "ApplicationReleaseCandidate" as const;
export const APPLICATION_RELEASE_CANDIDATE_VERSION =
  "arl-2-release-candidate-1" as const;
/** ARL-1 release change pack baseline. */
export const ARL1_RELEASE_CHANGE_BASELINE = "arl1-release-change-v1" as const;

export const APPLICATION_RELEASE_CANDIDATE_GATES = [
  "CHANGE_FOUNDATION",
  "GA_BASELINE_LOCK",
  "ROLLBACK_READY",
  "CHANGE_VERIFIED",
] as const;
export type ApplicationReleaseCandidateGate =
  (typeof APPLICATION_RELEASE_CANDIDATE_GATES)[number];

export const APPLICATION_RELEASE_CANDIDATE_STATUSES = [
  "READY",
  "BLOCKED",
] as const;
export type ApplicationReleaseCandidateStatus =
  (typeof APPLICATION_RELEASE_CANDIDATE_STATUSES)[number];

export type ApplicationReleaseCandidateGateResult = Readonly<{
  gate: ApplicationReleaseCandidateGate;
  passed: boolean;
  detail: string;
}>;

export type ApplicationReleaseCandidate = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ARL_2_ID;
  capability: typeof APPLICATION_RELEASE_CANDIDATE_CAPABILITY;
  version: typeof APPLICATION_RELEASE_CANDIDATE_VERSION;
  baselineTag: typeof ARL1_RELEASE_CHANGE_BASELINE;
  candidateId: string;
  status: ApplicationReleaseCandidateStatus;
  certification: "certified" | "blocked";
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  changeStatus: ApplicationReleaseChangeStatus;
  changeCount: number;
  gates: readonly ApplicationReleaseCandidateGateResult[];
  rollbackReference: ReleaseHealthRollbackReference;
  parentPack: typeof ARL_1_ID;
  parentVersion: typeof APPLICATION_RELEASE_CHANGE_VERSION;
  parentBaseline: typeof PG3_COMMERCIAL_GROWTH_FREEZE_BASELINE;
  changeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: ApplicationReleaseCandidate | null = null;

function cloneCandidate(
  row: ApplicationReleaseCandidate,
): ApplicationReleaseCandidate {
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
  row: Omit<ApplicationReleaseCandidate, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    candidateId: row.candidateId,
    status: row.status,
    certification: row.certification,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    changeStatus: row.changeStatus,
    changeCount: row.changeCount,
    gates: row.gates,
    rollbackReference: row.rollbackReference,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    changeFingerprint: row.changeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ApplicationReleaseCandidate, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function evaluateGates(
  change: ApplicationReleaseChangeFoundation,
): ApplicationReleaseCandidateGateResult[] {
  const allVerified = change.changes.every((c) => c.status === "VERIFIED");
  const gaLocked = change.scope.gaBaselineUnchanged === true;
  const rollbackReady = change.rollbackReference.ready === true;

  return [
    {
      gate: "CHANGE_FOUNDATION",
      passed: change.changes.length > 0 && change.fingerprint.length === 64,
      detail: `changes=${change.changes.length}`,
    },
    {
      gate: "GA_BASELINE_LOCK",
      passed: gaLocked && change.changes[0]?.releaseReference.gaBaseline === GA_RELEASE_BASELINE,
      detail: `gaBaseline=${GA_RELEASE_BASELINE}`,
    },
    {
      gate: "ROLLBACK_READY",
      passed: rollbackReady && change.rollbackReference.mocked === false,
      detail: `strategy=${change.rollbackReference.strategy}`,
    },
    {
      gate: "CHANGE_VERIFIED",
      passed: allVerified,
      detail: `status=${change.changes[0]?.status ?? "NONE"}`,
    },
  ];
}

function deriveFromChange(
  change: ApplicationReleaseChangeFoundation,
): ApplicationReleaseCandidate {
  const gates = evaluateGates(change);
  const ready = gates.every((g) => g.passed);
  const withoutFp: Omit<ApplicationReleaseCandidate, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ARL_2_ID,
    capability: APPLICATION_RELEASE_CANDIDATE_CAPABILITY,
    version: APPLICATION_RELEASE_CANDIDATE_VERSION,
    baselineTag: ARL1_RELEASE_CHANGE_BASELINE,
    candidateId: "arl2-rc-application-1",
    status: ready ? "READY" : "BLOCKED",
    certification: ready ? "certified" : "blocked",
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    changeStatus: change.changes[0]?.status ?? "BLOCKED",
    changeCount: change.changes.length,
    gates,
    rollbackReference: {
      ...change.rollbackReference,
      restoreTargets: [...change.rollbackReference.restoreTargets],
    },
    parentPack: ARL_1_ID,
    parentVersion: APPLICATION_RELEASE_CHANGE_VERSION,
    parentBaseline: PG3_COMMERCIAL_GROWTH_FREEZE_BASELINE,
    changeFingerprint: change.fingerprint,
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

/** Build ApplicationReleaseCandidate from ARL-1 change foundation. */
export function buildApplicationReleaseCandidate(): ApplicationReleaseCandidate {
  const change = getApplicationReleaseChange();
  const out = deriveFromChange(change);
  cached = cloneCandidate(out);
  return cloneCandidate(cached);
}

/** Get last built candidate, or build if none cached. */
export function getApplicationReleaseCandidate(): ApplicationReleaseCandidate {
  if (!cached) {
    return buildApplicationReleaseCandidate();
  }
  return cloneCandidate(cached);
}

/** Stable content fingerprint for determinism checks. */
export function applicationReleaseCandidateFingerprint(
  row?: ApplicationReleaseCandidate,
): string {
  const v = row ?? getApplicationReleaseCandidate();
  return v.fingerprint;
}

/** Test helper — clears ARL-2 cache only. */
export function clearApplicationReleaseCandidate(): void {
  cached = null;
}

/** Ensure ARL-1 then build ARL-2 (verify scripts). */
export function ensureChangeThenBuildApplicationReleaseCandidate(): ApplicationReleaseCandidate {
  buildApplicationReleaseChange();
  clearApplicationReleaseCandidate();
  return buildApplicationReleaseCandidate();
}
