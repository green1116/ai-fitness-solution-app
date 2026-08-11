/**
 * ESCP-3 — Customer Plan Portfolio
 * Deterministic portfolio rollup from ESCP-1 CustomerPlanState + ESCP-2 CustomerPlanAction.
 * Baseline: escp-2-customer-plan-action-1.
 * Read-only — no persistence / execution / orchestration / CRM / billing / frozen-layer mutation.
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
  CUSTOMER_PLAN_ACTION_VERSION,
  ESCP1_CUSTOMER_PLAN_STATE_BASELINE,
  ESCP_2_ID,
  buildCustomerPlanAction,
  getCustomerPlanAction,
  type CustomerPlanAction,
  type CustomerPlanActionKind,
  type CustomerPlanActionRecord,
} from "./customer-plan-action";
import {
  getCustomerPlanState,
  type CustomerPlanFocus,
  type CustomerPlanPriority,
  type CustomerPlanStatus,
} from "./customer-plan-state";

export const ESCP_3_ID = "ESCP-3" as const;
export const CUSTOMER_PLAN_PORTFOLIO_CAPABILITY =
  "CustomerPlanPortfolio" as const;
export const CUSTOMER_PLAN_PORTFOLIO_VERSION =
  "escp-3-customer-plan-portfolio-1" as const;
export const ESCP2_CUSTOMER_PLAN_ACTION_BASELINE =
  "escp2-customer-plan-action-v1" as const;
export const CUSTOMER_PLAN_PORTFOLIO_ID = "escp-3:portfolio" as const;

export type CustomerPlanPrioritySummary = Readonly<{
  p1Count: number;
  p2Count: number;
  p3Count: number;
  p4Count: number;
  dominant: CustomerPlanPriority;
}>;

export type CustomerPlanFocusSummary = Readonly<{
  remediationCount: number;
  growthCount: number;
  stabilityCount: number;
  monitorCount: number;
  dominant: CustomerPlanFocus;
}>;

export type CustomerPlanPortfolioRecord = Readonly<{
  portfolioRecordId: string;
  planId: string;
  actionId: string;
  customerId: string;
  tenantId: string;
  status: CustomerPlanStatus;
  action: CustomerPlanActionKind;
  priority: CustomerPlanPriority;
  focus: CustomerPlanFocus;
  reason: string;
  fingerprint: string;
  ordinal: number;
}>;

export type CustomerPlanPortfolio = Readonly<{
  releaseId: typeof RELEASE_ID;
  workPackageId: typeof ESCP_3_ID;
  capability: typeof CUSTOMER_PLAN_PORTFOLIO_CAPABILITY;
  version: typeof CUSTOMER_PLAN_PORTFOLIO_VERSION;
  baselineTag: typeof ESCP2_CUSTOMER_PLAN_ACTION_BASELINE;
  parentPack: typeof ESCP_2_ID;
  parentVersion: typeof CUSTOMER_PLAN_ACTION_VERSION;
  parentBaseline: typeof ESCP1_CUSTOMER_PLAN_STATE_BASELINE;
  productionBaseline: typeof POST_GA_PRODUCTION_BASELINE;
  portfolioId: typeof CUSTOMER_PLAN_PORTFOLIO_ID;
  records: readonly CustomerPlanPortfolioRecord[];
  recordCount: number;
  customerCount: number;
  actionCount: number;
  portfolioStatus: CustomerPlanStatus;
  portfolioAction: CustomerPlanActionKind;
  portfolioPriority: CustomerPlanPriority;
  portfolioFocus: CustomerPlanFocus;
  notReadyCount: number;
  readyCount: number;
  planningCount: number;
  blockedCount: number;
  holdCount: number;
  watchCount: number;
  prepareCount: number;
  remediateCount: number;
  prioritySummary: CustomerPlanPrioritySummary;
  focusSummary: CustomerPlanFocusSummary;
  gaVersion: typeof GA_RELEASE_VERSION;
  gaFreezeVersion: typeof GA_RELEASE_FREEZE_VERSION;
  gaBaseline: typeof GA_RELEASE_BASELINE;
  commitReference: typeof RELEASE_HEALTH_COMMIT_REF;
  customerPlanActionFingerprint: string;
  customerPlanStateFingerprint: string;
  fingerprint: string;
  scope: {
    readOnly: true;
    recommendationOnly: true;
    planningOnly: true;
    noExecution: true;
    noPersistence: true;
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

let cached: CustomerPlanPortfolio | null = null;

function clonePortfolio(row: CustomerPlanPortfolio): CustomerPlanPortfolio {
  return {
    ...row,
    records: row.records.map((r) => ({ ...r })),
    prioritySummary: { ...row.prioritySummary },
    focusSummary: { ...row.focusSummary },
    scope: { ...row.scope },
  };
}

function stablePayload(
  row: Omit<CustomerPlanPortfolio, "fingerprint">,
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
    portfolioId: row.portfolioId,
    records: row.records,
    recordCount: row.recordCount,
    customerCount: row.customerCount,
    actionCount: row.actionCount,
    portfolioStatus: row.portfolioStatus,
    portfolioAction: row.portfolioAction,
    portfolioPriority: row.portfolioPriority,
    portfolioFocus: row.portfolioFocus,
    notReadyCount: row.notReadyCount,
    readyCount: row.readyCount,
    planningCount: row.planningCount,
    blockedCount: row.blockedCount,
    holdCount: row.holdCount,
    watchCount: row.watchCount,
    prepareCount: row.prepareCount,
    remediateCount: row.remediateCount,
    prioritySummary: row.prioritySummary,
    focusSummary: row.focusSummary,
    gaVersion: row.gaVersion,
    gaFreezeVersion: row.gaFreezeVersion,
    gaBaseline: row.gaBaseline,
    commitReference: row.commitReference,
    customerPlanActionFingerprint: row.customerPlanActionFingerprint,
    customerPlanStateFingerprint: row.customerPlanStateFingerprint,
    scope: row.scope,
  });
}

function computeFingerprint(
  row: Omit<CustomerPlanPortfolio, "fingerprint">,
): string {
  return createHash("sha256").update(stablePayload(row)).digest("hex");
}

function recordFingerprint(
  row: Omit<CustomerPlanPortfolioRecord, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        portfolioRecordId: row.portfolioRecordId,
        planId: row.planId,
        actionId: row.actionId,
        customerId: row.customerId,
        tenantId: row.tenantId,
        status: row.status,
        action: row.action,
        priority: row.priority,
        focus: row.focus,
        reason: row.reason,
        ordinal: row.ordinal,
      }),
    )
    .digest("hex");
}

function stablePortfolioRecordId(tenantId: string, customerId: string): string {
  return `escp-3:${tenantId}:${customerId}`;
}

/** Roll up plan status / action counts into a portfolio verdict. */
export function portfolioPlanFromCounts(input: {
  blockedCount: number;
  planningCount: number;
  readyCount: number;
}): {
  portfolioStatus: CustomerPlanStatus;
  portfolioAction: CustomerPlanActionKind;
  portfolioPriority: CustomerPlanPriority;
  portfolioFocus: CustomerPlanFocus;
  reason: string;
} {
  if (input.blockedCount > 0) {
    return {
      portfolioStatus: "BLOCKED",
      portfolioAction: "REMEDIATE",
      portfolioPriority: "P1",
      portfolioFocus: "REMEDIATION",
      reason: "portfolio-blocked",
    };
  }
  if (input.planningCount > 0) {
    return {
      portfolioStatus: "PLANNING",
      portfolioAction: "PREPARE",
      portfolioPriority: "P2",
      portfolioFocus: "GROWTH",
      reason: "portfolio-planning",
    };
  }
  if (input.readyCount > 0) {
    return {
      portfolioStatus: "READY",
      portfolioAction: "HOLD",
      portfolioPriority: "P4",
      portfolioFocus: "STABILITY",
      reason: "portfolio-ready",
    };
  }
  return {
    portfolioStatus: "NOT_READY",
    portfolioAction: "WATCH",
    portfolioPriority: "P3",
    portfolioFocus: "MONITOR",
    reason: "portfolio-not-ready",
  };
}

