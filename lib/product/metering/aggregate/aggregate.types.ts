/**
 * Product Metering — Aggregate types
 */

import type { AGGREGATION_WINDOWS } from "../usage/usage.constants";

export type AggregationWindow = (typeof AGGREGATION_WINDOWS)[number];
export type AggregateMetadata = Record<string, unknown>;

export type UsageAggregate = {
  id: string;
  meterId: string;
  accountId: string;
  window: AggregationWindow;
  totalQuantity: number;
  eventCount: number;
  detail: string;
  metadata: AggregateMetadata;
  aggregatedAt: string;
};

export type AggregateUsageInput = {
  id?: string;
  meterId: string;
  accountId: string;
  window?: AggregationWindow;
  metadata?: AggregateMetadata;
};
