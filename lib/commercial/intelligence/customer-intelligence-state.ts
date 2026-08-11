/**
 * ESCI-1 — Customer Intelligence State
 * Deterministic CustomerIntelligenceState from existing ESCS / ESCR / ESXP / ESRN / ESCA outputs.
 * Baseline: enterprise-saas-customer-advocacy-operations-v1.
 * Read-only — no persistence / runtime side effects / CRM / marketing / contract / payment / billing / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1,
  ESCA2_ADVOCACY_READINESS_BASELINE,
  ESCA_FREEZE_ID,
  ESCA_FREEZE_VERSION,
  getAdvocacyState,
  getEscaFreeze,
  type AdvocacyState,
  type AdvocacyStateLevel,
} from "../advocacy";
import {
  getCustomerSuccessState,
  type CustomerSuccessStateLevel,
} from "../customer-success";
import {
  getExpansionState,
  type ExpansionStateLevel,
} from "../expansion";
import {
  getRenewalState,
  type RenewalStateLevel,
} from "../renewal";
import {
  getRetentionState,
  type RetentionStateLevel,
} from "../retention";
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

export const ESCI_1_ID = "ESCI-1" as const;
export const CUSTOMER_INTELLIGENCE_STATE_CAPABILITY =
  "CustomerIntelligenceState" as const;
export const CUSTOMER_INTELLIGENCE_STATE_VERSION =
  "esci-1-customer-intelligence-state-1" as const;
export const ESCA_V1_BASELINE =
  ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1;

export const CUSTOMER_INTELLIGENCE_STATES = [
  "WATCH",
  "STABLE",
  "GROWING",
  "RISK",
] as const;
export type CustomerIntelligenceStateLevel =
  (typeof CUSTOMER_INTELLIGENCE_STATES)[number];

export type CustomerIntelligenceStateRecord = Readonly<{
  customerId: string;
  tenantId: string;
  state: CustomerIntelligenceStateLevel;
  successState: CustomerSuccessStateLevel;
  retentionState: RetentionStateLevel;
  expansionState: ExpansionStateLevel;
  renewalState: RenewalStateLevel;
  advocacyState: AdvocacyStateLevel;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CustomerIntelligenceState = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCI_1_ID;
  capability: typeof CUSTOMER_INTELLIGENCE_STATE_CAPABILITY;
  version: typeof CUSTOMER_INTELLIGENCE_STATE_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1;
  escaBaseline: typeof ESCA_V1_BASELINE;
  parentPack: typeof ESCA_FREEZE_ID;
  parentVersion: typeof ESCA_FREEZE_VERSION;
  parentBaseline: typeof ESCA2_ADVOCACY_READINESS_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CustomerIntelligenceStateRecord[];
  recordCount: number;
  watchCount: number;
  stableCount: number;
  growingCount: number;
  riskCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  advocacyStateFingerprint: string;
  escaFreezeFingerprint: string;
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

let cached: CustomerIntelligenceState | null = null;

function cloneState(row: CustomerIntelligenceState): CustomerIntelligenceState {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CustomerIntelligenceState, "fingerprint">,
): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    escaBaseline: row.escaBaseline,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    records: row.records,
    recordCount: row.recordCount,
    watchCount: row.watchCount,
    stableCount: row.stableCount,
    growingCount: row.growingCount,
    riskCount: row.riskCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    advocacyStateFingerprint: row.advocacyStateFingerprint,
    escaFreezeFingerprint: row.escaFreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerIntelligenceState, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CustomerIntelligenceStateRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        state: row.state,
        successState: row.successState,
        retentionState: row.retentionState,
        expansionState: row.expansionState,
        renewalState: row.renewalState,
        advocacyState: row.advocacyState,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map ESCS / ESCR / ESXP / ESRN / ESCA states to a read-only intelligence state. */
