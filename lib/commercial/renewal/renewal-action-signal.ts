/**
 * ESRN-3 — Renewal Action Signal
 * Deterministic RenewalActionSignal from ESRN-1 RenewalState + ESRN-2 RenewalReadiness.
 * Baseline: esrn-2-renewal-readiness-1.
 * Read-only — no persistence / runtime side effects / CRM / billing / contract / payment / frozen-layer mutation.
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
  ESRN1_RENEWAL_STATE_BASELINE,
  ESRN_2_ID,
  RENEWAL_READINESS_VERSION,
  buildRenewalReadiness,
  getRenewalReadiness,
  type RenewalReadiness,
  type RenewalReadinessKind,
  type RenewalReadinessRecord,
} from "./renewal-readiness";
import {
  getRenewalState,
  type RenewalStateLevel,
} from "./renewal-state";

export const ESRN_3_ID = "ESRN-3" as const;
export const RENEWAL_ACTION_SIGNAL_CAPABILITY =
  "RenewalActionSignal" as const;
export const RENEWAL_ACTION_SIGNAL_VERSION =
  "esrn-3-renewal-action-signal-1" as const;
export const ESRN2_RENEWAL_READINESS_BASELINE =
  "esrn2-renewal-readiness-v1" as const;

export const RENEWAL_ACTION_SIGNALS = [
  "HOLD",
  "WATCH",
  "PREPARE",
  "RENEW",
] as const;
export type RenewalActionSignalKind =
  (typeof RENEWAL_ACTION_SIGNALS)[number];

export type RenewalActionSignalRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: RenewalStateLevel;
  readiness: RenewalReadinessKind;
  action: RenewalActionSignalKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type RenewalActionSignal = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESRN_3_ID;
  capability: typeof RENEWAL_ACTION_SIGNAL_CAPABILITY;
  version: typeof RENEWAL_ACTION_SIGNAL_VERSION;
  baselineTag: typeof ESRN2_RENEWAL_READINESS_BASELINE;
  parentPack: typeof ESRN_2_ID;
  parentVersion: typeof RENEWAL_READINESS_VERSION;
  parentBaseline: typeof ESRN1_RENEWAL_STATE_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly RenewalActionSignalRecord[];
  recordCount: number;
  holdCount: number;
  watchCount: number;
  prepareCount: number;
  renewCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  renewalReadinessFingerprint: string;
  renewalStateFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noBillingPlatform: true;
    noContractExecution: true;
    noPaymentExecution: true;
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

let cached: RenewalActionSignal | null = null;

function cloneSignal(row: RenewalActionSignal): RenewalActionSignal {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<RenewalActionSignal, "fingerprint">,
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
    holdCount: row.holdCount,
    watchCount: row.watchCount,
    prepareCount: row.prepareCount,
    renewCount: row.renewCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    renewalReadinessFingerprint: row.renewalReadinessFingerprint,
    renewalStateFingerprint: row.renewalStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<RenewalActionSignal, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<RenewalActionSignalRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        readiness: row.readiness,
        action: row.action,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map renewal state + readiness to a read-only action signal. */
export function renewalActionSignalFromSignals(input: {
  state: RenewalStateLevel;
  readiness: RenewalReadinessKind;
}): { action: RenewalActionSignalKind; reason: string } {
  if (input.state === "BLOCKED" || input.readiness === "NONE") {
    return { action: "HOLD", reason: "hold-from-blocked" };
  }
  if (input.state === "RENEWING" || input.readiness === "ACTIVE") {
    return { action: "RENEW", reason: "renew-from-active" };
  }
  if (input.state === "READY" || input.readiness === "ELIGIBLE") {
    return { action: "PREPARE", reason: "prepare-from-eligible" };
  }
  return { action: "WATCH", reason: "watch-from-not-ready" };
}

function projectRecord(
  rec: RenewalReadinessRecord,
  state: RenewalStateLevel,
): RenewalActionSignalRecord {
  const mapped = renewalActionSignalFromSignals({
    state,
    readiness: rec.readiness,
  });
  const withoutFp: Omit<RenewalActionSignalRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: state,
    readiness: rec.readiness,
    action: mapped.action,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromReadiness(
  readiness: RenewalReadiness,
): RenewalActionSignal {
  const statePack = getRenewalState();
  const stateById = new Map(
    statePack.records.map((r) => [r.customerId, r.state] as const),
  );
  const records = readiness.records.map((rec) =>
    projectRecord(rec, stateById.get(rec.customerId) ?? rec.fromState),
  );

  const withoutFp: Omit<RenewalActionSignal, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESRN_3_ID,
    capability: RENEWAL_ACTION_SIGNAL_CAPABILITY,
    version: RENEWAL_ACTION_SIGNAL_VERSION,
    baselineTag: ESRN2_RENEWAL_READINESS_BASELINE,
    parentPack: ESRN_2_ID,
    parentVersion: RENEWAL_READINESS_VERSION,
    parentBaseline: ESRN1_RENEWAL_STATE_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    holdCount: records.filter((r) => r.action === "HOLD").length,
    watchCount: records.filter((r) => r.action === "WATCH").length,
    prepareCount: records.filter((r) => r.action === "PREPARE").length,
    renewCount: records.filter((r) => r.action === "RENEW").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    renewalReadinessFingerprint: readiness.fingerprint,
    renewalStateFingerprint: statePack.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noBillingPlatform: true,
      noContractExecution: true,
      noPaymentExecution: true,
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

export function buildRenewalActionSignal(
  readiness?: RenewalReadiness,
): RenewalActionSignal {
  const source = readiness ?? getRenewalReadiness();
  const out = deriveFromReadiness(source);
  cached = cloneSignal(out);
  return cloneSignal(cached);
}

export function getRenewalActionSignal(): RenewalActionSignal {
  if (!cached) {
    return buildRenewalActionSignal();
  }
  return cloneSignal(cached);
}

export function renewalActionSignalFingerprint(
  row?: RenewalActionSignal,
): string {
  const v = row ?? getRenewalActionSignal();
  return v.fingerprint;
}

export function clearRenewalActionSignal(): void {
  cached = null;
}

export function ensureReadinessThenBuildRenewalActionSignal(): RenewalActionSignal {
  buildRenewalReadiness();
  clearRenewalActionSignal();
  return buildRenewalActionSignal();
}
