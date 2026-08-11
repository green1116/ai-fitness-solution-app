/**
 * ESCL-4 — Lifecycle Review
 * Deterministic LifecycleReview from ESCL-3 LifecycleAction.
 * Baseline: escl3-lifecycle-action-v1.
 * Review only — no persistence / runtime side effects / CRM / billing / ESCE mutation.
 */

import { createHash } from "node:crypto";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
} from "../../release/ga-release";
import {
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_COMMIT_REF,
} from "../../release/health/release-health-registry";
import { RELEASE_ID } from "../../release/release-readiness";
import {
  ESCL2_LIFECYCLE_TRANSITION_BASELINE,
  ESCL_3_ID,
  LIFECYCLE_ACTION_VERSION,
  buildLifecycleAction,
  getLifecycleAction,
  type LifecycleAction,
  type LifecycleActionKind,
  type LifecycleActionRecord,
} from "./lifecycle-action";
import type { CustomerLifecycleStateLevel } from "./customer-lifecycle-state";

export const ESCL_4_ID = "ESCL-4" as const;
export const LIFECYCLE_REVIEW_CAPABILITY = "LifecycleReview" as const;
export const LIFECYCLE_REVIEW_VERSION = "escl-4-lifecycle-review-1" as const;
export const ESCL3_LIFECYCLE_ACTION_BASELINE =
  "escl3-lifecycle-action-v1" as const;

export const LIFECYCLE_REVIEW_STATUSES = [
  "STABLE",
  "WATCH",
  "ACTION_REQUIRED",
] as const;
export type LifecycleReviewStatus = (typeof LIFECYCLE_REVIEW_STATUSES)[number];

export type LifecycleReviewRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: CustomerLifecycleStateLevel;
  toState: CustomerLifecycleStateLevel;
  action: LifecycleActionKind;
  reviewStatus: LifecycleReviewStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type LifecycleReview = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCL_4_ID;
  capability: typeof LIFECYCLE_REVIEW_CAPABILITY;
  version: typeof LIFECYCLE_REVIEW_VERSION;
  baselineTag: typeof ESCL3_LIFECYCLE_ACTION_BASELINE;
  parentPack: typeof ESCL_3_ID;
  parentVersion: typeof LIFECYCLE_ACTION_VERSION;
  parentBaseline: typeof ESCL2_LIFECYCLE_TRANSITION_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly LifecycleReviewRecord[];
  recordCount: number;
  stableCount: number;
  watchCount: number;
  actionRequiredCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  lifecycleActionFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noEsceMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: LifecycleReview | null = null;

function cloneReview(row: LifecycleReview): LifecycleReview {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<LifecycleReview, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    records: row.records,
    recordCount: row.recordCount,
    stableCount: row.stableCount,
    watchCount: row.watchCount,
    actionRequiredCount: row.actionRequiredCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    lifecycleActionFingerprint: row.lifecycleActionFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<LifecycleReview, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<LifecycleReviewRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        toState: row.toState,
        action: row.action,
        reviewStatus: row.reviewStatus,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map lifecycle action to review status (no execution). */
export function lifecycleReviewStatusFromAction(
  action: LifecycleActionKind,
): { reviewStatus: LifecycleReviewStatus; reason: string } {
  if (action === "INTERVENE") {
    return { reviewStatus: "ACTION_REQUIRED", reason: "action-required-intervene" };
  }
  if (action === "MONITOR" || action === "PROMOTE") {
    return { reviewStatus: "WATCH", reason: "watch-from-action" };
  }
  return { reviewStatus: "STABLE", reason: "stable-from-retain" };
}

function projectRecord(rec: LifecycleActionRecord): LifecycleReviewRecord {
  const mapped = lifecycleReviewStatusFromAction(rec.action);
  const withoutFp: Omit<LifecycleReviewRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.fromState,
    toState: rec.toState,
    action: rec.action,
    reviewStatus: mapped.reviewStatus,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromAction(action: LifecycleAction): LifecycleReview {
  const records = action.records.map(projectRecord);
  const stableCount = records.filter((r) => r.reviewStatus === "STABLE").length;
  const watchCount = records.filter((r) => r.reviewStatus === "WATCH").length;
  const actionRequiredCount = records.filter(
    (r) => r.reviewStatus === "ACTION_REQUIRED",
  ).length;

  const withoutFp: Omit<LifecycleReview, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCL_4_ID,
    capability: LIFECYCLE_REVIEW_CAPABILITY,
    version: LIFECYCLE_REVIEW_VERSION,
    baselineTag: ESCL3_LIFECYCLE_ACTION_BASELINE,
    parentPack: ESCL_3_ID,
    parentVersion: LIFECYCLE_ACTION_VERSION,
    parentBaseline: ESCL2_LIFECYCLE_TRANSITION_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    stableCount,
    watchCount,
    actionRequiredCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    lifecycleActionFingerprint: action.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
      noEsceMutation: true,
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

export function buildLifecycleReview(
  action?: LifecycleAction,
): LifecycleReview {
  const source = action ?? getLifecycleAction();
  const out = deriveFromAction(source);
  cached = cloneReview(out);
  return cloneReview(cached);
}

export function getLifecycleReview(): LifecycleReview {
  if (!cached) {
    return buildLifecycleReview();
  }
  return cloneReview(cached);
}

export function lifecycleReviewFingerprint(row?: LifecycleReview): string {
  const v = row ?? getLifecycleReview();
  return v.fingerprint;
}

export function clearLifecycleReview(): void {
  cached = null;
}

export function ensureActionThenBuildLifecycleReview(): LifecycleReview {
  buildLifecycleAction();
  clearLifecycleReview();
  return buildLifecycleReview();
}
