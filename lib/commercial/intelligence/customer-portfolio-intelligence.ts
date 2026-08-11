/**
 * ESCI-3 — Customer Portfolio Intelligence
 * Deterministic portfolio rollup from ESCI-1 CustomerIntelligenceState + ESCI-2 IntelligenceSignal.
 * Baseline: esci-2-intelligence-signal-1.
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
  ESCI1_CUSTOMER_INTELLIGENCE_STATE_BASELINE,
  ESCI_2_ID,
  INTELLIGENCE_SIGNAL_VERSION,
  buildIntelligenceSignal,
  getIntelligenceSignal,
  type IntelligenceSignal,
  type IntelligenceSignalKind,
  type IntelligenceSignalRecord,
} from "./intelligence-signal";
import {
  getCustomerIntelligenceState,
  type CustomerIntelligenceStateLevel,
} from "./customer-intelligence-state";

export const ESCI_3_ID = "ESCI-3" as const;
export const CUSTOMER_PORTFOLIO_INTELLIGENCE_CAPABILITY =
  "CustomerPortfolioIntelligence" as const;
export const CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION =
  "esci-3-customer-portfolio-intelligence-1" as const;
export const ESCI2_INTELLIGENCE_SIGNAL_BASELINE =
  "esci2-intelligence-signal-v1" as const;

export type CustomerPortfolioIntelligenceRecord = Readonly<{
  customerId: string;
  tenantId: string;
  intelligenceState: CustomerIntelligenceStateLevel;
  signal: IntelligenceSignalKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CustomerPortfolioIntelligence = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCI_3_ID;
  capability: typeof CUSTOMER_PORTFOLIO_INTELLIGENCE_CAPABILITY;
  version: typeof CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION;
  baselineTag: typeof ESCI2_INTELLIGENCE_SIGNAL_BASELINE;
  parentPack: typeof ESCI_2_ID;
  parentVersion: typeof INTELLIGENCE_SIGNAL_VERSION;
  parentBaseline: typeof ESCI1_CUSTOMER_INTELLIGENCE_STATE_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CustomerPortfolioIntelligenceRecord[];
  recordCount: number;
  portfolioState: CustomerIntelligenceStateLevel;
  portfolioSignal: IntelligenceSignalKind;
  watchCount: number;
  stableCount: number;
  growingCount: number;
  riskCount: number;
  holdCount: number;
  monitorCount: number;
  enableCount: number;
  escalateCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  intelligenceSignalFingerprint: string;
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

let cached: CustomerPortfolioIntelligence | null = null;

function clonePortfolio(
  row: CustomerPortfolioIntelligence,
): CustomerPortfolioIntelligence {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CustomerPortfolioIntelligence, "fingerprint">,
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
    portfolioState: row.portfolioState,
    portfolioSignal: row.portfolioSignal,
    watchCount: row.watchCount,
    stableCount: row.stableCount,
    growingCount: row.growingCount,
    riskCount: row.riskCount,
    holdCount: row.holdCount,
    monitorCount: row.monitorCount,
    enableCount: row.enableCount,
    escalateCount: row.escalateCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    intelligenceSignalFingerprint: row.intelligenceSignalFingerprint,
    customerIntelligenceStateFingerprint:
      row.customerIntelligenceStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerPortfolioIntelligence, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CustomerPortfolioIntelligenceRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        intelligenceState: row.intelligenceState,
        signal: row.signal,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Roll up customer intelligence counts into a portfolio verdict. */
