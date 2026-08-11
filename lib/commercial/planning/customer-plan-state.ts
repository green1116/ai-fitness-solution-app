/**
 * ESCP-1 — Customer Plan State
 * Deterministic CustomerPlanState from existing ESCI recommendation / portfolio outputs.
 * Baseline: enterprise-saas-customer-intelligence-operations-v1.
 * Read-only — no persistence / execution / orchestration / CRM / billing / contract / payment / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1,
  ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE,
  ESCI_FREEZE_ID,
  ESCI_FREEZE_VERSION,
  getCustomerPortfolioIntelligence,
  getEsciFreeze,
  getIntelligenceRecommendation,
  type CustomerIntelligenceStateLevel,
  type IntelligenceRecommendation,
  type IntelligenceRecommendationKind,
  type IntelligenceRecommendationRecord,
  type IntelligenceSignalKind,
} from "../intelligence";
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

export const ESCP_1_ID = "ESCP-1" as const;
export const CUSTOMER_PLAN_STATE_CAPABILITY = "CustomerPlanState" as const;
export const CUSTOMER_PLAN_STATE_VERSION =
  "escp-1-customer-plan-state-1" as const;
export const ESCI_V1_BASELINE =
  ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1;

export const CUSTOMER_PLAN_STATUSES = [
  "NOT_READY",
  "READY",
  "PLANNING",
  "BLOCKED",
] as const;
export type CustomerPlanStatus = (typeof CUSTOMER_PLAN_STATUSES)[number];

export const CUSTOMER_PLAN_PRIORITIES = ["P1", "P2", "P3", "P4"] as const;
export type CustomerPlanPriority = (typeof CUSTOMER_PLAN_PRIORITIES)[number];

export const CUSTOMER_PLAN_FOCUSES = [
  "REMEDIATION",
  "GROWTH",
  "STABILITY",
  "MONITOR",
] as const;
export type CustomerPlanFocus = (typeof CUSTOMER_PLAN_FOCUSES)[number];

export type CustomerPlanStateRecord = Readonly<{
  planId: string;
  customerId: string;
  tenantId: string;
  status: CustomerPlanStatus;
  priority: CustomerPlanPriority;
  focus: CustomerPlanFocus;
  intelligenceState: CustomerIntelligenceStateLevel;
  signal: IntelligenceSignalKind;
  recommendation: IntelligenceRecommendationKind;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CustomerPlanState = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCP_1_ID;
  capability: typeof CUSTOMER_PLAN_STATE_CAPABILITY;
  version: typeof CUSTOMER_PLAN_STATE_VERSION;
  baselineTag: typeof ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1;
  esciBaseline: typeof ESCI_V1_BASELINE;
  parentPack: typeof ESCI_FREEZE_ID;
  parentVersion: typeof ESCI_FREEZE_VERSION;
  parentBaseline: typeof ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  records: readonly CustomerPlanStateRecord[];
  recordCount: number;
  notReadyCount: number;
  readyCount: number;
  planningCount: number;
  blockedCount: number;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  intelligenceRecommendationFingerprint: string;
  customerPortfolioIntelligenceFingerprint: string;
  esciFreezeFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    noPersistence: true;
    noExecution: true;
    noRuntimeSideEffects: true;
    noCrmPlatform: true;
    noMarketingExecution: true;
    noBillingPlatform: true;
    noContractExecution: true;
    noPaymentExecution: true;
    noEsciMutation: true;
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

let cached: CustomerPlanState | null = null;

function cloneState(row: CustomerPlanState): CustomerPlanState {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    scope: { ...row.scope },
  };
}

function stablePayload(row: Omit<CustomerPlanState, "fingerprint">): string {
  return JSON.stringify({
    releaseId: row.releaseId,
    workPackageId: row.workPackageId,
    capability: row.capability,
    version: row.version,
    baselineTag: row.baselineTag,
    esciBaseline: row.esciBaseline,
    parentPack: row.parentPack,
    parentVersion: row.parentVersion,
    parentBaseline: row.parentBaseline,
    productionBaseline: row.productionBaseline,
    records: row.records,
    recordCount: row.recordCount,
    notReadyCount: row.notReadyCount,
    readyCount: row.readyCount,
    planningCount: row.planningCount,
    blockedCount: row.blockedCount,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    intelligenceRecommendationFingerprint:
      row.intelligenceRecommendationFingerprint,
    customerPortfolioIntelligenceFingerprint:
      row.customerPortfolioIntelligenceFingerprint,
    esciFreezeFingerprint: row.esciFreezeFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(row: Omit<CustomerPlanState, "fingerprint">): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CustomerPlanStateRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        planId: row.planId,
        customerId: row.customerId,
        tenantId: row.tenantId,
        status: row.status,
        priority: row.priority,
        focus: row.focus,
        intelligenceState: row.intelligenceState,
        signal: row.signal,
        recommendation: row.recommendation,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stablePlanId(tenantId: string, customerId: string): string {
  return `escp-1:${tenantId}:${customerId}`;
}

/** Map ESCI recommendation / portfolio signals to a read-only plan state. */
export function customerPlanStateFromRecommendation(input: {
  recommendation: IntelligenceRecommendationKind;
  intelligenceState: CustomerIntelligenceStateLevel;
  signal: IntelligenceSignalKind;
}): {
  status: CustomerPlanStatus;
  priority: CustomerPlanPriority;
  focus: CustomerPlanFocus;
  reason: string;
} {
  if (
    input.recommendation === "REMEDIATE" ||
    input.intelligenceState === "RISK" ||
    input.signal === "ESCALATE"
  ) {
    return {
      status: "BLOCKED",
      priority: "P1",
      focus: "REMEDIATION",
      reason: "blocked-from-intelligence",
    };
  }
  if (
    input.recommendation === "ADVANCE" ||
    input.intelligenceState === "GROWING" ||
    input.signal === "ENABLE"
  ) {
    return {
      status: "PLANNING",
      priority: "P2",
      focus: "GROWTH",
      reason: "planning-from-intelligence",
    };
  }
  if (
    input.recommendation === "DEFER" ||
    input.intelligenceState === "STABLE" ||
    input.signal === "HOLD"
  ) {
    return {
      status: "READY",
      priority: "P4",
      focus: "STABILITY",
      reason: "ready-from-intelligence",
    };
  }
  return {
    status: "NOT_READY",
    priority: "P3",
    focus: "MONITOR",
    reason: "not-ready-from-intelligence",
  };
}

