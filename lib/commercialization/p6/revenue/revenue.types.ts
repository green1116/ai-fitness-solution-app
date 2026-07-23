/**
 * Commercialization P6 — Revenue types
 */

import type {
  REVENUE_PERIODS,
  REVENUE_STREAM_KINDS,
} from "../kpi/kpi.constants";

export type RevenueStreamKind = (typeof REVENUE_STREAM_KINDS)[number];
export type RevenuePeriod = (typeof REVENUE_PERIODS)[number];
export type RevenueMetadata = Record<string, unknown>;

export type RevenueStream = {
  id: string;
  name: string;
  accountRef: string;
  kind: RevenueStreamKind;
  currency: string;
  amount: number;
  period: RevenuePeriod;
  detail: string;
  metadata: RevenueMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterRevenueStreamInput = {
  id?: string;
  name: string;
  accountRef: string;
  kind: RevenueStreamKind;
  amount: number;
  currency?: string;
  period?: RevenuePeriod;
  metadata?: RevenueMetadata;
};

export type RevenueMetrics = {
  id: string;
  streamCount: number;
  totalRevenue: number;
  recurringRevenue: number;
  servicesRevenue: number;
  averageDeal: number;
  currency: string;
  detail: string;
  computedAt: string;
};

export type ComputeRevenueMetricsInput = {
  id?: string;
  accountRef?: string;
};
