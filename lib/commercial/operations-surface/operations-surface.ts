/**
 * ESOS-1 — Operations Surface View Model
 * Deterministic application-facing view of frozen ESPO queue / decision / outcome / feedback.
 * Baseline: enterprise-saas-production-operations-v1.
 * View only — no new engine / persistence / side effects / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1,
  ESPO3_OPERATING_OUTCOME_BASELINE,
  ESPO_FREEZE_ID,
  ESPO_FREEZE_VERSION,
  getEspoFreeze,
  getOperatingDecision,
  getOperatingFeedback,
  getOperatingOutcome,
  getOperatingQueue,
  type OperatingDecisionRecord,
  type OperatingFeedbackRecord,
  type OperatingOutcomeRecord,
  type OperatingQueueItem,
} from "../production-ops";
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

export const ESOS_1_ID = "ESOS-1" as const;
export const OPERATIONS_SURFACE_CAPABILITY = "OperationsSurface" as const;
export const OPERATIONS_SURFACE_VERSION =
  "esos-1-operations-surface-1" as const;
export const ESPO_V1_BASELINE = ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1;

export type OperationsSurfaceSummary = Readonly<{
  itemCount: number;
  openCount: number;
  queuedCount: number;
  watchCount: number;
  heldCount: number;
  actCount: number;
  recordedCount: number;
  escalateCount: number;
}>;

export type OperationsSurface = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESOS_1_ID;
  capability: typeof OPERATIONS_SURFACE_CAPABILITY;
  version: typeof OPERATIONS_SURFACE_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1;
  espoBaseline: typeof ESPO_V1_BASELINE;
  parentPack: typeof ESPO_FREEZE_ID;
  parentVersion: typeof ESPO_FREEZE_VERSION;
  parentBaseline: typeof ESPO3_OPERATING_OUTCOME_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  queue: readonly OperatingQueueItem[];
  decisions: readonly OperatingDecisionRecord[];
  outcomes: readonly OperatingOutcomeRecord[];
  feedback: readonly OperatingFeedbackRecord[];
  summary: OperationsSurfaceSummary;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  operatingQueueFingerprint: string;
  operatingDecisionFingerprint: string;
  operatingOutcomeFingerprint: string;
  operatingFeedbackFingerprint: string;
  espoFreezeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    viewOnly: true;
    noPersistence: true;
    noExecution: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noMarketingExecution: true;
    noBillingPlatform: true;
    noContractExecution: true;
    noPaymentExecution: true;
    noEspoMutation: true;
    noEscpMutation: true;
    noEsciMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: OperationsSurface | null = null;

function cloneSurface(row: OperationsSurface): OperationsSurface {
  return {
    ...row,
    queue: row.queue.map((r) => ({ ...r })),
    decisions: row.decisions.map((r) => ({ ...r })),
    outcomes: row.outcomes.map((r) => ({ ...r })),
    feedback: row.feedback.map((r) => ({ ...r })),
    summary: { ...row.summary },
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<OperationsSurface, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    espoBaseline: row.espoBaseline,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    queue: row.queue,
    decisions: row.decisions,
    outcomes: row.outcomes,
    feedback: row.feedback,
    summary: row.summary,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    operatingQueueFingerprint: row.operatingQueueFingerprint,
    operatingDecisionFingerprint: row.operatingDecisionFingerprint,
    operatingOutcomeFingerprint: row.operatingOutcomeFingerprint,
    operatingFeedbackFingerprint: row.operatingFeedbackFingerprint,
    espoFreezeFingerprint: row.espoFreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<OperationsSurface, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function deriveSurface(): OperationsSurface {
  const queuePack = getOperatingQueue();
  const decisionPack = getOperatingDecision();
  const outcomePack = getOperatingOutcome();
  const feedbackPack = getOperatingFeedback();
  const freeze = getEspoFreeze();
  const withoutFp: Omit<OperationsSurface, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESOS_1_ID,
    capability: OPERATIONS_SURFACE_CAPABILITY,
    version: OPERATIONS_SURFACE_VERSION,
    baselineTag: ENTERPRISE_SAAS_PRODUCTION_OPERATIONS_V1,
    espoBaseline: ESPO_V1_BASELINE,
    parentPack: ESPO_FREEZE_ID,
    parentVersion: ESPO_FREEZE_VERSION,
    parentBaseline: ESPO3_OPERATING_OUTCOME_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    queue: queuePack.records.map((r) => ({ ...r })),
    decisions: decisionPack.records.map((r) => ({ ...r })),
    outcomes: outcomePack.records.map((r) => ({ ...r })),
    feedback: feedbackPack.records.map((r) => ({ ...r })),
    summary: {
      itemCount: queuePack.recordCount,
      openCount: queuePack.openCount,
      queuedCount: queuePack.queuedCount,
      watchCount: queuePack.watchCount,
      heldCount: queuePack.heldCount,
      actCount: decisionPack.actCount,
      recordedCount: outcomePack.recordedCount,
      escalateCount: feedbackPack.escalateCount,
    },
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    operatingQueueFingerprint: queuePack.fingerprint,
    operatingDecisionFingerprint: decisionPack.fingerprint,
    operatingOutcomeFingerprint: outcomePack.fingerprint,
    operatingFeedbackFingerprint: feedbackPack.fingerprint,
    espoFreezeFingerprint: freeze.fingerprint,
    scope: {
      readOnly: true,
      viewOnly: true,
      noPersistence: true,
      noExecution: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noMarketingExecution: true,
      noBillingPlatform: true,
      noContractExecution: true,
      noPaymentExecution: true,
      noEspoMutation: true,
      noEscpMutation: true,
      noEsciMutation: true,
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

export function buildOperationsSurface(): OperationsSurface {
  const out = deriveSurface();
  cached = cloneSurface(out);
  return cloneSurface(cached);
}

export function getOperationsSurface(): OperationsSurface {
  if (!cached) {
    return buildOperationsSurface();
  }
  return cloneSurface(cached);
}

export function operationsSurfaceFingerprint(
  row?: OperationsSurface,
): string {
  const v = row ?? getOperationsSurface();
  return v.fingerprint;
}

export function clearOperationsSurface(): void {
  cached = null;
}