function projectRecord(
  rec: IntelligenceRecommendationRecord,
): CustomerPlanStateRecord {
  const mapped = customerPlanStateFromRecommendation({
    recommendation: rec.recommendation,
    intelligenceState: rec.intelligenceState,
    signal: rec.signal,
  });
  const withoutFp: Omit<CustomerPlanStateRecord, "fingerprint"> = {
    planId: stablePlanId(rec.tenantId, rec.customerId),
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    status: mapped.status,
    priority: mapped.priority,
    focus: mapped.focus,
    intelligenceState: rec.intelligenceState,
    signal: rec.signal,
    recommendation: rec.recommendation,
    reason: mapped.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromRecommendation(
  recommendation: IntelligenceRecommendation,
): CustomerPlanState {
  const portfolio = getCustomerPortfolioIntelligence();
  const freeze = getEsciFreeze();
  const records = recommendation.records.map(projectRecord);

  const withoutFp: Omit<CustomerPlanState, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCP_1_ID,
    capability: CUSTOMER_PLAN_STATE_CAPABILITY,
    version: CUSTOMER_PLAN_STATE_VERSION,
    baselineTag: ENTERPRISE_SAAS_CUSTOMER_INTELLIGENCE_OPERATIONS_V1,
    esciBaseline: ESCI_V1_BASELINE,
    parentPack: ESCI_FREEZE_ID,
    parentVersion: ESCI_FREEZE_VERSION,
    parentBaseline: ESCI3_CUSTOMER_PORTFOLIO_INTELLIGENCE_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    records,
    recordCount: records.length,
    notReadyCount: records.filter((r) => r.status === "NOT_READY").length,
    readyCount: records.filter((r) => r.status === "READY").length,
    planningCount: records.filter((r) => r.status === "PLANNING").length,
    blockedCount: records.filter((r) => r.status === "BLOCKED").length,
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    intelligenceRecommendationFingerprint: recommendation.fingerprint,
    customerPortfolioIntelligenceFingerprint: portfolio.fingerprint,
    esciFreezeFingerprint: freeze.fingerprint,
    scope: {
      readOnly: true,
      noPersistence: true,
      noExecution: true,
      noRuntimeSideEffects: true,
      noCrmPlatform: true,
      noMarketingExecution: true,
      noBillingPlatform: true,
      noContractExecution: true,
      noPaymentExecution: true,
      noEsciMutation: true,
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

export function buildCustomerPlanState(
  recommendation?: IntelligenceRecommendation,
): CustomerPlanState {
  const source = recommendation ?? getIntelligenceRecommendation();
  const out = deriveFromRecommendation(source);
  cached = cloneState(out);
  return cloneState(cached);
}

export function getCustomerPlanState(): CustomerPlanState {
  if (!cached) {
    return buildCustomerPlanState();
  }
  return cloneState(cached);
}

export function customerPlanStateFingerprint(row?: CustomerPlanState): string {
  const v = row ?? getCustomerPlanState();
  return v.fingerprint;
}

export function clearCustomerPlanState(): void {
  cached = null;
}
