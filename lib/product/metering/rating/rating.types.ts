/**
 * Product Metering — Rating types
 */

import type { RATING_RESULTS } from "../usage/usage.constants";

export type RatingResult = (typeof RATING_RESULTS)[number];
export type RatingMetadata = Record<string, unknown>;

export type UsageRating = {
  id: string;
  aggregateId: string;
  meterId: string;
  accountId: string;
  unitRateCents: number;
  quantity: number;
  amountCents: number;
  result: RatingResult;
  detail: string;
  metadata: RatingMetadata;
  ratedAt: string;
};

export type RateUsageInput = {
  id?: string;
  aggregateId: string;
  unitRateCents: number;
  metadata?: RatingMetadata;
};
