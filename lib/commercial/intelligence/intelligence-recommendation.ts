/**
 * ESCI-4 — Intelligence Recommendation
 * Deterministic recommendations from ESCI-1/2/3 (state + signal + portfolio).
 * Baseline: esci-3-customer-portfolio-intelligence-1.
 * Recommendation only — no execution / persistence / runtime side effects / CRM / billing / frozen-layer mutation.
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
  ESCI2_INTELLIGENCE_SIGNAL_BASELINE,
  ESCI_3_ID,
  CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION,
  buildCustomerPortfolioIntelligence,
  getCustomerPortfolioIntelligence,
  type CustomerPortfolioIntelligence,
  type CustomerPortfolioIntelligenceRecord,
} from "./customer-portfolio-intelligence";
import type { IntelligenceSignalKind } from "./intelligence-signal";
import type { CustomerIntelligenceStateLevel } from "./customer-intelligence-state";

export const ESCI_4_ID = "ESCI-4" as const;
export const INTELLIGENCE_RECOMMENDATION_CAPABILITY =
  "IntelligenceRecommendation" as const;
export const INTELLIGENCE_RECOMMENDATION_VERSION =
  "esci-4-intelligence-recommendation-1" as const;
export const ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE =
  "esci3-customer-portfolio-intelligence-v1" as const;

export const INTELLIGENCE_RECOMMENDATIONS = [
  "DEFER",
  "OBSERVE",
  "ADVANCE",
  "REMEDIATE",
] as const;
export type IntelligenceRecommendationKind =
  (typeof INTELLIGENCE_RECOMMENDATIONS)[number];

export type IntelligenceRecommendationRecord = Readonly<{
  customerId: string;
  tenantId: string;
  intelligenceState: CustomerIntelligenceStateLevel;
  signal: IntelligenceSignalKind;
  recommendation: IntelligenceRecommendationKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type IntelligenceRecommendation = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCI_4_ID;
  capability: typeof INTELLIGENCE_RECOMMENDATION_CAPABILITY;
  version: typeof INTELLIGENCE_RECOMMENDATION_VERSION;
  baselineTag: typeof ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE;
  parentPack: typeof ESCI_3_ID;
  parentVersion: typeof CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION;
  parentBaseline: typeof ESCI2_INTELLIGENCE_SIGNAL_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly IntelligenceRecommendationRecord[];
  recordCount: number;
  portfolioRecommendation: IntelligenceRecommendationKind;
  deferCount: number;
  observeCount: number;
  advanceCount: number;
  remediateCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  customerPortfolioIntelligenceFingerprint: string;
  intelligenceSignalFingerprint: string;
  customerIntelligenceStateFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    recommendationOnly: true;
    noExecution: true;
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

let cached: IntelligenceRecommendation | null = null;

function cloneRecommendation(
  row: IntelligenceRecommendation,
): IntelligenceRecommendation {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<IntelligenceRecommendation, "fingerprint">,
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
    portfolioRecommendation: row.portfolioRecommendation,
    deferCount: row.deferCount,
    observeCount: row.observeCount,
    advanceCount: row.advanceCount,
    remediateCount: row.remediateCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    customerPortfolioIntelligenceFingerprint:
      row.customerPortfolioIntelligenceFingerprint,
    intelligenceSignalFingerprint: row.intelligenceSignalFingerprint,
    customerIntelligenceStateFingerprint:
      row.customerIntelligenceStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<IntelligenceRecommendation, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<IntelligenceRecommendationRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId: row.customerId,
        tenantId: row.tenantId,
        intelligenceState: row.intelligenceState,
        signal: row.signal,
        recommendation: row.recommendation,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

/** Map intelligence state + signal to a read-only recommendation. */
export function intelligenceRecommendationFromSignals(input: {
  state: CustomerIntelligenceStateLevel;
  signal: IntelligenceSignalKind;
}): { recommendation: IntelligenceRecommendationKind; reason: string } {
  if (input.state === "RISK" || input.signal === "ESCALATE") {
    return { recommendation: "REMEDIATE", reason: "remediate-from-risk" };
  }
  if (input.state === "GROWING" || input.signal === "ENABLE") {
    return { recommendation: "ADVANCE", reason: "advance-from-growing" };
  }
  if (input.state === "STABLE" || input.signal === "HOLD") {
    return { recommendation: "DEFER", reason: "defer-from-stable" };
  }
  return { recommendation: "OBSERVE", reason: "observe-from-watch" };
}

function projectRecord(
  rec: CustomerPortfolioIntelligenceRecord,
): IntelligenceRecommendationRecord {
  const mapped = intelligenceRecommendationFromSignals({
    state: rec.intelligenceState,
    signal: rec.signal,
  });
  const withoutFp: Omit<IntelligenceRecommendationRecord, "fingerprint"> = {
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    intelligenceState: rec.intelligenceState,
    signal: rec.signal,
    recommendation: mapped.recommendation,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromPortfolio(
  portfolio: CustomerPortfolioIntelligence,
): IntelligenceRecommendation {
  const records = portfolio.records.map(projectRecord);
  const portfolioMapped = intelligenceRecommendationFromSignals({
    state: portfolio.portfolioState,
    signal: portfolio.portfolioSignal,
  });

  const withoutFp: Omit<IntelligenceRecommendation, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCI_4_ID,
    capability: INTELLIGENCE_RECOMMENDATION_CAPABILITY,
    version: INTELLIGENCE_RECOMMENDATION_VERSION,
    baselineTag: ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE,
    parentPack: ESCI_3_ID,
    parentVersion: CUSTOMER_PORTFOLIO_INTELLIGENCE_VERSION,
    parentBaseline: ESCI2_INTELLIGENCE_SIGNAL_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    portfolioRecommendation: portfolioMapped.recommendation,
    deferCount: records.filter((r) => r.recommendation === "DEFER").length,
    observeCount: records.filter((r) => r.recommendation === "OBSERVE").length,
    advanceCount: records.filter((r) => r.recommendation === "ADVANCE").length,
    remediateCount: records.filter((r) => r.recommendation === "REMEDIATE")
      .length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    customerPortfolioIntelligenceFingerprint: portfolio.fingerprint,
    intelligenceSignalFingerprint: portfolio.intelligenceSignalFingerprint,
    customerIntelligenceStateFingerprint:
      portfolio.customerIntelligenceStateFingerprint,
    scope: {
      readOnly: true,
      recommendationOnly: true,
      noExecution: true,
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

export function buildIntelligenceRecommendation(
  portfolio?: CustomerPortfolioIntelligence,
): IntelligenceRecommendation {
  const source = portfolio ?? getCustomerPortfolioIntelligence();
  const out = deriveFromPortfolio(source);
  cached = cloneRecommendation(out);
  return cloneRecommendation(cached);
}

export function getIntelligenceRecommendation(): IntelligenceRecommendation {
  if (!cached) {
    return buildIntelligenceRecommendation();
  }
  return cloneRecommendation(cached);
}

export function intelligenceRecommendationFingerprint(
  row?: IntelligenceRecommendation,
): string {
  const v = row ?? getIntelligenceRecommendation();
  return v.fingerprint;
}

export function clearIntelligenceRecommendation(): void {
  cached = null;
}

export function ensurePortfolioThenBuildIntelligenceRecommendation(): IntelligenceRecommendation {
  buildCustomerPortfolioIntelligence();
  clearIntelligenceRecommendation();
  return buildIntelligenceRecommendation();
}