export function customerIntelligenceStateFromSignals(input: {
  successState: CustomerSuccessStateLevel;
  retentionState: RetentionStateLevel;
  expansionState: ExpansionStateLevel;
  renewalState: RenewalStateLevel;
  advocacyState: AdvocacyStateLevel;
}): { state: CustomerIntelligenceStateLevel; reason: string } {
  if (
    input.successState === "RISK" ||
    input.retentionState === "RISK" ||
    input.expansionState === "BLOCKED" ||
    input.renewalState === "BLOCKED" ||
    input.advocacyState === "BLOCKED"
  ) {
    return { state: "RISK", reason: "risk-from-commercial-stack" };
  }
  if (
    input.successState === "GROWING" ||
    input.retentionState === "EXPAND" ||
    input.expansionState === "EXPANDING" ||
    input.renewalState === "RENEWING" ||
    input.advocacyState === "ADVOCATING"
  ) {
    return { state: "GROWING", reason: "growing-from-commercial-stack" };
  }
  if (
    input.successState === "HEALTHY" ||
    input.retentionState === "SECURE" ||
    input.expansionState === "READY" ||
    input.renewalState === "READY" ||
    input.advocacyState === "READY"
  ) {
    return { state: "STABLE", reason: "stable-from-commercial-stack" };
  }
  return { state: "WATCH", reason: "watch-from-commercial-stack" };
}

function projectRecord(
  rec: AdvocacyState["records"][number],
  successState: CustomerSuccessStateLevel,
  retentionState: RetentionStateLevel,
  expansionState: ExpansionStateLevel,
  renewalState: RenewalStateLevel,
): CustomerIntelligenceStateRecord {
  const mapped = customerIntelligenceStateFromSignals({
    successState,
    retentionState,
    expansionState,
    renewalState,
    advocacyState: rec.state,
  });
  const withoutFp: Omit<CustomerIntelligenceStateRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    state: mapped.state,
    successState,
    retentionState,
    expansionState,
    renewalState,
    advocacyState: rec.state,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromAdvocacy(advocacy: AdvocacyState): CustomerIntelligenceState {
  const freeze = getEscaFreeze();
  const successById = new Map(
    getCustomerSuccessState().records.map((r) => [r.customerId, r.state] as const),
  );
  const retentionById = new Map(
    getRetentionState().records.map((r) => [r.customerId, r.state] as const),
  );
  const expansionById = new Map(
    getExpansionState().records.map((r) => [r.customerId, r.state] as const),
  );
  const renewalById = new Map(
    getRenewalState().records.map((r) => [r.customerId, r.state] as const),
  );
  const records = advocacy.records.map((rec) =>
    projectRecord(
      rec,
      successById.get(rec.customerId) ?? "HEALTHY",
      retentionById.get(rec.customerId) ?? "SECURE",
      expansionById.get(rec.customerId) ?? "READY",
      renewalById.get(rec.customerId) ?? "READY",
    ),
  );

  const withoutFp: Omit<CustomerIntelligenceState, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCI_1_ID,
    capability: CUSTOMER_INTELLIGENCE_STATE_CAPABILITY,
    version: CUSTOMER_INTELLIGENCE_STATE_VERSION,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1,
    escaBaseline: ESCA_V1_BASELINE,
    parentPack: ESCA_FREEZE_ID,
    parentVersion: ESCA_FREEZE_VERSION,
    parentBaseline: ESCA2_ADVOCACY_READINESS_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    watchCount: records.filter((r) => r.state === "WATCH").length,
    stableCount: records.filter((r) => r.state === "STABLE").length,
    growingCount: records.filter((r) => r.state === "GROWING").length,
    riskCount: records.filter((r) => r.state === "RISK").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    advocacyStateFingerprint: advocacy.fingerprint,
    escaFreezeFingerprint: freeze.fingerprint,
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

export function buildCustomerIntelligenceState(
  advocacy?: AdvocacyState,
): CustomerIntelligenceState {
  const source = advocacy ?? getAdvocacyState();
  const out = deriveFromAdvocacy(source);
  cached = cloneState(out);
  return cloneState(cached);
}

export function getCustomerIntelligenceState(): CustomerIntelligenceState {
  if (!cached) {
    return buildCustomerIntelligenceState();
  }
  return cloneState(cached);
}

export function customerIntelligenceStateFingerprint(
  row?: CustomerIntelligenceState,
): string {
  const v = row ?? getCustomerIntelligenceState();
  return v.fingerprint;
}

export function clearCustomerIntelligenceState(): void {
  cached = null;
}
