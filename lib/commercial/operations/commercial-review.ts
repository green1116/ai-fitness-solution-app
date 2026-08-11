/**
 * ESCO-4 — Commercial Operations Review
 * Deterministic read-only review of ESCO-2 health + ESCO-3 action signals.
 * Maps to STABLE | WATCH | ACTION_REQUIRED. No action execution.
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
import { ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1 } from "../../runtime/freeze";
import {
  COMMERCIAL_ACTION_SIGNAL_VERSION,
  ESCO2_COMMERCIAL_HEALTH_BASELINE,
  ESCO_3_ID,
  buildCommercialActionSignal,
  getCommercialActionSignal,
  type CommercialAction,
  type CommercialActionSignal,
  type CommercialActionSignalRecord,
} from "./commercial-action-signal";
import {
  getCommercialHealth,
  type CommercialHealthLevel,
} from "./commercial-health";

export const ESCO_4_ID = "ESCO-4" as const;
export const COMMERCIAL_OPERATIONS_REVIEW_CAPABILITY =
  "CommercialOperationsReview" as const;
export const COMMERCIAL_OPERATIONS_REVIEW_VERSION =
  "esco-4-commercial-review-1" as const;
/** ESCO-3 commercial action signal pack baseline. */
export const ESCO3_COMMERCIAL_ACTION_SIGNAL_BASELINE =
  "esco3-commercial-action-signal-v1" as const;

export const COMMERCIAL_REVIEW_STATUSES = [
  "STABLE",
  "WATCH",
  "ACTION_REQUIRED",
] as const;
export type CommercialReviewStatus =
  (typeof COMMERCIAL_REVIEW_STATUSES)[number];

export type CommercialOperationsReviewRecord = Readonly<{
  customerId: string;
  tenantId: string;
  health: CommercialHealthLevel;
  action: CommercialAction;
  reviewStatus: CommercialReviewStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CommercialOperationsReview = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCO_4_ID;
  capability: typeof COMMERCIAL_OPERATIONS_REVIEW_CAPABILITY;
  version: typeof COMMERCIAL_OPERATIONS_REVIEW_VERSION;
  baselineTag: typeof ESCO3_COMMERCIAL_ACTION_SIGNAL_BASELINE;
  parentPack: typeof ESCO_3_ID;
  parentVersion: typeof COMMERCIAL_ACTION_SIGNAL_VERSION;
  parentBaseline: typeof ESCO2_COMMERCIAL_HEALTH_BASELINE;
  productBaseline: typeof ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CommercialOperationsReviewRecord[];
  recordCount: number;
  stableCount: number;
  watchCount: number;
  actionRequiredCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  commercialActionSignalFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noExecution: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noArlV2: true;
    noRso9: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: CommercialOperationsReview | null = null;

function cloneReview(
  row: CommercialOperationsReview,
): CommercialOperationsReview {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CommercialOperationsReview, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productBaseline: row.productBaseline,
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
    commercialActionSignalFingerprint: row.commercialActionSignalFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CommercialOperationsReview, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CommercialOperationsReviewRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        health: row.health,
        action: row.action,
        reviewStatus: row.reviewStatus,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map action signal to review status (no execution). */
export function commercialReviewStatusFromAction(
  action: CommercialAction,
): { reviewStatus: CommercialReviewStatus; reason: string } {
  if (action === "ESCALATE") {
    return { reviewStatus: "ACTION_REQUIRED", reason: "action-required-escalate" };
  }
  if (action === "WATCH" || action === "EXPAND") {
    return { reviewStatus: "WATCH", reason: "watch-from-action" };
  }
  return { reviewStatus: "STABLE", reason: "stable-from-retain" };
}

function projectRecord(
  signal: CommercialActionSignalRecord,
): CommercialOperationsReviewRecord {
  const mapped = commercialReviewStatusFromAction(signal.action);
  const withoutFp: Omit<CommercialOperationsReviewRecord, "fingerprint"> = {
    customerId: signal.customerId,
    tenantId: signal.tenantId,
    health: signal.sourceHealth,
    action: signal.action,
    reviewStatus: mapped.reviewStatus,
    reason: mapped.reason,
    ordinal: signal.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromSignal(
  signal: CommercialActionSignal,
): CommercialOperationsReview {
  const healthById = new Map(
    getCommercialHealth().records.map((r) => [r.customerId, r] as const),
  );
  const records = signal.signals.map((s) => {
    const projected = projectRecord(s);
    const health = healthById.get(s.customerId)?.health ?? s.sourceHealth;
    if (health === projected.health) return projected;
    const withoutFp: Omit<CommercialOperationsReviewRecord, "fingerprint"> = {
      ...projected,
      health,
    };
    return { ...withoutFp, fingerprint: recordFingerprint(withoutFp) };
  });
  const stableCount = records.filter((r) => r.reviewStatus === "STABLE").length;
  const watchCount = records.filter((r) => r.reviewStatus === "WATCH").length;
  const actionRequiredCount = records.filter(
    (r) => r.reviewStatus === "ACTION_REQUIRED",
  ).length;

  const withoutFp: Omit<CommercialOperationsReview, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCO_4_ID,
    capability: COMMERCIAL_OPERATIONS_REVIEW_CAPABILITY,
    version: COMMERCIAL_OPERATIONS_REVIEW_VERSION,
    baselineTag: ESCO3_COMMERCIAL_ACTION_SIGNAL_BASELINE,
    parentPack: ESCO_3_ID,
    parentVersion: COMMERCIAL_ACTION_SIGNAL_VERSION,
    parentBaseline: ESCO2_COMMERCIAL_HEALTH_BASELINE,
    productBaseline: ENTERPRISE_SAAS_RUNTIME_OPERATIONS_V1,
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
    commercialActionSignalFingerprint: signal.fingerprint,
    scope: {
      readOnly: true,
      noExecution: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
      noArlV2: true,
      noRso9: true,
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

/** Build CommercialOperationsReview from ESCO-3 action signals. */
export function buildCommercialOperationsReview(): CommercialOperationsReview {
  const signal = getCommercialActionSignal();
  const out = deriveFromSignal(signal);
  cached = cloneReview(out);
  return cloneReview(cached);
}

/** Get last built review, or build if none cached. */
export function getCommercialOperationsReview(): CommercialOperationsReview {
  if (!cached) {
    return buildCommercialOperationsReview();
  }
  return cloneReview(cached);
}

/** Stable content fingerprint for determinism checks. */
export function commercialOperationsReviewFingerprint(
  row?: CommercialOperationsReview,
): string {
  const v = row ?? getCommercialOperationsReview();
  return v.fingerprint;
}

/** Test helper — clears ESCO-4 cache only. */
export function clearCommercialOperationsReview(): void {
  cached = null;
}

/** Ensure ESCO-3 then build ESCO-4 (verify scripts). */
export function ensureSignalThenBuildCommercialOperationsReview(): CommercialOperationsReview {
  buildCommercialActionSignal();
  clearCommercialOperationsReview();
  return buildCommercialOperationsReview();
}
