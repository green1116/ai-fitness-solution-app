/**
 * Product P10 — Quota types
 */

import type { QUOTA_UNITS } from "../subscription/subscription.constants";

export type QuotaUnit = (typeof QUOTA_UNITS)[number];
export type QuotaMetadata = Record<string, unknown>;

export type Quota = {
  id: string;
  subscriptionId: string;
  unit: QuotaUnit;
  limit: number;
  used: number;
  detail: string;
  metadata: QuotaMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateQuotaInput = {
  id?: string;
  subscriptionId: string;
  unit: QuotaUnit;
  limit: number;
  used?: number;
  metadata?: QuotaMetadata;
};

export type ConsumeQuotaInput = {
  quotaId: string;
  amount: number;
};
