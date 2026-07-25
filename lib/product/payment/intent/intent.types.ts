/**
 * Product Payment — Intent types
 */

import type { INTENT_STATUSES } from "../integration/integration.constants";

export type IntentStatus = (typeof INTENT_STATUSES)[number];
export type IntentMetadata = Record<string, unknown>;

export type PaymentIntent = {
  id: string;
  providerId: string;
  accountId: string;
  amountCents: number;
  currency: string;
  status: IntentStatus;
  detail: string;
  metadata: IntentMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateIntentInput = {
  id?: string;
  providerId: string;
  accountId: string;
  amountCents: number;
  currency?: string;
  metadata?: IntentMetadata;
};

export type AuthorizeIntentInput = {
  intentId: string;
};

export type CancelIntentInput = {
  intentId: string;
};
