/**
 * E12-P4 — Billing & Commercial types
 */

import type {
  BILLING_CYCLES,
  BILLING_LIFECYCLE_EVENTS,
  BILLING_MANAGER_STATUSES,
  BILLING_SUBSCRIPTION_STATUSES,
  E12_BILLING_COMMERCIAL_BASE,
  E12_BILLING_COMMERCIAL_FREEZE_VERSION,
  E12_BILLING_COMMERCIAL_ID,
  E12_BILLING_COMMERCIAL_VERSION,
  INVOICE_STATUSES,
  PRICING_PLAN_STATUSES,
  QUOTA_BILLING_STATUSES,
  USAGE_METER_UNITS,
} from "./billing.constants";
import type { ProductMetadata } from "../types/product.types";

export type PricingPlanStatus = (typeof PRICING_PLAN_STATUSES)[number];
export type BillingCycle = (typeof BILLING_CYCLES)[number];
export type UsageMeterUnit = (typeof USAGE_METER_UNITS)[number];
export type BillingSubscriptionStatus =
  (typeof BILLING_SUBSCRIPTION_STATUSES)[number];
export type BillingLifecycleEvent =
  (typeof BILLING_LIFECYCLE_EVENTS)[number];
export type QuotaBillingStatus = (typeof QUOTA_BILLING_STATUSES)[number];
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export type BillingManagerStatus = (typeof BILLING_MANAGER_STATUSES)[number];

export type { ProductMetadata };

export type QuotaLimit = {
  meter: UsageMeterUnit;
  included: number;
  overageRate: number;
};

/** Pricing plan model linked to product edition. */
export type PricingPlan = {
  id: string;
  productId: string;
  editionId: string;
  name: string;
  currency: string;
  basePrice: number;
  billingCycle: BillingCycle;
  quotas: QuotaLimit[];
  status: PricingPlanStatus;
  metadata: ProductMetadata;
  createdAt: string;
};

export type CreatePricingPlanInput = {
  id?: string;
  productId: string;
  editionId: string;
  name: string;
  currency?: string;
  basePrice: number;
  billingCycle?: BillingCycle;
  quotas?: QuotaLimit[];
  status?: PricingPlanStatus;
  metadata?: ProductMetadata;
};

/** Commercial subscription lifecycle. */
export type BillingSubscription = {
  id: string;
  productTenantId: string;
  tenantSubscriptionId: string;
  pricingPlanId: string;
  productId: string;
  editionId: string;
  status: BillingSubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  metadata: ProductMetadata;
  createdAt: string;
};

export type CreateBillingSubscriptionInput = {
  id?: string;
  productTenantId: string;
  tenantSubscriptionId: string;
  pricingPlanId: string;
  metadata?: ProductMetadata;
};

export type BillingLifecycleRecord = {
  id: string;
  billingSubscriptionId: string;
  event: BillingLifecycleEvent;
  fromStatus?: BillingSubscriptionStatus;
  toStatus: BillingSubscriptionStatus;
  detail: string;
  recordedAt: string;
};

/** Usage meter record. */
export type UsageMeterRecord = {
  id: string;
  productTenantId: string;
  billingSubscriptionId: string;
  meter: UsageMeterUnit;
  quantity: number;
  recordedAt: string;
  metadata: ProductMetadata;
};

export type RecordUsageInput = {
  id?: string;
  productTenantId: string;
  billingSubscriptionId: string;
  meter: UsageMeterUnit;
  quantity: number;
  metadata?: ProductMetadata;
};

/** Quota billing evaluation. */
export type QuotaBillingResult = {
  productTenantId: string;
  billingSubscriptionId: string;
  meter: UsageMeterUnit;
  status: QuotaBillingStatus;
  included: number;
  used: number;
  overage: number;
  overageCharge: number;
  evaluatedAt: string;
};

/** Invoice model. */
export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type Invoice = {
  id: string;
  productTenantId: string;
  billingSubscriptionId: string;
  pricingPlanId: string;
  status: InvoiceStatus;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  lineItems: InvoiceLineItem[];
  periodStart: string;
  periodEnd: string;
  issuedAt?: string;
  paidAt?: string;
  metadata: ProductMetadata;
  createdAt: string;
};

export type GenerateInvoiceInput = {
  id?: string;
  productTenantId: string;
  billingSubscriptionId: string;
  periodStart?: string;
  periodEnd?: string;
  taxRate?: number;
  metadata?: ProductMetadata;
};

/** Commercial metrics snapshot. */
export type CommercialMetrics = {
  productId?: string;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  totalUsageRecords: number;
  totalInvoiced: number;
  totalPaid: number;
  overageSubscriptions: number;
  computedAt: string;
};

export type BillingCommercialRegistryManifest = {
  billingCommercialId: typeof E12_BILLING_COMMERCIAL_ID;
  version: typeof E12_BILLING_COMMERCIAL_VERSION;
  freezeVersion: typeof E12_BILLING_COMMERCIAL_FREEZE_VERSION;
  base: typeof E12_BILLING_COMMERCIAL_BASE;
  pricingPlanCount: number;
  billingSubscriptionCount: number;
  usageRecordCount: number;
  invoiceCount: number;
};
