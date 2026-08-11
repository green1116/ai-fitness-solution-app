/**
 * ESCI-2 — Intelligence Signal
 * Deterministic IntelligenceSignal from ESCI-1 CustomerIntelligenceState.
 * Baseline: esci-1-customer-intelligence-state-1.
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
  CUSTOMER_INTELLIGENCE_STATE_VERSION,
  ESCA_V1_BASELINE,
  ESCI_1_ID,
  buildCustomerIntelligenceState,
  getCustomerIntelligenceState,
  type CustomerIntelligenceState,
  type CustomerIntelligenceStateLevel,
  type CustomerIntelligenceStateRecord,
} from "./customer-intelligence-state";

export const ESCI_2_ID = "ESCI-2" as const;
export const INTELLIGENCE_SIGNAL_CAPABILITY = "IntelligenceSignal" as const;
export const INTELLIGENCE_SIGNAL_VERSION =
  "esci-2-intelligence-signal-1" as const;
export const ESCI1_CUSTOMER_INTELLIGENCE_STATE_BASELINE =
  "esci1-customer-intelligence-state-v1" as const;

export const INTELLIGENCE_SIGNALS = [
  "HOLD",
  "MONITOR",
  "ENABLE",
  "ESCALATE",
] as const;
export type IntelligenceSignalKind = (typeof INTELLIGENCE_SIGNALS)[number];

export type IntelligenceSignalRecord = Readonly<{
  customerId: string;
  tenantId: string;
  fromState: CustomerIntelligenceStateLevel;
  signal: IntelligenceSignalKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type IntelligenceSignal = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCI_2_ID;
  capability: typeof INTELLIGENCE_SIGNAL_CAPABILITY;
  version: typeof INTELLIGENCE_SIGNAL_VERSION;
  baselineTag: typeof ESCI1_CUSTOMER_INTELLIGENCE_STATE_BASELINE;
  parentPack: typeof ESCI_1_ID;
  parentVersion: typeof CUSTOMER_INTELLIGENCE_STATE_VERSION;
  parentBaseline: typeof ESCA_V1_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly IntelligenceSignalRecord[];
  recordCount: number;
  holdCount: number;
  monitorCount: number;
  enableCount: number;
  escalateCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  customerIntelligenceStateFingerprint: string;
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
    noEscaMutation: true;
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

let cached: IntelligenceSignal | null = null;

function cloneSignal(row: IntelligenceSignal): IntelligenceSignal {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<IntelligenceSignal, "fingerprint">): string {
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
    monitorCount: row.monitorCount,
    enableCount: row.enableCount,
    escalateCount: row.escalateCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    customerIntelligenceStateFingerprint:
      row.customerIntelligenceStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<IntelligenceSignal, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<IntelligenceSignalRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        fromState: row.fromState,
        signal: row.signal,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map customer intelligence state to a read-only operational signal. */
export function intelligenceSignalFromState(
  state: CustomerIntelligenceStateLevel,
): { signal: IntelligenceSignalKind; reason: string } {
  if (state === "RISK") {
    return { signal: "ESCALATE", reason: "escalate-from-risk" };
  }
  if (state === "GROWING") {
    return { signal: "ENABLE", reason: "enable-from-growing" };
  }
  if (state === "STABLE") {
    return { signal: "HOLD", reason: "hold-from-stable" };
  }
  return { signal: "MONITOR", reason: "monitor-from-watch" };
}

function projectRecord(
  rec: CustomerIntelligenceStateRecord,
): IntelligenceSignalRecord {
  const mapped = intelligenceSignalFromState(rec.state);
  const withoutFp: Omit<IntelligenceSignalRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    fromState: rec.state,
    signal: mapped.signal,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromState(state: CustomerIntelligenceState): IntelligenceSignal {
  const records = state.records.map(projectRecord);
  const withoutFp: Omit<IntelligenceSignal, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCI_2_ID,
    capability: INTELLIGENCE_SIGNAL_CAPABILITY,
    version: INTELLIGENCE_SIGNAL_VERSION,
    baselineTag: ESCI1_CUSTOMER_INTELLIGENCE_STATE_BASELINE,
    parentPack: ESCI_1_ID,
    parentVersion: CUSTOMER_INTELLIGENCE_STATE_VERSION,
    parentBaseline: ESCA_V1_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    holdCount: records.filter((r) => r.signal === "HOLD").length,
    monitorCount: records.filter((r) => r.signal === "MONITOR").length,
    enableCount: records.filter((r) => r.signal === "ENABLE").length,
    escalateCount: records.filter((r) => r.signal === "ESCALATE").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    customerIntelligenceStateFingerprint: state.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noMarketingExecution: true,
      noBillingPlatform: true,
      noContractExecution: true,
      noPaymentExecution: true,
      noEscaMutation: true,
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

export function buildIntelligenceSignal(
  state?: CustomerIntelligenceState,
): IntelligenceSignal {
  const source = state ?? getCustomerIntelligenceState();
  const out = deriveFromState(source);
  cached = cloneSignal(out);
  return cloneSignal(cached);
}

export function getIntelligenceSignal(): IntelligenceSignal {
  if (!cached) {
    return buildIntelligenceSignal();
  }
  return cloneSignal(cached);
}

export function intelligenceSignalFingerprint(
  row?: IntelligenceSignal,
): string {
  const v = row ?? getIntelligenceSignal();
  return v.fingerprint;
}

export function clearIntelligenceSignal(): void {
  cached = null;
}

export function ensureStateThenBuildIntelligenceSignal(): IntelligenceSignal {
  buildCustomerIntelligenceState();
  clearIntelligenceSignal();
  return buildIntelligenceSignal();
}
