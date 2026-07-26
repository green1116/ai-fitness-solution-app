/**
 * Product Delivery — Retry policy types
 */

import type { DELIVERY_RETRY_BACKOFFS } from "../management/management.constants";

export type DeliveryRetryBackoff = (typeof DELIVERY_RETRY_BACKOFFS)[number];
export type RetryMetadata = Record<string, unknown>;

export type DeliveryRetryPolicy = {
  id: string;
  requestId: string;
  maxAttempts: number;
  backoff: DeliveryRetryBackoff;
  baseDelayMs: number;
  detail: string;
  metadata: RetryMetadata;
  createdAt: string;
};

export type AttachDeliveryRetryPolicyInput = {
  id?: string;
  requestId: string;
  maxAttempts: number;
  backoff: DeliveryRetryBackoff;
  baseDelayMs: number;
  metadata?: RetryMetadata;
};
