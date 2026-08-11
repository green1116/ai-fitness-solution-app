/**
 * ESCL-1 — Customer Lifecycle State
 * Deterministic CustomerLifecycleState from ESCE ExecutionFeedback + PG/ESCO signals.
 * Baseline: enterprise-saas-commercial-execution-v1.
 * No CRM/billing / ESCE mutation / redesign.
 */

import { createHash } from "node:crypto";

import {
  ESCE_3_ID,
  EXECUTION_FEEDBACK_VERSION,
  ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1,
  ESCE2_EXECUTION_OUTCOME_BASELINE,
  getExecutionFeedback,
  type ExecutionFeedback,
  type ExecutionFeedbackRecord,
  type ExecutionFeedbackStatus,
} from "../execution";
import type { CommercialAction } from "../operations";
import { getCommercialHealth } from "../operations";
import {
  getCustomerLifecycleRegistry,
  type CustomerLifecycleStage,
} from "../../release/customer/customer-lifecycle-registry";
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

export const ESCL_1_ID = "ESCL-1" as const;
export const CUSTOMER_LIFECYCLE_STATE_CAPABILITY =
  "CustomerLifecycleState" as const;
export const CUSTOMER_LIFECYCLE_STATE_VERSION =
  "escl-1-customer-lifecycle-state-1" as const;
export const ESCE_V1_BASELINE = ENTERPRISE_SAAS_COMMERCIAL_EXECUTION_V1;

export const CUSTOMER_LIFECYCLE_STATES = [
  "ONBOARDING",
  "ACTIVE",
  "EXPANDING",
  "WATCHING",
  "AT_RISK",
] as const;
export type CustomerLifecycleStateLevel =
  (typeof CUSTOMER_LIFECYCLE_STATES)[number];

export type CustomerLifecycleStateRecord = Readonly<{
  customerId: string;
  tenantId: string;
  state: CustomerLifecycleStateLevel;
  sourceStage: CustomerLifecycleStage;
  sourceFeedback: ExecutionFeedbackStatus;
  action: CommercialAction;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CustomerLifecycleState = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCL_1_ID;
  capability: typeof CUSTOMER_LIFECYCLE_STATE_CAPABILITY;
  version: typeof CUSTOMER_LIFECYCLE_STATE_VERSION;
  baselineTag: typeof ESCE_V1_BASELINE;
  parentPack: typeof ESCE_3_ID;
  parentVersion: typeof EXECUTION_FEEDBACK_VERSION;
  parentBaseline: typeof ESCE2_EXECUTION_OUTCOME_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CustomerLifecycleStateRecord[];
  recordCount: number;
  onboardingCount: number;
  activeCount: number;
  expandingCount: number;
  watchingCount: number;
  atRiskCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  executionFeedbackFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noEsceMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: CustomerLifecycleState | null = null;

function cloneState(row: CustomerLifecycleState): CustomerLifecycleState {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CustomerLifecycleState, "fingerprint">,
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
    productionBaseline: row.productionBaseline,
    records: row.records,
    recordCount: row.recordCount,
    onboardingCount: row.onboardingCount,
    activeCount: row.activeCount,
    expandingCount: row.expandingCount,
    watchingCount: row.watchingCount,
    atRiskCount: row.atRiskCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    executionFeedbackFingerprint: row.executionFeedbackFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerLifecycleState, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CustomerLifecycleStateRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        state: row.state,
        sourceStage: row.sourceStage,
        sourceFeedback: row.sourceFeedback,
        action: row.action,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function mapState(input: {
  feedback: ExecutionFeedbackStatus;
  stage: CustomerLifecycleStage;
  health: "HEALTHY" | "WATCH" | "RISK" | undefined;
  action: CommercialAction;
}): { state: CustomerLifecycleStateLevel; reason: string } {
  if (input.feedback === "OPEN" || input.health === "RISK") {
    return { state: "AT_RISK", reason: "at-risk-from-open" };
  }
  if (input.feedback === "WATCH" || input.health === "WATCH") {
    return { state: "WATCHING", reason: "watching-from-feedback" };
  }
  if (
    input.action === "EXPAND" ||
    input.stage === "EXPANSION"
  ) {
    return { state: "EXPANDING", reason: "expanding-from-signal" };
  }
  if (input.stage === "PROSPECT" || input.stage === "ONBOARDING") {
    return { state: "ONBOARDING", reason: "onboarding-from-stage" };
  }
  return { state: "ACTIVE", reason: "active-from-closed" };
}

function projectRecord(
  rec: ExecutionFeedbackRecord,
  stage: CustomerLifecycleStage,
  health: "HEALTHY" | "WATCH" | "RISK" | undefined,
): CustomerLifecycleStateRecord {
  const mapped = mapState({
    feedback: rec.feedback,
    stage,
    health,
    action: rec.action,
  });
  const withoutFp: Omit<CustomerLifecycleStateRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    state: mapped.state,
    sourceStage: stage,
    sourceFeedback: rec.feedback,
    action: rec.action,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromFeedback(
  feedback: ExecutionFeedback,
): CustomerLifecycleState {
  const lifecycle = getCustomerLifecycleRegistry();
  const health = getCommercialHealth();
  const stageById = new Map(
    lifecycle.customers.map((c) => [c.customerId, c.lifecycleStage] as const),
  );
  const healthById = new Map(
    health.records.map((r) => [r.customerId, r.health] as const),
  );

  const records = feedback.records.map((rec) =>
    projectRecord(
      rec,
      stageById.get(rec.customerId) ?? "PROSPECT",
      healthById.get(rec.customerId),
    ),
  );
  const onboardingCount = records.filter((r) => r.state === "ONBOARDING").length;
  const activeCount = records.filter((r) => r.state === "ACTIVE").length;
  const expandingCount = records.filter((r) => r.state === "EXPANDING").length;
  const watchingCount = records.filter((r) => r.state === "WATCHING").length;
  const atRiskCount = records.filter((r) => r.state === "AT_RISK").length;

  const withoutFp: Omit<CustomerLifecycleState, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCL_1_ID,
    capability: CUSTOMER_LIFECYCLE_STATE_CAPABILITY,
    version: CUSTOMER_LIFECYCLE_STATE_VERSION,
    baselineTag: ESCE_V1_BASELINE,
    parentPack: ESCE_3_ID,
    parentVersion: EXECUTION_FEEDBACK_VERSION,
    parentBaseline: ESCE2_EXECUTION_OUTCOME_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    onboardingCount,
    activeCount,
    expandingCount,
    watchingCount,
    atRiskCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    executionFeedbackFingerprint: feedback.fingerprint,
    scope: {
      readOnly: true,
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

/** Build CustomerLifecycleState from ExecutionFeedback + commercial signals. */
export function buildCustomerLifecycleState(
  feedback?: ExecutionFeedback,
): CustomerLifecycleState {
  const source = feedback ?? getExecutionFeedback();
  const out = deriveFromFeedback(source);
  cached = cloneState(out);
  return cloneState(cached);
}

export function getCustomerLifecycleState(): CustomerLifecycleState {
  if (!cached) {
    return buildCustomerLifecycleState();
  }
  return cloneState(cached);
}

export function customerLifecycleStateFingerprint(
  row?: CustomerLifecycleState,
): string {
  const v = row ?? getCustomerLifecycleState();
  return v.fingerprint;
}

export function clearCustomerLifecycleState(): void {
  cached = null;
}
