/**
 * ESCL-2 — Lifecycle Transition
 * Deterministic LifecycleTransition from ESCL-1 CustomerLifecycleState.
 * Baseline: escl1-customer-lifecycle-state-v1.
 * No persistence / runtime side effects / CRM / billing / ESCE mutation.
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
import type { CommercialAction } from "../operations";
import {
  CUSTOMER_LIFECYCLE_STATE_VERSION,
  ESCE_V1_BASELINE,
  ESCL_1_ID,
  buildCustomerLifecycleState,
  getCustomerLifecycleState,
  type CustomerLifecycleState,
  type CustomerLifecycleStateLevel,
  type CustomerLifecycleStateRecord,
} from "./customer-lifecycle-state";

export const ESCL_2_ID = "ESCL-2" as const;
export const LIFECYCLE_TRANSITION_CAPABILITY = "LifecycleTransition" as const;
export const LIFECYCLE_TRANSITION_VERSION =
  "escl-2-lifecycle-transition-1" as const;
export const ESCL1_CUSTOMER_LIFECYCLE_STATE_BASELINE =
  "escl1-customer-lifecycle-state-v1" as const;

export const LIFECYCLE_TRANSITIONS = [
  "HOLD",
  "ADVANCE",
  "REVIEW",
  "ESCALATE",
] as const;
export type LifecycleTransitionKind = (typeof LIFECYCLE_TRANSITIONS)[number];

export type LifecycleTransitionRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: CustomerLifecycleStateLevel;
  toState: CustomerLifecycleStateLevel;
  transition: LifecycleTransitionKind;
  action: CommercialAction;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type LifecycleTransition = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCL_2_ID;
  capability: typeof LIFECYCLE_TRANSITION_CAPABILITY;
  version: typeof LIFECYCLE_TRANSITION_VERSION;
  baselineTag: typeof ESCL1_CUSTOMER_LIFECYCLE_STATE_BASELINE;
  parentPack: typeof ESCL_1_ID;
  parentVersion: typeof CUSTOMER_LIFECYCLE_STATE_VERSION;
  parentBaseline: typeof ESCE_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly LifecycleTransitionRecord[];
  recordCount: number;
  holdCount: number;
  advanceCount: number;
  reviewCount: number;
  escalateCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  customerLifecycleStateFingerprint: string;
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

let cached: LifecycleTransition | null = null;

function cloneTransition(row: LifecycleTransition): LifecycleTransition {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<LifecycleTransition, "fingerprint">): string {
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
    holdCount: row.holdCount,
    advanceCount: row.advanceCount,
    reviewCount: row.reviewCount,
    escalateCount: row.escalateCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    customerLifecycleStateFingerprint: row.customerLifecycleStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<LifecycleTransition, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<LifecycleTransitionRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        toState: row.toState,
        transition: row.transition,
        action: row.action,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map lifecycle state to a read-only intended transition. */
export function lifecycleTransitionFromState(
  state: CustomerLifecycleStateLevel,
): {
  transition: LifecycleTransitionKind;
  toState: CustomerLifecycleStateLevel;
  reason: string;
} {
  if (state === "AT_RISK") {
    return { transition: "ESCALATE", toState: "AT_RISK", reason: "escalate-at-risk" };
  }
  if (state === "WATCHING") {
    return { transition: "REVIEW", toState: "WATCHING", reason: "review-watching" };
  }
  if (state === "ONBOARDING") {
    return { transition: "ADVANCE", toState: "ACTIVE", reason: "advance-onboarding" };
  }
  if (state === "EXPANDING") {
    return { transition: "ADVANCE", toState: "EXPANDING", reason: "advance-expanding" };
  }
  return { transition: "HOLD", toState: "ACTIVE", reason: "hold-active" };
}

function projectRecord(
  rec: CustomerLifecycleStateRecord,
): LifecycleTransitionRecord {
  const mapped = lifecycleTransitionFromState(rec.state);
  const withoutFp: Omit<LifecycleTransitionRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.state,
    toState: mapped.toState,
    transition: mapped.transition,
    action: rec.action,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromState(state: CustomerLifecycleState): LifecycleTransition {
  const records = state.records.map(projectRecord);
  const holdCount = records.filter((r) => r.transition === "HOLD").length;
  const advanceCount = records.filter((r) => r.transition === "ADVANCE").length;
  const reviewCount = records.filter((r) => r.transition === "REVIEW").length;
  const escalateCount = records.filter((r) => r.transition === "ESCALATE")
    .length;

  const withoutFp: Omit<LifecycleTransition, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCL_2_ID,
    capability: LIFECYCLE_TRANSITION_CAPABILITY,
    version: LIFECYCLE_TRANSITION_VERSION,
    baselineTag: ESCL1_CUSTOMER_LIFECYCLE_STATE_BASELINE,
    parentPack: ESCL_1_ID,
    parentVersion: CUSTOMER_LIFECYCLE_STATE_VERSION,
    parentBaseline: ESCE_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    holdCount,
    advanceCount,
    reviewCount,
    escalateCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    customerLifecycleStateFingerprint: state.fingerprint,
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

/** Build LifecycleTransition from CustomerLifecycleState. */
export function buildLifecycleTransition(
  state?: CustomerLifecycleState,
): LifecycleTransition {
  const source = state ?? getCustomerLifecycleState();
  const out = deriveFromState(source);
  cached = cloneTransition(out);
  return cloneTransition(cached);
}

export function getLifecycleTransition(): LifecycleTransition {
  if (!cached) {
    return buildLifecycleTransition();
  }
  return cloneTransition(cached);
}

export function lifecycleTransitionFingerprint(
  row?: LifecycleTransition,
): string {
  const v = row ?? getLifecycleTransition();
  return v.fingerprint;
}

export function clearLifecycleTransition(): void {
  cached = null;
}

export function ensureStateThenBuildLifecycleTransition(): LifecycleTransition {
  buildCustomerLifecycleState();
  clearLifecycleTransition();
  return buildLifecycleTransition();
}
