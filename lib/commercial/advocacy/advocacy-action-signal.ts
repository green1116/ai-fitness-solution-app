/**
 * ESCA-3 — Advocacy Action Signal
 * Deterministic AdvocacyActionSignal from ESCA-1 AdvocacyState + ESCA-2 AdvocacyReadiness.
 * Baseline: esca-2-advocacy-readiness-1.
 * Read-only — no persistence / runtime side effects / CRM / marketing / contract / payment / billing / frozen-layer mutation.
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
  ESCA1_ADVOCACY_STATE_BASELINE,
  ESCA_2_ID,
  ADVOCACY_READINESS_VERSION,
  buildAdvocacyReadiness,
  getAdvocacyReadiness,
  type AdvocacyReadiness,
  type AdvocacyReadinessKind,
  type AdvocacyReadinessRecord,
} from "./advocacy-readiness";
import {
  getAdvocacyState,
  type AdvocacyStateLevel,
} from "./advocacy-state";

export const ESCA_3_ID = "ESCA-3" as const;
export const ADVOCACY_ACTION_SIGNAL_CAPABILITY =
  "AdvocacyActionSignal" as const;
export const ADVOCACY_ACTION_SIGNAL_VERSION =
  "esca-3-advocacy-action-signal-1" as const;
export const ESCA2_ADVOCACY_READINESS_BASELINE =
  "esca2-advocacy-readiness-v1" as const;

export const ADVOCACY_ACTION_SIGNALS = [
  "HOLD",
  "WATCH",
  "PREPARE",
  "ADVOCATE",
] as const;
export type AdvocacyActionSignalKind =
  (typeof ADVOCACY_ACTION_SIGNALS)[number];

export type AdvocacyActionSignalRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: AdvocacyStateLevel;
  readiness: AdvocacyReadinessKind;
  action: AdvocacyActionSignalKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type AdvocacyActionSignal = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCA_3_ID;
  capability: typeof ADVOCACY_ACTION_SIGNAL_CAPABILITY;
  version: typeof ADVOCACY_ACTION_SIGNAL_VERSION;
  baselineTag: typeof ESCA2_ADVOCACY_READINESS_BASELINE;
  parentPack: typeof ESCA_2_ID;
  parentVersion: typeof ADVOCACY_READINESS_VERSION;
  parentBaseline: typeof ESCA1_ADVOCACY_STATE_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly AdvocacyActionSignalRecord[];
  recordCount: number;
  holdCount: number;
  watchCount: number;
  prepareCount: number;
  advocateCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  advocacyReadinessFingerprint: string;
  advocacyStateFingerprint: string;
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

let cached: AdvocacyActionSignal | null = null;

function cloneSignal(row: AdvocacyActionSignal): AdvocacyActionSignal {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<AdvocacyActionSignal, "fingerprint">,
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
    advocateCount: row.advocateCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    advocacyReadinessFingerprint: row.advocacyReadinessFingerprint,
    advocacyStateFingerprint: row.advocacyStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<AdvocacyActionSignal, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<AdvocacyActionSignalRecord, "fingerprint">,
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

/** Map advocacy state + readiness to a read-only action signal. */
export function advocacyActionSignalFromSignals(input: {
  state: AdvocacyStateLevel;
  readiness: AdvocacyReadinessKind;
}): { action: AdvocacyActionSignalKind; reason: string } {
  if (input.state === "BLOCKED" || input.readiness === "NONE") {
    return { action: "HOLD", reason: "hold-from-blocked" };
  }
  if (input.state === "ADVOCATING" || input.readiness === "ACTIVE") {
    return { action: "ADVOCATE", reason: "advocate-from-active" };
  }
  if (input.state === "READY" || input.readiness === "ELIGIBLE") {
    return { action: "PREPARE", reason: "prepare-from-eligible" };
  }
  return { action: "WATCH", reason: "watch-from-not-ready" };
}

function projectRecord(
  rec: AdvocacyReadinessRecord,
  state: AdvocacyStateLevel,
): AdvocacyActionSignalRecord {
  const mapped = advocacyActionSignalFromSignals({
    state,
    readiness: rec.readiness,
  });
  const withoutFp: Omit<AdvocacyActionSignalRecord, "fingerprint"> = {
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
  readiness: AdvocacyReadiness,
): AdvocacyActionSignal {
  const statePack = getAdvocacyState();
  const stateById = new Map(
    statePack.records.map((r) => [r.customerId, r.state] as const),
  );
  const records = readiness.records.map((rec) =>
    projectRecord(rec, stateById.get(rec.customerId) ?? rec.fromState),
  );

  const withoutFp: Omit<AdvocacyActionSignal, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCA_3_ID,
    capability: ADVOCACY_ACTION_SIGNAL_CAPABILITY,
    version: ADVOCACY_ACTION_SIGNAL_VERSION,
    baselineTag: ESCA2_ADVOCACY_READINESS_BASELINE,
    parentPack: ESCA_2_ID,
    parentVersion: ADVOCACY_READINESS_VERSION,
    parentBaseline: ESCA1_ADVOCACY_STATE_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    holdCount: records.filter((r) => r.action === "HOLD").length,
    watchCount: records.filter((r) => r.action === "WATCH").length,
    prepareCount: records.filter((r) => r.action === "PREPARE").length,
    advocateCount: records.filter((r) => r.action === "ADVOCATE").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    advocacyReadinessFingerprint: readiness.fingerprint,
    advocacyStateFingerprint: statePack.fingerprint,
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

export function buildAdvocacyActionSignal(
  readiness?: AdvocacyReadiness,
): AdvocacyActionSignal {
  const source = readiness ?? getAdvocacyReadiness();
  const out = deriveFromReadiness(source);
  cached = cloneSignal(out);
  return cloneSignal(cached);
}

export function getAdvocacyActionSignal(): AdvocacyActionSignal {
  if (!cached) {
    return buildAdvocacyActionSignal();
  }
  return cloneSignal(cached);
}

export function advocacyActionSignalFingerprint(
  row?: AdvocacyActionSignal,
): string {
  const v = row ?? getAdvocacyActionSignal();
  return v.fingerprint;
}

export function clearAdvocacyActionSignal(): void {
  cached = null;
}

export function ensureReadinessThenBuildAdvocacyActionSignal(): AdvocacyActionSignal {
  buildAdvocacyReadiness();
  clearAdvocacyActionSignal();
  return buildAdvocacyActionSignal();
}
