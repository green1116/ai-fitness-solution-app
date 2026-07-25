/**
 * Product Billing — Billing Foundation Manager
 */

import {
  clearBillingAccounts,
  getBillingAccount,
  listBillingAccounts,
  openBillingAccount,
  updateBillingAccountStatus,
} from "./account/account.registry";
import type {
  BillingAccount,
  OpenBillingAccountInput,
  UpdateBillingAccountStatusInput,
} from "./account/account.types";
import {
  PRODUCT_BILLING_FOUNDATION_BASE,
  PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION,
  PRODUCT_BILLING_FOUNDATION_ID,
  PRODUCT_BILLING_FOUNDATION_VERSION,
} from "./foundation/foundation.constants";
import {
  assertBillingFoundationReadinessReady,
  evaluateBillingFoundationReadiness,
} from "./foundation/foundation.readiness";
import type {
  BillingManagerStatus,
  BillingReadinessResult,
  BillingRegistryManifest,
} from "./foundation/foundation.types";
import {
  clearInvoices,
  getInvoice,
  issueInvoice,
  listInvoices,
  updateInvoiceStatus,
} from "./invoice/invoice.registry";
import type {
  BillingInvoice,
  IssueInvoiceInput,
  UpdateInvoiceStatusInput,
} from "./invoice/invoice.types";
import {
  capturePayment,
  clearPayments,
  getPayment,
  listPayments,
  updatePaymentStatus,
} from "./payment/payment.registry";
import type {
  BillingPayment,
  CapturePaymentInput,
  UpdatePaymentStatusInput,
} from "./payment/payment.types";
import {
  clearBillingPlans,
  getBillingPlan,
  listBillingPlans,
  registerBillingPlan,
} from "./plan/plan.registry";
import type {
  BillingPlan,
  RegisterBillingPlanInput,
} from "./plan/plan.types";

export type BillingManagerSnapshot = {
  managerId: string;
  status: BillingManagerStatus;
  layerId: typeof PRODUCT_BILLING_FOUNDATION_ID;
  version: typeof PRODUCT_BILLING_FOUNDATION_VERSION;
  accountCount: number;
  planCount: number;
  invoiceCount: number;
  paymentCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type BillingManager = {
  initialize: () => BillingManagerSnapshot;
  start: () => BillingManagerSnapshot;
  stop: () => BillingManagerSnapshot;
  status: () => BillingManagerSnapshot;
  openBillingAccount: (input: OpenBillingAccountInput) => BillingAccount;
  updateBillingAccountStatus: (
    input: UpdateBillingAccountStatusInput,
  ) => BillingAccount;
  registerBillingPlan: (input: RegisterBillingPlanInput) => BillingPlan;
  issueInvoice: (input: IssueInvoiceInput) => BillingInvoice;
  updateInvoiceStatus: (input: UpdateInvoiceStatusInput) => BillingInvoice;
  capturePayment: (input: CapturePaymentInput) => BillingPayment;
  updatePaymentStatus: (input: UpdatePaymentStatusInput) => BillingPayment;
  evaluateReadiness: () => BillingReadinessResult;
  manifest: () => BillingRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getBillingRegistryManifest(): BillingRegistryManifest {
  return {
    foundationId: PRODUCT_BILLING_FOUNDATION_ID,
    version: PRODUCT_BILLING_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_BILLING_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_BILLING_FOUNDATION_BASE,
    accountCount: listBillingAccounts().length,
    planCount: listBillingPlans().length,
    invoiceCount: listInvoices().length,
    paymentCount: listPayments().length,
  };
}

export function clearBillingFoundationLayer(): void {
  clearPayments();
  clearInvoices();
  clearBillingPlans();
  clearBillingAccounts();
}

export function createBillingManager(options?: {
  managerId?: string;
}): BillingManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-bil-mgr");
  let state: BillingManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): BillingManagerSnapshot {
    const reg = getBillingRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_BILLING_FOUNDATION_ID,
      version: PRODUCT_BILLING_FOUNDATION_VERSION,
      accountCount: reg.accountCount,
      planCount: reg.planCount,
      invoiceCount: reg.invoiceCount,
      paymentCount: reg.paymentCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): BillingManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearBillingFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): BillingManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): BillingManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    openBillingAccount: (input) => {
      assertRunning("openBillingAccount");
      return openBillingAccount(input);
    },
    updateBillingAccountStatus: (input) => {
      assertRunning("updateBillingAccountStatus");
      return updateBillingAccountStatus(input);
    },
    registerBillingPlan: (input) => {
      assertRunning("registerBillingPlan");
      return registerBillingPlan(input);
    },
    issueInvoice: (input) => {
      assertRunning("issueInvoice");
      return issueInvoice(input);
    },
    updateInvoiceStatus: (input) => {
      assertRunning("updateInvoiceStatus");
      return updateInvoiceStatus(input);
    },
    capturePayment: (input) => {
      assertRunning("capturePayment");
      return capturePayment(input);
    },
    updatePaymentStatus: (input) => {
      assertRunning("updatePaymentStatus");
      return updatePaymentStatus(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateBillingFoundationReadiness();
    },
    manifest: getBillingRegistryManifest,
  };
}

export {
  assertBillingFoundationReadinessReady,
  getBillingAccount,
  getBillingPlan,
  getInvoice,
  getPayment,
  listBillingAccounts,
  listBillingPlans,
  listInvoices,
  listPayments,
};