export function portfolioIntelligenceFromCounts(input: {
  riskCount: number;
  growingCount: number;
  stableCount: number;
}): {
  portfolioState: CustomerIntelligenceStateLevel;
  portfolioSignal: IntelligenceSignalKind;
  reason: string;
} {
  if (input.riskCount > 0) {
    return {
      portfolioState: "RISK",
      portfolioSignal: "ESCALATE",
      reason: "portfolio-risk",
    };
  }
  if (input.growingCount > 0) {
    return {
      portfolioState: "GROWING",
      portfolioSignal: "ENABLE",
      reason: "portfolio-growing",
    };
  }
  if (input.stableCount > 0) {
    return {
      portfolioState: "STABLE",
      portfolioSignal: "HOLD",
      reason: "portfolio-stable",
    };
  }
  return {
    portfolioState: "WATCH",
    portfolioSignal: "MONITOR",
    reason: "portfolio-watch",
  };
}

function projectRecord(
  rec: IntelligenceSignalRecord,
  intelligenceState: CustomerIntelligenceStateLevel,
): CustomerPortfolioIntelligenceRecord {
  const withoutFp: Omit<CustomerPortfolioIntelligenceRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    intelligenceState,
    signal: rec.signal,
    reason: rec.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromSignal(
  signal: IntelligenceSignal,
): CustomerPortfolioIntelligence {
  const statePack = getCustomerIntelligenceState();
  const stateById = new Map(
    statePack.records.map((r) => [r.customerId, r.state] as const),
  );
  const records = signal.records.map((rec) =>
    projectRecord(rec, stateById.get(rec.customerId) ?? rec.fromState),
  );
  const riskCount = records.filter((r) => r.intelligenceState === "RISK").length;
  const growingCount = records.filter(
    (r) => r.intelligenceState === "GROWING",
  ).length;
  const stableCount = records.filter(
    (r) => r.intelligenceState === "STABLE",
  ).length;
  const watchCount = records.filter(
    (r) => r.intelligenceState === "WATCH",
  ).length;
  const rolled = portfolioIntelligenceFromCounts({
    riskCount,
    growingCount,
    stableCount,
  });

  const withoutFp: Omit<CustomerPortfolioIntelligence, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCI_3_ID,
    capability: CUSTOMER_PORTFOLIO_INTELLIGENCE_CAPABILITY,
    version: CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION,
    baselineTag: ESCI2_INTELLIGENCE_SIGNAL_BASELINE,
    parentPack: ESCI_2_ID,
    parentVersion: INTELLIGENCE_SIGNAL_VERSION,
    parentBaseline: ESCI1_CUSTOMER_INTELLIGENCE_STATE_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    portfolioState: rolled.portfolioState,
    portfolioSignal: rolled.portfolioSignal,
    watchCount,
    stableCount,
    growingCount,
    riskCount,
    holdCount: records.filter((r) => r.signal === "HOLD").length,
    monitorCount: records.filter((r) => r.signal === "MONITOR").length,
    enableCount: records.filter((r) => r.signal === "ENABLE").length,
    escalateCount: records.filter((r) => r.signal === "ESCALATE").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    intelligenceSignalFingerprint: signal.fingerprint,
    customerIntelligenceStateFingerprint: statePack.fingerprint,
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

export function buildCustomerPortfolioIntelligence(
  signal?: IntelligenceSignal,
): CustomerPortfolioIntelligence {
  const source = signal ?? getIntelligenceSignal();
  const out = deriveFromSignal(source);
  cached = clonePortfolio(out);
  return clonePortfolio(cached);
}

export function getCustomerPortfolioIntelligence(): CustomerPortfolioIntelligence {
  if (!cached) {
    return buildCustomerPortfolioIntelligence();
  }
  return clonePortfolio(cached);
}

export function customerPortfolioIntelligenceFingerprint(
  row?: CustomerPortfolioIntelligence,
): string {
  const v = row ?? getCustomerPortfolioIntelligence();
  return v.fingerprint;
}

export function clearCustomerPortfolioIntelligence(): void {
  cached = null;
}

export function ensureSignalThenBuildCustomerPortfolioIntelligence(): CustomerPortfolioIntelligence {
  buildIntelligenceSignal();
  clearCustomerPortfolioIntelligence();
  return buildCustomerPortfolioIntelligence();
}
