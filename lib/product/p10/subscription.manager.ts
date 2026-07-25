/**
 * Product P10 — Subscription & Billing Manager
 */

import {
  clearBilling,
  getBilling,
  listBilling,
  openBilling,
  updateBillingStatus,
} from "./billing/billing.registry";
import type {
  BillingCycleRecord,
  OpenBillingInput,
  UpdateBillingStatusInput,
} from "./billing/billing.types";
import {
  clearEntitlements,
  getEntitlement,
  grantEntitlement,
  listEntitlements,
} from "./entitlement/entitlement.registry";
import type {
  Entitlement,
  GrantEntitlementInput,
} from "./entitlement/entitlement.types";
import {
  clearInvoices,
  getInvoice,
  issueInvoice,
  listInvoices,
  updateInvoiceStatus,
} from "./invoice/invoice.registry";
import type {
  Invoice,
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
  CapturePaymentInput,
  Payment,
  UpdatePaymentStatusInput,
} from "./payment/payment.types";
import {
  clearPlans,
  getPlan,
  listPlans,
  registerPlan,
} from "./plan/plan.registry";
import type { RegisterPlanInput, SubscriptionPlan } from "./plan/plan.types";
import {
  clearPricing,
  createPricing,
  getPricing,
  listPricing,
} from "./pricing/pricing.registry";
import type {
  CreatePricingInput,
  SubscriptionPricing,
} from "./pricing/pricing.types";
import {
  clearQuotas,
  consumeQuota,
  createQuota,
  getQuota,
  listQuotas,
} from "./quota/quota.registry";
import type {
  ConsumeQuotaInput,
  CreateQuotaInput,
  Quota,
} from "./quota/quota.types";
import {
  PRODUCT_P10_SUBSCRIPTION_BILLING_BASE,
  PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION,
  PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
  PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION,
} from "./subscription/subscription.constants";
import {
  assertP10SubscriptionBillingReadinessReady,
  evaluateP10SubscriptionBillingReadiness,
} from "./subscription/subscription.readiness";
import {
  bindSubscriptionPlan,
  clearSubscriptions,
  createSubscription,
  getSubscription,
  listSubscriptions,
  updateSubscriptionStatus,
} from "./subscription/subscription.registry";
import type {
  BindSubscriptionPlanInput,
  CreateSubscriptionInput,
  P10ManagerStatus,
  P10ReadinessResult,
  P10RegistryManifest,
  Subscription,
  UpdateSubscriptionStatusInput,
} from "./subscription/subscription.types";

export type P10SubscriptionManagerSnapshot = {
  managerId: string;
  status: P10ManagerStatus;
  layerId: typeof PRODUCT_P10_SUBSCRIPTION_BILLING_ID;
  version: typeof PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION;
  subscriptionCount: number;
  planCount: number;
  invoiceCount: number;
  paymentCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P10SubscriptionManager = {
  initialize: () => P10SubscriptionManagerSnapshot;
  start: () => P10SubscriptionManagerSnapshot;
  stop: () => P10SubscriptionManagerSnapshot;
  status: () => P10SubscriptionManagerSnapshot;
  registerPlan: (input: RegisterPlanInput) => SubscriptionPlan;
  createPricing: (input: CreatePricingInput) => SubscriptionPricing;
  createSubscription: (input: CreateSubscriptionInput) => Subscription;
  bindPlan: (input: BindSubscriptionPlanInput) => Subscription;
  updateSubscriptionStatus: (
    input: UpdateSubscriptionStatusInput,
  ) => Subscription;
  openBilling: (input: OpenBillingInput) => BillingCycleRecord;
  updateBillingStatus: (
    input: UpdateBillingStatusInput,
  ) => BillingCycleRecord;
  issueInvoice: (input: IssueInvoiceInput) => Invoice;
  updateInvoiceStatus: (input: UpdateInvoiceStatusInput) => Invoice;
  capturePayment: (input: CapturePaymentInput) => Payment;
  updatePaymentStatus: (input: UpdatePaymentStatusInput) => Payment;
  grantEntitlement: (input: GrantEntitlementInput) => Entitlement;
  createQuota: (input: CreateQuotaInput) => Quota;
  consumeQuota: (input: ConsumeQuotaInput) => Quota;
  evaluateReadiness: () => P10ReadinessResult;
  manifest: () => P10RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP10RegistryManifest(): P10RegistryManifest {
  return {
    foundationId: PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
    version: PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION,
    freezeVersion: PRODUCT_P10_SUBSCRIPTION_BILLING_FREEZE_VERSION,
    base: PRODUCT_P10_SUBSCRIPTION_BILLING_BASE,
    subscriptionCount: listSubscriptions().length,
    planCount: listPlans().length,
    pricingCount: listPricing().length,
    billingCount: listBilling().length,
    invoiceCount: listInvoices().length,
    paymentCount: listPayments().length,
    entitlementCount: listEntitlements().length,
    quotaCount: listQuotas().length,
  };
}

export function clearP10SubscriptionBillingLayer(): void {
  clearQuotas();
  clearEntitlements();
  clearPayments();
  clearInvoices();
  clearBilling();
  clearSubscriptions();
  clearPricing();
  clearPlans();
}

export function createP10SubscriptionManager(options?: {
  managerId?: string;
}): P10SubscriptionManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p10-sub-mgr");
  let state: P10ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P10SubscriptionManagerSnapshot {
    const reg = getP10RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P10_SUBSCRIPTION_BILLING_ID,
      version: PRODUCT_P10_SUBSCRIPTION_BILLING_VERSION,
      subscriptionCount: reg.subscriptionCount,
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

  function initialize(): P10SubscriptionManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP10SubscriptionBillingLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P10SubscriptionManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P10SubscriptionManagerSnapshot {
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
    registerPlan: (input) => {
      assertRunning("registerPlan");
      return registerPlan(input);
    },
    createPricing: (input) => {
      assertRunning("createPricing");
      return createPricing(input);
    },
    createSubscription: (input) => {
      assertRunning("createSubscription");
      if (input.planId?.trim()) {
        const pid = input.planId.trim();
        if (!getPlan(pid)) throw new Error(`plan not found: ${pid}`);
      }
      return createSubscription(input);
    },
    bindPlan: (input) => {
      assertRunning("bindPlan");
      if (!getPlan(input.planId)) {
        throw new Error(`plan not found: ${input.planId}`);
      }
      return bindSubscriptionPlan(input);
    },
    updateSubscriptionStatus: (input) => {
      assertRunning("updateSubscriptionStatus");
      return updateSubscriptionStatus(input);
    },
    openBilling: (input) => {
      assertRunning("openBilling");
      return openBilling(input);
    },
    updateBillingStatus: (input) => {
      assertRunning("updateBillingStatus");
      return updateBillingStatus(input);
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
    grantEntitlement: (input) => {
      assertRunning("grantEntitlement");
      return grantEntitlement(input);
    },
    createQuota: (input) => {
      assertRunning("createQuota");
      return createQuota(input);
    },
    consumeQuota: (input) => {
      assertRunning("consumeQuota");
      return consumeQuota(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP10SubscriptionBillingReadiness();
    },
    manifest: getP10RegistryManifest,
  };
}

export {
  assertP10SubscriptionBillingReadinessReady,
  getBilling,
  getEntitlement,
  getInvoice,
  getPayment,
  getPlan,
  getPricing,
  getQuota,
  getSubscription,
  listBilling,
  listEntitlements,
  listInvoices,
  listPayments,
  listPlans,
  listPricing,
  listQuotas,
  listSubscriptions,
};
