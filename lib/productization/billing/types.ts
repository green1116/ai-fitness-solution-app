import type { ProductTier } from "../catalog";

export const SUBSCRIPTION_BILLING_VERSION = "v8.8-subscription-billing-1" as const;

export type BillingPeriod = "monthly" | "quarterly" | "annual";

export type BillingStatus = "active" | "past-due" | "cancelled" | "trialing";

export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue" | "cancelled";

export interface SubscriptionPlan {
  planId: string;
  tier: ProductTier;
  name: string;
  billingPeriods: BillingPeriod[];
  customPricing: boolean;
  summary: string;
}

export interface Subscription {
  subscriptionId: string;
  customerId: string;
  planId: string;
  tier: ProductTier;
  billingPeriod: BillingPeriod;
  status: BillingStatus;
  startedAt: string;
  renewsAt: string;
}

export interface Invoice {
  invoiceId: string;
  subscriptionId: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
}

export interface BillingEntitlement {
  entitlementId: string;
  tier: ProductTier;
  planGeneration: number | "unlimited";
  budgetGeneration: number | "unlimited";
  proposalPdf: boolean;
  tenderPackage: boolean;
  workspaceLimit: number | "unlimited";
  userLimit: number | "unlimited";
}

export interface BillingSummary {
  summaryId: string;
  version: typeof SUBSCRIPTION_BILLING_VERSION;
  activeSubscriptions: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  summary: string;
}

export interface BillingResponse {
  version: typeof SUBSCRIPTION_BILLING_VERSION;
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  entitlements: BillingEntitlement[];
  summary: BillingSummary;
}
