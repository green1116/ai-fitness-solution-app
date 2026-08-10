/**
 * ARL-1 — Application Release Change Foundation
 * Deterministic ApplicationReleaseChange domain (read-only).
 * Baseline: pg3-commercial-growth-freeze-v1 (derives from PG-3 Freeze).
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
  getReleaseHealthRegistry,
  type ReleaseHealthRollbackReference,
} from "../health/release-health-registry";
import { RELEASE_ID } from "../release-readiness";
import {
  PG_3_FREEZE_ID,
  PG_3_FREEZE_VERSION,
  PG3_GROWTH_EVIDENCE_BASELINE,
  buildPg3FreezeManifest,
  getPg3FreezeManifest,
  type Pg3FreezeManifest,
} from "../revenue/pg3-freeze-manifest";

export const ARL_1_ID = "ARL-1" as const;
export const APPLICATION_RELEASE_CHANGE_CAPABILITY =
  "ApplicationReleaseChange" as const;
export const APPLICATION_RELEASE_CHANGE_VERSION =
  "arl-1-release-change-1" as const;
/** PG-3 commercial growth freeze pack baseline. */
export const PG3_COMMERCIAL_GROWTH_FREEZE_BASELINE =
  "pg3-commercial-growth-freeze-v1" as const;

export const APPLICATION_RELEASE_CHANGE_TYPES = [
  "FOUNDATION_SEEDED",
  "OPERATIONS_BASELINE_LINKED",
  "CUSTOMER_ADOPTION_LINKED",
  "COMMERCIAL_GROWTH_LINKED",
] as const;
export type ApplicationReleaseChangeType =
  (typeof APPLICATION_RELEASE_CHANGE_TYPES)[number];

export const APPLICATION_RELEASE_CHANGE_STATUSES = [
  "RECORDED",
  "VERIFIED",
  "BLOCKED",
] as const;
export type ApplicationReleaseChangeStatus =
  (typeof APPLICATION_RELEASE_CHANGE_STATUSES)[number];

export type ApplicationReleaseChangeReference = Readonly<{
  releaseId: typeof RELEASE_ID;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  parentPack: typeof PG_3_FREEZE_ID;
  parentVersion: typeof PG_3_FREEZE_VERSION;
  parentBaseline: typeof PG3_GROWTH_EVIDENCE_BASELINE;
}>;

export type ApplicationReleaseChange = Readonly<{
  changeId: string;
  changeType: ApplicationReleaseChangeType;
  status: ApplicationReleaseChangeStatus;
  releaseReference: ApplicationReleaseChangeReference;
  summary: string;
  ordinal: number;
}>;

export type ApplicationReleaseChangeFoundation = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ARL_1_ID;
  capability: typeof APPLICATION_RELEASE_CHANGE_CAPABILITY;
  version: typeof APPLICATION_RELEASE_CHANGE_VERSION;
  baselineTag: typeof PG3_COMMERCIAL_GROWTH_FREEZE_BASELINE;
  changes: readonly ApplicationReleaseChange[];
  rollbackReference: ReleaseHealthRollbackReference;
  pg3FreezeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: ApplicationReleaseChangeFoundation | null = null;

function cloneFoundation(
  row: ApplicationReleaseChangeFoundation,
): ApplicationReleaseChangeFoundation {
  return {
    ...row,
    changes: row.changes.map((c) => ({
      ...c,
      releaseReference: { ...c.releaseReference },
    })),
    rollbackReference: {
      ...row.rollbackReference,
      restoreTargets: [...row.rollbackReference.restoreTargets],
    },
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<ApplicationReleaseChangeFoundation, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    changes: row.changes,
    rollbackReference: row.rollbackReference,
    pg3FreezeFingerprint: row.pg3FreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<ApplicationReleaseChangeFoundation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

const CHANGE_SUMMARIES: Record<ApplicationReleaseChangeType, string> = {
  FOUNDATION_SEEDED: "ARL-1 ApplicationReleaseChange domain seeded",
  OPERATIONS_BASELINE_LINKED: "Linked PG-1 operations freeze baseline",
  CUSTOMER_ADOPTION_LINKED: "Linked PG-2 customer adoption freeze baseline",
  COMMERCIAL_GROWTH_LINKED: "Linked PG-3 commercial growth freeze baseline",
};

function buildChanges(
  freeze: Pg3FreezeManifest,
): ApplicationReleaseChange[] {
  const releaseReference: ApplicationReleaseChangeReference = {
    releaseId: RELEASE_ID,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    parentPack: PG_3_FREEZE_ID,
    parentVersion: PG_3_FREEZE_VERSION,
    parentBaseline: PG3_GROWTH_EVIDENCE_BASELINE,
  };

  const status: ApplicationReleaseChangeStatus =
    freeze.certification === "certified" &&
    freeze.verificationSummary.status === "PASS"
      ? "VERIFIED"
      : freeze.certification === "blocked"
        ? "BLOCKED"
        : "RECORDED";

  return APPLICATION_RELEASE_CHANGE_TYPES.map((changeType, index) => ({
    changeId: `arl1-chg-${String(index + 1).padStart(2, "0")}-${changeType
      .toLowerCase()
      .replace(/_/g, "-")}`,
    changeType,
    status,
    releaseReference,
    summary: CHANGE_SUMMARIES[changeType],
    ordinal: index + 1,
  }));
}

function deriveFromFreeze(
  freeze: Pg3FreezeManifest,
): ApplicationReleaseChangeFoundation {
  const health = getReleaseHealthRegistry();
  const withoutFp: Omit<ApplicationReleaseChangeFoundation, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ARL_1_ID,
    capability: APPLICATION_RELEASE_CHANGE_CAPABILITY,
    version: APPLICATION_RELEASE_CHANGE_VERSION,
    baselineTag: PG3_COMMERCIAL_GROWTH_FREEZE_BASELINE,
    changes: buildChanges(freeze),
    rollbackReference: {
      ...health.rollbackReference,
      restoreTargets: [...health.rollbackReference.restoreTargets],
    },
    pg3FreezeFingerprint: freeze.fingerprint,
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

/** Build ApplicationReleaseChange foundation from PG-3 freeze. */
export function buildApplicationReleaseChange(): ApplicationReleaseChangeFoundation {
  const freeze = getPg3FreezeManifest();
  const out = deriveFromFreeze(freeze);
  cached = cloneFoundation(out);
  return cloneFoundation(cached);
}

/** Get last built foundation, or build if none cached. */
export function getApplicationReleaseChange(): ApplicationReleaseChangeFoundation {
  if (!cached) {
    return buildApplicationReleaseChange();
  }
  return cloneFoundation(cached);
}

/** Stable content fingerprint for determinism checks. */
export function applicationReleaseChangeFingerprint(
  row?: ApplicationReleaseChangeFoundation,
): string {
  const v = row ?? getApplicationReleaseChange();
  return v.fingerprint;
}

/** Test helper — clears ARL-1 cache only. */
export function clearApplicationReleaseChange(): void {
  cached = null;
}

/** Ensure PG-3 freeze then build ARL-1 (verify scripts). */
export function ensurePg3FreezeThenBuildApplicationReleaseChange(): ApplicationReleaseChangeFoundation {
  buildPg3FreezeManifest();
  clearApplicationReleaseChange();
  return buildApplicationReleaseChange();
}
