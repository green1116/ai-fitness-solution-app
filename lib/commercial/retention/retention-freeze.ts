/**
 * ESCR-4 — Retention Review / Freeze
 * Deterministic review of ESCR-3 outcome, then freeze ESCR-1/2/3.
 * Base: enterprise-saas-customer-success-v1.
 * Freeze only — no ESCS / ESCL / ESCE mutation / persistence / runtime side effects.
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
import { ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1 } from "../customer-success";
import {
  ESCR1_RETENTION_STATE_BASELINE,
  ESCR_2_ID,
  RETENTION_INTERVENTION_CAPABILITY,
  RETENTION_INTERVENTION_VERSION,
  getRetentionIntervention,
  type RetentionInterventionKind,
} from "./retention-intervention";
import {
  ESCR2_RETENTION_INTERVENTION_BASELINE,
  ESCR_3_ID,
  RETENTION_OUTCOME_CAPABILITY,
  RETENTION_OUTCOME_VERSION,
  getRetentionOutcome,
  type RetentionOutcome,
  type RetentionOutcomeKind,
  type RetentionOutcomeRecord,
} from "./retention-outcome";
import {
  ESCR_1_ID,
  ESCS_V1_BASELINE,
  RETENTION_STATE_CAPABILITY,
  RETENTION_STATE_VERSION,
  getRetentionState,
  type RetentionStateLevel,
} from "./retention-state";

export const ESCR_4_ID = "ESCR-4" as const;
export const RETENTION_REVIEW_CAPABILITY = "RetentionReview" as const;
export const RETENTION_REVIEW_VERSION = "escr-4-retention-review-1" as const;
export const ESCR3_RETENTION_OUTCOME_BASELINE =
  "escr3-retention-outcome-v1" as const;

export const RETENTION_REVIEW_STATUSES = [
  "STABLE",
  "WATCH",
  "ACTION_REQUIRED",
] as const;
export type RetentionReviewStatus = (typeof RETENTION_REVIEW_STATUSES)[number];

export type RetentionReviewRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: RetentionStateLevel;
  intervention: RetentionInterventionKind;
  outcome: RetentionOutcomeKind;
  reviewStatus: RetentionReviewStatus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type RetentionReview = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCR_4_ID;
  capability: typeof RETENTION_REVIEW_CAPABILITY;
  version: typeof RETENTION_REVIEW_VERSION;
  baselineTag: typeof ESCR3_RETENTION_OUTCOME_BASELINE;
  parentPack: typeof ESCR_3_ID;
  parentVersion: typeof RETENTION_OUTCOME_VERSION;
  parentBaseline: typeof ESCR2_RETENTION_INTERVENTION_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly RetentionReviewRecord[];
  recordCount: number;
  stableCount: number;
  watchCount: number;
  actionRequiredCount: number;
  lifecycleComplete: true;
  freezeReady: true;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  retentionOutcomeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noEscsMutation: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let reviewCached: RetentionReview | null = null;

function cloneReview(row: RetentionReview): RetentionReview {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function reviewPayload(row: Omit<RetentionReview, "fingerprint">): string {
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
    lifecycleComplete: row.lifecycleComplete,
    freezeReady: row.freezeReady,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    retentionOutcomeFingerprint: row.retentionOutcomeFingerprint,
    scope: row.scope,
  });
}

function reviewFingerprintOf(
  row: Omit<RetentionReview, "fingerprint">,
): string {
  return createHash("sha256").update(reviewPayload(row)).digest("hex");
}

function reviewRecordFingerprint(
  row: Omit<RetentionReviewRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        intervention: row.intervention,
        outcome: row.outcome,
        reviewStatus: row.reviewStatus,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

export function retentionReviewStatusFromOutcome(
  outcome: RetentionOutcomeKind,
): { reviewStatus: RetentionReviewStatus; reason: string } {
  if (outcome === "RECOVER") {
    return { reviewStatus: "ACTION_REQUIRED", reason: "action-required-recover" };
  }
  if (outcome === "STABILIZE" || outcome === "GROW" || outcome === "ADOPT") {
    return { reviewStatus: "WATCH", reason: "watch-from-outcome" };
  }
  return { reviewStatus: "STABLE", reason: "stable-from-sustain" };
}

function projectReviewRecord(
  rec: RetentionOutcomeRecord,
): RetentionReviewRecord {
  const mapped = retentionReviewStatusFromOutcome(rec.outcome);
  const withoutFp: Omit<RetentionReviewRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.fromState,
    intervention: rec.intervention,
    outcome: rec.outcome,
    reviewStatus: mapped.reviewStatus,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return { ...withoutFp, fingerprint: reviewRecordFingerprint(withoutFp) };
}

function deriveReview(outcome: RetentionOutcome): RetentionReview {
  const records = outcome.records.map(projectReviewRecord);
  const withoutFp: Omit<RetentionReview, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCR_4_ID,
    capability: RETENTION_REVIEW_CAPABILITY,
    version: RETENTION_REVIEW_VERSION,
    baselineTag: ESCR3_RETENTION_OUTCOME_BASELINE,
    parentPack: ESCR_3_ID,
    parentVersion: RETENTION_OUTCOME_VERSION,
    parentBaseline: ESCR2_RETENTION_INTERVENTION_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    stableCount: records.filter((r) => r.reviewStatus === "STABLE").length,
    watchCount: records.filter((r) => r.reviewStatus === "WATCH").length,
    actionRequiredCount: records.filter(
      (r) => r.reviewStatus === "ACTION_REQUIRED",
    ).length,
    lifecycleComplete: true,
    freezeReady: true,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    retentionOutcomeFingerprint: outcome.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
      noEscsMutation: true,
      noEsclMutation: true,
      noEsceMutation: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
      gaBaselineUnchanged: true,
    },
  };
  return { ...withoutFp, fingerprint: reviewFingerprintOf(withoutFp) };
}

export function buildRetentionReview(
  outcome?: RetentionOutcome,
): RetentionReview {
  const source = outcome ?? getRetentionOutcome();
  const out = deriveReview(source);
  reviewCached = cloneReview(out);
  return cloneReview(reviewCached);
}

export function getRetentionReview(): RetentionReview {
  if (!reviewCached) {
    return buildRetentionReview();
  }
  return cloneReview(reviewCached);
}

export function retentionReviewFingerprint(row?: RetentionReview): string {
  return (row ?? getRetentionReview()).fingerprint;
}

export function clearRetentionReview(): void {
  reviewCached = null;
}

export const ESCR_FREEZE_ID = "ESCR-Freeze" as const;
export const ESCR_FREEZE_CAPABILITY = "EscrRetentionFreeze" as const;
export const ESCR_FREEZE_VERSION = "escr-freeze-1.0.0" as const;
export const ESCR_FREEZE_CODENAME =
  "Enterprise SaaS Customer Retention v1 Freeze" as const;
export const ESCR_FREEZE_DATE = "2026-08-11" as const;

export const ENTERPRISE_SAAS_CUSTOMER_RETENTION_V1 =
  "enterprise-saas-customer-retention-v1" as const;

export type EscrComponentStatus = "frozen";

export type EscrComponentEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  version: string;
  baselineTag: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  status: EscrComponentStatus;
}>;

export const ESCR_COMPONENTS: readonly EscrComponentEntry[] = [
  {
    id: ESCR_1_ID,
    name: "Retention State",
    capability: RETENTION_STATE_CAPABILITY,
    version: RETENTION_STATE_VERSION,
    baselineTag: ESCS_V1_BASELINE,
    modulePath: "lib/commercial/retention/retention-state.ts",
    verifyScript: "scripts/verify-escr-1-retention-state.ts",
    buildApi: "buildRetentionState",
    status: "frozen",
  },
  {
    id: ESCR_2_ID,
    name: "Retention Intervention",
    capability: RETENTION_INTERVENTION_CAPABILITY,
    version: RETENTION_INTERVENTION_VERSION,
    baselineTag: ESCR1_RETENTION_STATE_BASELINE,
    modulePath: "lib/commercial/retention/retention-intervention.ts",
    verifyScript: "scripts/verify-escr-2-retention-intervention.ts",
    buildApi: "buildRetentionIntervention",
    status: "frozen",
  },
  {
    id: ESCR_3_ID,
    name: "Retention Outcome",
    capability: RETENTION_OUTCOME_CAPABILITY,
    version: RETENTION_OUTCOME_VERSION,
    baselineTag: ESCR2_RETENTION_INTERVENTION_BASELINE,
    modulePath: "lib/commercial/retention/retention-outcome.ts",
    verifyScript: "scripts/verify-escr-3-retention-outcome.ts",
    buildApi: "buildRetentionOutcome",
    status: "frozen",
  },
] as const;

export type EscrFreezeManifest = Readonly<{
  productBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_RETENTION_V1;
  successBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1;
  packBaseline: typeof ESCR2_RETENTION_INTERVENTION_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  components: readonly EscrComponentEntry[];
  versionReferences: {
    freezeVersion: typeof ESCR_FREEZE_VERSION;
    "ESCR-1": typeof RETENTION_STATE_VERSION;
    "ESCR-2": typeof RETENTION_INTERVENTION_VERSION;
    "ESCR-3": typeof RETENTION_OUTCOME_VERSION;
  };
  componentFingerprints: {
    "ESCR-1": string;
    "ESCR-2": string;
    "ESCR-3": string;
  };
}>;

export type EscrFreeze = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCR_FREEZE_ID;
  capability: typeof ESCR_FREEZE_CAPABILITY;
  version: typeof ESCR_FREEZE_VERSION;
  codename: typeof ESCR_FREEZE_CODENAME;
  freezeDate: typeof ESCR_FREEZE_DATE;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_RETENTION_V1;
  successBaseline: typeof ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  manifest: EscrFreezeManifest;
  reviewFingerprint: string;
  verificationSummary: {
    status: "PASS" | "FAIL";
    componentCount: number;
    certified: boolean;
  };
  fingerprint: string;
  certification: "certified" | "blocked";
  scope: {
    components: "ESCR-1~ESCR-3";
    closure: "ESCR-Freeze";
    chain: "STATE -> INTERVENTION -> OUTCOME -> REVIEW -> FROZEN";
    product: "Enterprise SaaS Customer Retention v1";
    immutable: true;
    freezeOnly: true;
    noEscsMutation: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    readOnly: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let freezeCached: EscrFreeze | null = null;

function cloneFreeze(row: EscrFreeze): EscrFreeze {
  return {
    ...row,
    manifest: {
      ...row.manifest,
      components: row.manifest.components.map((c) => ({ ...c })),
      versionReferences: { ...row.manifest.versionReferences },
      componentFingerprints: { ...row.manifest.componentFingerprints },
    },
    verificationSummary: { ...row.verificationSummary },
    scope: { ...row.scope },
  };
}

function freezePayload(row: Omit<EscrFreeze, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    codename: row.codename,
    freezeDate: row.freezeDate,
    baselineTag: row.baselineTag,
    successBaseline: row.successBaseline,
    productionBaseline: row.productionBaseline,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    manifest: row.manifest,
    reviewFingerprint: row.reviewFingerprint,
    verificationSummary: row.verificationSummary,
    certification: row.certification,
    scope: row.scope,
  });
}

function freezeFingerprintOf(row: Omit<EscrFreeze, "fingerprint">): string {
  return createHash("sha256").update(freezePayload(row)).digest("hex");
}

function buildManifest(): EscrFreezeManifest {
  const state = getRetentionState();
  const intervention = getRetentionIntervention();
  const outcome = getRetentionOutcome();
  return {
    productBaseline: ENTERPRISE_SAAS_CUSTOMER_RETENTION_V1,
    successBaseline: ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1,
    packBaseline: ESCR2_RETENTION_INTERVENTION_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    components: ESCR_COMPONENTS.map((c) => ({ ...c })),
    versionReferences: {
      freezeVersion: ESCR_FREEZE_VERSION,
      "ESCR-1": RETENTION_STATE_VERSION,
      "ESCR-2": RETENTION_INTERVENTION_VERSION,
      "ESCR-3": RETENTION_OUTCOME_VERSION,
    },
    componentFingerprints: {
      "ESCR-1": state.fingerprint,
      "ESCR-2": intervention.fingerprint,
      "ESCR-3": outcome.fingerprint,
    },
  };
}

function deriveFreeze(review: RetentionReview): EscrFreeze {
  const manifest = buildManifest();
  const fps = Object.values(manifest.componentFingerprints);
  const pass =
    ESCR_COMPONENTS.length === 3 &&
    ESCR_COMPONENTS.every((c) => c.status === "frozen") &&
    review.recordCount > 0 &&
    review.lifecycleComplete === true &&
    review.freezeReady === true &&
    review.scope.noRuntimeSideEffects === true &&
    fps.every((fp) => fp.length === 64) &&
    manifest.successBaseline === ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1 &&
    ESCS_V1_BASELINE === ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1;

  const withoutFp: Omit<EscrFreeze, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCR_FREEZE_ID,
    capability: ESCR_FREEZE_CAPABILITY,
    version: ESCR_FREEZE_VERSION,
    codename: ESCR_FREEZE_CODENAME,
    freezeDate: ESCR_FREEZE_DATE,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_RETENTION_V1,
    successBaseline: ENTERPRISE_SAAS_CUSTOMER_SUCCESS_V1,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    manifest,
    reviewFingerprint: review.fingerprint,
    verificationSummary: {
      status: pass ? "PASS" : "FAIL",
      componentCount: ESCR_COMPONENTS.length,
      certified: pass,
    },
    certification: pass ? "certified" : "blocked",
    scope: {
      components: "ESCR-1~ESCR-3",
      closure: "ESCR-Freeze",
      chain: "STATE -> INTERVENTION -> OUTCOME -> REVIEW -> FROZEN",
      product: "Enterprise SaaS Customer Retention v1",
      immutable: true,
      freezeOnly: true,
      noEscsMutation: true,
      noEsclMutation: true,
      noEsceMutation: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      readOnly: true,
      noDatabase: true,
      noUi: true,
      additiveOnly: true,
      gaBaselineUnchanged: true,
    },
  };
  return { ...withoutFp, fingerprint: freezeFingerprintOf(withoutFp) };
}

export function buildEscrFreeze(): EscrFreeze {
  const review = getRetentionReview();
  const out = deriveFreeze(review);
  freezeCached = cloneFreeze(out);
  return cloneFreeze(freezeCached);
}

export function getEscrFreeze(): EscrFreeze {
  if (!freezeCached) {
    return buildEscrFreeze();
  }
  return cloneFreeze(freezeCached);
}

export function escrFreezeFingerprint(row?: EscrFreeze): string {
  return (row ?? getEscrFreeze()).fingerprint;
}

export function clearEscrFreeze(): void {
  freezeCached = null;
}

export function ensureReviewThenBuildEscrFreeze(): EscrFreeze {
  buildRetentionReview();
  clearEscrFreeze();
  return buildEscrFreeze();
}
