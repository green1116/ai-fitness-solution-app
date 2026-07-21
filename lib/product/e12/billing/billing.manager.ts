/**
 * E12-P4 — Billing Commercial Manager
 */

import { getAdminConsoleRegistryManifest } from "../admin/admin.manager";
import { getProductRegistryManifest } from "../registry/product.registry";
import { getTenantProductRegistryManifest } from "../tenant/tenant.manager";
import { clearInvoices, generateInvoice, getInvoice, issueInvoice, listInvoices, markInvoicePaid } from "./billing.invoice";
import { computeCommercialMetrics } from "./billing.metrics";
import {
  E12_BILLING_COMMERCIAL_BASE,
  E12_BILLING_COMMERCIAL_FREEZE_VERSION,
  E12_BILLING_COMMERCIAL_ID,
  E12_BILLING_COMMERCIAL_VERSION,
} from "./billing.constants";
import {
  clearPricingPlans,
  createPricingPlan,
  getPricingPlan,
  listPricingPlans,
} from "./billing.plan";
import { evaluateAllQuotaBilling, evaluateQuotaBilling } from "./billing.quota";
import {
  activateBillingSubscription,
  cancelBillingSubscription,
  clearBillingSubscriptions,
  createBillingSubscription,
  getBillingSubscription,
  listBillingLifecycleRecords,
  listBillingSubscriptions,
  renewBillingSubscription,
} from "./billing.subscription";
import { clearUsageRecords, getUsageTotal, listUsageRecords, recordUsage } from "./billing.usage";
import type {
  BillingCommercialRegistryManifest,
  BillingManagerStatus,
  BillingSubscription,
  CommercialMetrics,
  CreateBillingSubscriptionInput,
  CreatePricingPlanInput,
  GenerateInvoiceInput,
  Invoice,
  PricingPlan,
  QuotaBillingResult,
  RecordUsageInput,
  UsageMeterRecord,
  UsageMeterUnit,
} from "./billing.types";

