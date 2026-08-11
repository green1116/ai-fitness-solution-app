/**
 * ESCA-1 — Advocacy State
 * Deterministic AdvocacyState from existing ESCL lifecycle + ESRN renewal signals.
 * Baseline: enterprise-saas-renewal-operations-v1.
 * Read-only — no persistence / runtime side effects / CRM / marketing / contract / payment / billing / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  getCustomerLifecycleState,
  type CustomerLifecycleStateLevel,
} from "../lifecycle";
import {
  ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1,
  ESRN2_RENEWAL_READINESS_BASELINE,
  ESRN_FREEZE_ID,
  ESRN_FREEZE_VERSION,
  getEsrnFreeze,
  getRenewalActionSignal,
  type RenewalActionSignal,
  type RenewalActionSignalKind,
  type RenewalActionSignalRecord,
  type RenewalReadinessKind,
  type RenewalStateLevel,
} from "../renewal";
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

export const ESCA_1_ID = "ESCA-1" as const;
export const ADVOCACY_STATE_CAPABILITY = "AdvocacyState" as const;
export const ADVOCACY_STATE_VERSION = "esca-1-advocacy-state-1" as const;
export const ESRN_V1_BASELINE = ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1;

export const ADVOCACY_STATES = [
  "NOT_READY",
  "READY",
  "ADVOCATING",
  "BLOCKED",
] as const;
export type AdvocacyStateLevel = (typeof ADVOCACY_STATES)[number];

export type AdvocacyStateRecord = Readonly<{
  customerId: string;
  tenantId: string;
  state: AdvocacyStateLevel;
  lifecycleState: CustomerLifecycleStateLevel;
  renewalState: RenewalStateLevel;
  readiness: RenewalReadinessKind;
  action: RenewalActionSignalKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type AdvocacyState = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCA_1_ID;
  capability: typeof ADVOCACY_STATE_CAPABILITY;
  version: typeof ADVOCACY_STATE_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1;
  esrnBaseline: typeof ESRN_V1_BASELINE;
  parentPack: typeof ESRN_FREEZE_ID;
  parentVersion: typeof ESRN_FREEZE_VERSION;
  parentBaseline: typeof ESRN2_RENEWAL_READINESS_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly AdvocacyStateRecord[];
  recordCount: number;
  notReadyCount: number;
  readyCount: number;
  advocatingCount: number;
  blockedCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  renewalActionSignalFingerprint: string;
  esrnFreezeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noMarketingExecution: true;
    noBillingPlatform: true;
    noContractExecution: true;
    noPaymentExecution: true;
    noEsrnMutation: true;
    noEsxpMutation: true;
    noEscrMutation: true;
    noEscsMutation: true;
    noEsclMutation: true;
    noEsceMutation: true;
    noDatabase: true;
    noUi: true;
    additiveOnly: true;
    gaBaselineUnchanged: true;
  };
}>;

let cached: AdvocacyState | null = null;

function cloneState(row: AdvocacyState): AdvocacyState {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<AdvocacyState, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    esrnBaseline: row.esrnBaseline,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    records: row.records,
    recordCount: row.recordCount,
    notReadyCount: row.notReadyCount,
    readyCount: row.readyCount,
    advocatingCount: row.advocatingCount,
    blockedCount: row.blockedCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    renewalActionSignalFingerprint: row.renewalActionSignalFingerprint,
    esrnFreezeFingerprint: row.esrnFreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<AdvocacyState, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<AdvocacyStateRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        state: row.state,
        lifecycleState: row.lifecycleState,
        renewalState: row.renewalState,
        readiness: row.readiness,
        action: row.action,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map ESCL / ESRN signals to a read-only advocacy state. */
export function advocacyStateFromSignals(input: {
  lifecycleState: CustomerLifecycleStateLevel;
  renewalState: RenewalStateLevel;
  readiness: RenewalReadinessKind;
  action: RenewalActionSignalKind;
}): { state: AdvocacyStateLevel; reason: string } {
  if (
    input.lifecycleState === "AT_RISK" ||
    input.renewalState === "BLOCKED" ||
    input.readiness === "NONE" ||
    input.action === "HOLD"
  ) {
    return { state: "BLOCKED", reason: "blocked-from-escl-esrn" };
  }
  if (
    input.lifecycleState === "EXPANDING" ||
    input.renewalState === "RENEWING" ||
    input.readiness === "ACTIVE" ||
    input.action === "RENEW"
  ) {
    return { state: "ADVOCATING", reason: "advocating-from-escl-esrn" };
  }
  if (
    input.lifecycleState === "ACTIVE" ||
    input.renewalState === "READY" ||
    input.readiness === "ELIGIBLE" ||
    input.action === "PREPARE"
  ) {
    return { state: "READY", reason: "ready-from-escl-esrn" };
  }
  return { state: "NOT_READY", reason: "not-ready-from-escl-esrn" };
}

function projectRecord(
  rec: RenewalActionSignalRecord,
  lifecycleState: CustomerLifecycleStateLevel,
): AdvocacyStateRecord {
  const mapped = advocacyStateFromSignals({
    lifecycleState,
    renewalState: rec.fromState,
    readiness: rec.readiness,
    action: rec.action,
  });
  const withoutFp: Omit<AdvocacyStateRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    state: mapped.state,
    lifecycleState,
    renewalState: rec.fromState,
    readiness: rec.readiness,
    action: rec.action,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromSignal(signal: RenewalActionSignal): AdvocacyState {
  const freeze = getEsrnFreeze();
  const lifecycle = getCustomerLifecycleState();
  const lifecycleById = new Map(
    lifecycle.records.map((r) => [r.customerId, r.state] as const),
  );
  const records = signal.records.map((rec) =>
    projectRecord(rec, lifecycleById.get(rec.customerId) ?? "ACTIVE"),
  );

  const withoutFp: Omit<AdvocacyState, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCA_1_ID,
    capability: ADVOCACY_STATE_CAPABILITY,
    version: ADVOCACY_STATE_VERSION,
    baselineTag: ENTERPRISE_SAAS_RENEWAL_OPERATIONS_V1,
    esrnBaseline: ESRN_V1_BASELINE,
    parentPack: ESRN_FREEZE_ID,
    parentVersion: ESRN_FREEZE_VERSION,
    parentBaseline: ESRN2_RENEWAL_READINESS_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    notReadyCount: records.filter((r) => r.state === "NOT_READY").length,
    readyCount: records.filter((r) => r.state === "READY").length,
    advocatingCount: records.filter((r) => r.state === "ADVOCATING").length,
    blockedCount: records.filter((r) => r.state === "BLOCKED").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    renewalActionSignalFingerprint: signal.fingerprint,
    esrnFreezeFingerprint: freeze.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noMarketingExecution: true,
      noBillingPlatform: true,
      noContractExecution: true,
      noPaymentExecution: true,
      noEsrnMutation: true,
      noEsxpMutation: true,
      noEscrMutation: true,
      noEscsMutation: true,
      noEsclMutation: true,
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

export function buildAdvocacyState(
  signal?: RenewalActionSignal,
): AdvocacyState {
  const source = signal ?? getRenewalActionSignal();
  const out = deriveFromSignal(source);
  cached = cloneState(out);
  return cloneState(cached);
}

export function getAdvocacyState(): AdvocacyState {
  if (!cached) {
    return buildAdvocacyState();
  }
  return cloneState(cached);
}

export function advocacyStateFingerprint(row?: AdvocacyState): string {
  const v = row ?? getAdvocacyState();
  return v.fingerprint;
}

export function clearAdvocacyState(): void {
  cached = null;
}
