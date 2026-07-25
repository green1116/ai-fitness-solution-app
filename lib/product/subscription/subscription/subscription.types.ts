/**
 * Product Subscription — Subscription types
 */

import type { SUBSCRIPTION_STATUSES } from "../lifecycle/lifecycle.constants";

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export type SubscriptionMetadata = Record<string, unknown>;

export type ProductSubscription = {
  id: string;
  accountId: string;
  planId: string;
  seats: number;
  status: SubscriptionStatus;
  detail: string;
  metadata: SubscriptionMetadata;
  startedAt: string;
  updatedAt: string;
  canceledAt?: string;
};

export type CreateSubscriptionInput = {
  id?: string;
  accountId: string;
  planId: string;
  seats?: number;
  trial?: boolean;
  metadata?: SubscriptionMetadata;
};

export type UpdateSubscriptionStatusInput = {
  subscriptionId: string;
  status: SubscriptionStatus;
};

export type UpdateSubscriptionPlanInput = {
  subscriptionId: string;
  planId: string;
  seats: number;
};