export type BillingCommercialManagerSnapshot = {
  managerId: string;
  status: BillingManagerStatus;
  layerId: typeof E12_BILLING_COMMERCIAL_ID;
  version: typeof E12_BILLING_COMMERCIAL_VERSION;
  pricingPlanCount: number;
  billingSubscriptionCount: number;
  usageRecordCount: number;
  invoiceCount: number;
  tenantProductCount: number;
  adminOrganizationCount: number;
  productIdentityCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type BillingCommercialManager = {
  initialize: () => BillingCommercialManagerSnapshot;
  start: () => BillingCommercialManagerSnapshot;
  stop: () => BillingCommercialManagerSnapshot;
  status: () => BillingCommercialManagerSnapshot;
  createPlan: (input: CreatePricingPlanInput) => PricingPlan;
  getPlan: typeof getPricingPlan;
  listPlans: typeof listPricingPlans;
  createSubscription: (input: CreateBillingSubscriptionInput) => BillingSubscription;
  activateSubscription: typeof activateBillingSubscription;
  renewSubscription: typeof renewBillingSubscription;
  cancelSubscription: typeof cancelBillingSubscription;
  getSubscription: typeof getBillingSubscription;
  listSubscriptions: typeof listBillingSubscriptions;
  listLifecycle: typeof listBillingLifecycleRecords;
  recordUsage: (input: RecordUsageInput) => UsageMeterRecord;
  listUsage: typeof listUsageRecords;
  usageTotal: typeof getUsageTotal;
  evaluateQuota: (input: {
    billingSubscriptionId: string;
    meter: UsageMeterUnit;
  }) => QuotaBillingResult;
  evaluateAllQuotas: typeof evaluateAllQuotaBilling;
  generateInvoice: (input: GenerateInvoiceInput) => Invoice;
  issueInvoice: typeof issueInvoice;
  markPaid: typeof markInvoicePaid;
  getInvoice: typeof getInvoice;
  listInvoices: typeof listInvoices;
  metrics: (filter?: { productId?: string }) => CommercialMetrics;
  manifest: () => BillingCommercialRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getBillingCommercialRegistryManifest(): BillingCommercialRegistryManifest {
  return {
    billingCommercialId: E12_BILLING_COMMERCIAL_ID,
    version: E12_BILLING_COMMERCIAL_VERSION,
    freezeVersion: E12_BILLING_COMMERCIAL_FREEZE_VERSION,
    base: E12_BILLING_COMMERCIAL_BASE,
    pricingPlanCount: listPricingPlans().length,
    billingSubscriptionCount: listBillingSubscriptions().length,
    usageRecordCount: listUsageRecords().length,
    invoiceCount: listInvoices().length,
  };
}

export function clearBillingCommercialLayer(): void {
  clearInvoices();
  clearUsageRecords();
  clearBillingSubscriptions();
  clearPricingPlans();
}

export function createBillingCommercialManager(options?: {
  managerId?: string;
}): BillingCommercialManager {
  const managerId =
    options?.managerId?.trim() || createId("e12-bcm-mgr");
  let state: BillingManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): BillingCommercialManagerSnapshot {
    const productReg = getProductRegistryManifest();
    const tenantReg = getTenantProductRegistryManifest();
    const adminReg = getAdminConsoleRegistryManifest();
    const reg = getBillingCommercialRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: E12_BILLING_COMMERCIAL_ID,
      version: E12_BILLING_COMMERCIAL_VERSION,
      pricingPlanCount: reg.pricingPlanCount,
      billingSubscriptionCount: reg.billingSubscriptionCount,
      usageRecordCount: reg.usageRecordCount,
      invoiceCount: reg.invoiceCount,
      tenantProductCount: tenantReg.tenantCount,
      adminOrganizationCount: adminReg.organizationCount,
      productIdentityCount: productReg.identityCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): BillingCommercialManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearBillingCommercialLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): BillingCommercialManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): BillingCommercialManagerSnapshot {
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
    createPlan: (input) => {
      assertRunning("createPlan");
      return createPricingPlan(input);
    },
    getPlan: getPricingPlan,
    listPlans: listPricingPlans,
    createSubscription: (input) => {
      assertRunning("createSubscription");
      return createBillingSubscription(input);
    },
    activateSubscription: (id) => {
      assertRunning("activateSubscription");
      return activateBillingSubscription(id);
    },
    renewSubscription: (id) => {
      assertRunning("renewSubscription");
      return renewBillingSubscription(id);
    },
    cancelSubscription: (id) => {
      assertRunning("cancelSubscription");
      return cancelBillingSubscription(id);
    },
    getSubscription: getBillingSubscription,
    listSubscriptions: listBillingSubscriptions,
    listLifecycle: listBillingLifecycleRecords,
    recordUsage: (input) => {
      assertRunning("recordUsage");
      return recordUsage(input);
    },
    listUsage: listUsageRecords,
    usageTotal: getUsageTotal,
    evaluateQuota: (input) => {
      assertRunning("evaluateQuota");
      return evaluateQuotaBilling(input);
    },
    evaluateAllQuotas: (billingSubscriptionId) => {
      assertRunning("evaluateAllQuotas");
      return evaluateAllQuotaBilling(billingSubscriptionId);
    },
    generateInvoice: (input) => {
      assertRunning("generateInvoice");
      return generateInvoice(input);
    },
    issueInvoice: (id) => {
      assertRunning("issueInvoice");
      return issueInvoice(id);
    },
    markPaid: (id) => {
      assertRunning("markPaid");
      return markInvoicePaid(id);
    },
    getInvoice,
    listInvoices,
    metrics: (filter) => {
      assertRunning("metrics");
      return computeCommercialMetrics(filter);
    },
    manifest: getBillingCommercialRegistryManifest,
  };
}
