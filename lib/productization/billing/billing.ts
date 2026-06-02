import { buildEntitlements } from "./entitlements";
import { buildInvoices } from "./invoice";
import { buildSubscriptionPlans } from "./plans";
import { buildSubscriptions } from "./subscription";
import type { BillingResponse, BillingSummary } from "./types";
import { SUBSCRIPTION_BILLING_VERSION } from "./types";

export function buildBillingSummary(input?: { deploymentId?: string }): BillingSummary {
  const deploymentId = input?.deploymentId ?? "subscription-billing-default";
  const subscriptions = buildSubscriptions({ deploymentId });
  const invoices = buildInvoices({ deploymentId });
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;
  const paidInvoices = invoices.filter((i) => i.status === "paid").length;
  const overdueInvoices = invoices.filter((i) => i.status === "overdue").length;

  return {
    summaryId: `billing-summary-${deploymentId}`,
    version: SUBSCRIPTION_BILLING_VERSION,
    activeSubscriptions,
    totalInvoices: invoices.length,
    paidInvoices,
    overdueInvoices,
    summary: `billing-summary activeSubscriptions=${activeSubscriptions} invoices=${invoices.length} paid=${paidInvoices} overdue=${overdueInvoices} customPricing=true`,
  };
}

export function buildBillingResponse(input?: { deploymentId?: string }): BillingResponse {
  const deploymentId = input?.deploymentId ?? "subscription-billing-default";
  return {
    version: SUBSCRIPTION_BILLING_VERSION,
    plans: buildSubscriptionPlans(),
    subscriptions: buildSubscriptions({ deploymentId }),
    invoices: buildInvoices({ deploymentId }),
    entitlements: buildEntitlements(),
    summary: buildBillingSummary({ deploymentId }),
  };
}

export function validateSubscriptionBilling(input?: { deploymentId?: string }): {
  plansValid: boolean;
  subscriptionValid: boolean;
  invoiceValid: boolean;
  entitlementValid: boolean;
  summaryValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "subscription-billing-default";
  const response = buildBillingResponse({ deploymentId });

  const plansValid =
    response.plans.length === 3 &&
    response.plans.every((p) => p.customPricing && p.billingPeriods.length === 3);

  const subscriptionValid =
    response.subscriptions.length === 3 &&
    response.subscriptions.every((s) => s.subscriptionId.length > 0 && s.planId.length > 0);

  const invoiceStatuses = new Set(["draft", "issued", "paid", "overdue", "cancelled"]);
  const invoiceValid =
    response.invoices.length >= 5 &&
    response.invoices.every((i) => invoiceStatuses.has(i.status) && i.currency === "CNY");

  const entitlementValid =
    response.entitlements.length === 3 &&
    response.entitlements.every((e) => e.entitlementId.length > 0);

  const summaryValid =
    response.summary.summaryId.length > 0 &&
    response.summary.activeSubscriptions === 3 &&
    response.summary.totalInvoices === response.invoices.length;

  return {
    plansValid,
    subscriptionValid,
    invoiceValid,
    entitlementValid,
    summaryValid,
  };
}
