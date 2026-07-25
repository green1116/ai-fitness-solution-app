/**
 * Product Subscription — Renewal types
 */

import type { RENEWAL_RESULTS } from "../lifecycle/lifecycle.constants";

export type RenewalResult = (typeof RENEWAL_RESULTS)[number];
export type RenewalMetadata = Record<string, unknown>;

export type SubscriptionRenewal = {
  id: string;
  subscriptionId: string;
  result: RenewalResult;
  periodStart: string;
  periodEnd: string;
  detail: string;
  metadata: RenewalMetadata;
  renewedAt: string;
};

export type RenewSubscriptionInput = {
  id?: string;
  subscriptionId: string;
  succeed?: boolean;
  periodDays?: number;
  metadata?: RenewalMetadata;
};