function projectRecord(
  rec: CustomerPlanActionRecord,
  status: CustomerPlanStatus,
  focus: CustomerPlanFocus,
): CustomerPlanPortfolioRecord {
  const withoutFp: Omit<CustomerPlanPortfolioRecord, "fingerprint"> = {
    portfolioRecordId: stablePortfolioRecordId(rec.tenantId, rec.customerId),
    planId: rec.planId,
    actionId: rec.actionId,
    customerId: rec.customerId,
    tenantId: rec.tenantId,
    status,
    action: rec.action,
    priority: rec.priority,
    focus,
    reason: rec.reason,
    ordinal: rec.ordinal,
  };
  return {
    ...withoutFp,
    fingerprint: recordFingerprint(withoutFp),
  };
}

function deriveFromAction(action: CustomerPlanAction): CustomerPlanPortfolio {
  const statePack = getCustomerPlanState();
  const stateById = new Map(
    statePack.records.map(
      (r) => [r.customerId, { status: r.status, focus: r.focus }] as const,
    ),
  );
  const records = action.records.map((rec) => {
    const src = stateById.get(rec.customerId);
    return projectRecord(
      rec,
      src?.status ?? rec.fromStatus,
      src?.focus ?? "MONITOR",
    );
  });
  const blockedCount = records.filter((r) => r.status === "BLOCKED").length;
  const planningCount = records.filter((r) => r.status === "PLANNING").length;
  const readyCount = records.filter((r) => r.status === "READY").length;
  const notReadyCount = records.filter((r) => r.status === "NOT_READY").length;
  const p1Count = records.filter((r) => r.priority === "P1").length;
  const p2Count = records.filter((r) => r.priority === "P2").length;
  const p3Count = records.filter((r) => r.priority === "P3").length;
  const p4Count = records.filter((r) => r.priority === "P4").length;
  const remediationCount = records.filter(
    (r) => r.focus === "REMEDIATION",
  ).length;
  const growthCount = records.filter((r) => r.focus === "GROWTH").length;
  const stabilityCount = records.filter((r) => r.focus === "STABILITY").length;
  const monitorCount = records.filter((r) => r.focus === "MONITOR").length;
  const rolled = portfolioPlanFromCounts({
    blockedCount,
    planningCount,
    readyCount,
  });

  const withoutFp: Omit<CustomerPlanPortfolio, "fingerprint"> = {
    releaseId: RELEASE_ID,
    workPackageId: ESCP_3_ID,
    capability: CUSTOMER_PLAN_PORTFOLIO_CAPABILITY,
    version: CUSTOMER_PLAN_PORTFOLIO_VERSION,
    baselineTag: ESCP2_CUSTOMER_PLAN_ACTION_BASELINE,
    parentPack: ESCP_2_ID,
    parentVersion: CUSTOMER_PLAN_ACTION_VERSION,
    parentBaseline: ESCP1_CUSTOMER_PLAN_STATE_BASELINE,
    productionBaseline: POST_GA_PRODUCTION_BASELINE,
    portfolioId: CUSTOMER_PLAN_PORTFOLIO_ID,
    records,
    recordCount: records.length,
    customerCount: records.length,
    actionCount: action.recordCount,
    portfolioStatus: rolled.portfolioStatus,
    portfolioAction: rolled.portfolioAction,
    portfolioPriority: rolled.portfolioPriority,
    portfolioFocus: rolled.portfolioFocus,
    notReadyCount,
    readyCount,
    planningCount,
    blockedCount,
    holdCount: records.filter((r) => r.action === "HOLD").length,
    watchCount: records.filter((r) => r.action === "WATCH").length,
    prepareCount: records.filter((r) => r.action === "PREPARE").length,
    remediateCount: records.filter((r) => r.action === "REMEDIATE").length,
    prioritySummary: {
      p1Count,
      p2Count,
      p3Count,
      p4Count,
      dominant: rolled.portfolioPriority,
    },
    focusSummary: {
      remediationCount,
      growthCount,
      stabilityCount,
      monitorCount,
      dominant: rolled.portfolioFocus,
    },
    gaVersion: GA_RELEASE_VERSION,
    gaFreezeVersion: GA_RELEASE_FREEZE_VERSION,
    gaBaseline: GA_RELEASE_BASELINE,
    commitReference: RELEASE_HEALTH_COMMIT_REF,
    customerPlanActionFingerprint: action.fingerprint,
    customerPlanStateFingerprint: statePack.fingerprint,
    scope: {
      readOnly: true,
      recommendationOnly: true,
      planningOnly: true,
      noExecution: true,
      noPersistence: true,
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

export function buildCustomerPlanPortfolio(
  action?: CustomerPlanAction,
): CustomerPlanPortfolio {
  const source = action ?? getCustomerPlanAction();
  const out = deriveFromAction(source);
  cached = clonePortfolio(out);
  return clonePortfolio(cached);
}

export function getCustomerPlanPortfolio(): CustomerPlanPortfolio {
  if (!cached) {
    return buildCustomerPlanPortfolio();
  }
  return clonePortfolio(cached);
}

export function customerPlanPortfolioFingerprint(
  row?: CustomerPlanPortfolio,
): string {
  const v = row ?? getCustomerPlanPortfolio();
  return v.fingerprint;
}

export function clearCustomerPlanPortfolio(): void {
  cached = null;
}

export function ensureActionThenBuildCustomerPlanPortfolio(): CustomerPlanPortfolio {
  buildCustomerPlanAction();
  clearCustomerPlanPortfolio();
  return buildCustomerPlanPortfolio();
}
