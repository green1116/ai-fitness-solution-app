/**
 * Product P10 — Billing types
 */

import type { BILLING_STATUSES } from "../subscription/subscription.constants";

export type BillingStatus = (typeof BILLING_STATUSES)[number];
export type BillingMetadata = Record<string, unknown>;

export type BillingCycleRecord = {
  id: string;
  subscriptionId: string;
  pricingId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: BillingStatus;
  detail: string;
  metadata: BillingMetadata;
  openedAt: string;
  settledAt?: string;
};

export type OpenBillingInput = {
  id?: string;
  subscriptionId: string;
  pricingId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  metadata?: BillingMetadata;
};

export type UpdateBillingStatusInput = {
  billingId: string;
  status: BillingStatus;
};
