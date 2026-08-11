/**
 * ESCL-3 — Lifecycle Action
 * Deterministic LifecycleAction from ESCL-1 state + ESCL-2 transition.
 * Baseline: escl2-lifecycle-transition-v1.
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
  getCustomerLifecycleState,
  type CustomerLifecycleStateLevel,
} from "./customer-lifecycle-state";
import {
  ESCL1_CUSTOMER_LIFECYCLE_STATE_BASELINE,
  ESCL_2_ID,
  LIFECYCLE_TRANSITION_VERSION,
  buildLifecycleTransition,
  getLifecycleTransition,
  type LifecycleTransition,
  type LifecycleTransitionKind,
  type LifecycleTransitionRecord,
} from "./lifecycle-transition";

export const ESCL_3_ID = "ESCL-3" as const;
export const LIFECYCLE_ACTION_CAPABILITY = "LifecycleAction" as const;
export const LIFECYCLE_ACTION_VERSION = "escl-3-lifecycle-action-1" as const;
export const ESCL2_LIFECYCLE_TRANSITION_BASELINE =
  "escl2-lifecycle-transition-v1" as const;

export const LIFECYCLE_ACTIONS = [
  "RETAIN",
  "PROMOTE",
  "MONITOR",
  "INTERVENE",
] as const;
export type LifecycleActionKind = (typeof LIFECYCLE_ACTIONS)[number];

export type LifecycleActionRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: CustomerLifecycleStateLevel;
  toState: CustomerLifecycleStateLevel;
  transition: LifecycleTransitionKind;
  commercialAction: CommercialAction;
  action: LifecycleActionKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type LifecycleAction = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCL_3_ID;
  capability: typeof LIFECYCLE_ACTION_CAPABILITY;
  version: typeof LIFECYCLE_ACTION_VERSION;
  baselineTag: typeof ESCL2_LIFECYCLE_TRANSITION_BASELINE;
  parentPack: typeof ESCL_2_ID;
  parentVersion: typeof LIFECYCLE_TRANSITION_VERSION;
  parentBaseline: typeof ESCL1_CUSTOMER_LIFECYCLE_STATE_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly LifecycleActionRecord[];
  recordCount: number;
  retainCount: number;
  promoteCount: number;
  monitorCount: number;
  interveneCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  lifecycleTransitionFingerprint: string;
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

let cached: LifecycleAction | null = null;

function cloneAction(row: LifecycleAction): LifecycleAction {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<LifecycleAction, "fingerprint">): string {
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
    retainCount: row.retainCount,
    promoteCount: row.promoteCount,
    monitorCount: row.monitorCount,
    interveneCount: row.interveneCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    lifecycleTransitionFingerprint: row.lifecycleTransitionFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<LifecycleAction, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<LifecycleActionRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        toState: row.toState,
        transition: row.transition,
        commercialAction: row.commercialAction,
        action: row.action,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map transition kind to a read-only lifecycle action. */
export function lifecycleActionFromTransition(
  transition: LifecycleTransitionKind,
): { action: LifecycleActionKind; reason: string } {
  if (transition === "ESCALATE") {
    return { action: "INTERVENE", reason: "intervene-from-escalate" };
  }
  if (transition === "REVIEW") {
    return { action: "MONITOR", reason: "monitor-from-review" };
  }
  if (transition === "ADVANCE") {
    return { action: "PROMOTE", reason: "promote-from-advance" };
  }
  return { action: "RETAIN", reason: "retain-from-hold" };
}

function projectRecord(rec: LifecycleTransitionRecord): LifecycleActionRecord {
  const mapped = lifecycleActionFromTransition(rec.transition);
  const withoutFp: Omit<LifecycleActionRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.fromState,
    toState: rec.toState,
    transition: rec.transition,
    commercialAction: rec.action,
    action: mapped.action,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromTransition(transition: LifecycleTransition): LifecycleAction {
  const stateById = new Map(
    getCustomerLifecycleState().records.map((r) => [r.customerId, r] as const),
  );
  const records = transition.records.map((rec) => {
    const projected = projectRecord(rec);
    const sourceState = stateById.get(rec.customerId);
    if (!sourceState || sourceState.state === projected.fromState) {
      return projected;
    }
    const withoutFp: Omit<LifecycleActionRecord, "fingerprint"> = {
      customerId: projected.customerId,
      tenantId: projected.tenantId,
      fromState: sourceState.state,
      toState: projected.toState,
      transition: projected.transition,
      commercialAction: projected.commercialAction,
      action: projected.action,
      reason: projected.reason,
      ordinal: projected.ordinal,
    };
    return { ...withoutFp, fingerprint: recordFingerprint(withoutFp) };
  });
  const retainCount = records.filter((r) => r.action === "RETAIN").length;
  const promoteCount = records.filter((r) => r.action === "PROMOTE").length;
  const monitorCount = records.filter((r) => r.action === "MONITOR").length;
  const interveneCount = records.filter((r) => r.action === "INTERVENE").length;

  const withoutFp: Omit<LifecycleAction, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCL_3_ID,
    capability: LIFECYCLE_ACTION_CAPABILITY,
    version: LIFECYCLE_ACTION_VERSION,
    baselineTag: ESCL2_LIFECYCLE_TRANSITION_BASELINE,
    parentPack: ESCL_2_ID,
    parentVersion: LIFECYCLE_TRANSITION_VERSION,
    parentBaseline: ESCL1_CUSTOMER_LIFECYCLE_STATE_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    retainCount,
    promoteCount,
    monitorCount,
    interveneCount,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    lifecycleTransitionFingerprint: transition.fingerprint,
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

/** Build LifecycleAction from LifecycleTransition (+ ESCL-1 state). */
export function buildLifecycleAction(
  transition?: LifecycleTransition,
): LifecycleAction {
  const source = transition ?? getLifecycleTransition();
  const out = deriveFromTransition(source);
  cached = cloneAction(out);
  return cloneAction(cached);
}

export function getLifecycleAction(): LifecycleAction {
  if (!cached) {
    return buildLifecycleAction();
  }
  return cloneAction(cached);
}

export function lifecycleActionFingerprint(row?: LifecycleAction): string {
  const v = row ?? getLifecycleAction();
  return v.fingerprint;
}

export function clearLifecycleAction(): void {
  cached = null;
}

export function ensureTransitionThenBuildLifecycleAction(): LifecycleAction {
  buildLifecycleTransition();
  clearLifecycleAction();
  return buildLifecycleAction();
}
