/**
 * Commercialization P6 — Revenue metrics
 */

import { listRevenueStreams } from "./revenue.registry";
import type {
  ComputeRevenueMetricsInput,
  RevenueMetrics,
} from "./revenue.types";

const metricsStore = new Map<string, RevenueMetrics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetrics(metrics: RevenueMetrics): RevenueMetrics {
  return { ...metrics };
}

export function computeRevenueMetrics(
  input: ComputeRevenueMetricsInput = {},
): RevenueMetrics {
  const streams = listRevenueStreams(
    input.accountRef ? { accountRef: input.accountRef } : undefined,
  );

  const totalRevenue = streams.reduce((sum, s) => sum + s.amount, 0);
  const recurringRevenue = streams
    .filter((s) => s.kind === "SUBSCRIPTION" || s.kind === "USAGE")
    .reduce((sum, s) => sum + s.amount, 0);
  const servicesRevenue = streams
    .filter((s) => s.kind === "SERVICES")
    .reduce((sum, s) => sum + s.amount, 0);
  const averageDeal =
    streams.length === 0
      ? 0
      : Math.round(totalRevenue / streams.length);
  const currency = streams[0]?.currency ?? "USD";

  const id = input.id?.trim() || createId("rmet");
  if (metricsStore.has(id)) {
    throw new Error(`revenue metrics already exists: ${id}`);
  }

  const metrics: RevenueMetrics = {
    id,
    streamCount: streams.length,
    totalRevenue,
    recurringRevenue,
    servicesRevenue,
    averageDeal,
    currency,
    detail: `streams=${streams.length} total=${totalRevenue}`,
    computedAt: nowIso(),
  };
  metricsStore.set(id, metrics);
  return cloneMetrics(metrics);
}

export function getRevenueMetrics(id: string): RevenueMetrics | undefined {
  const metrics = metricsStore.get(id.trim());
  return metrics ? cloneMetrics(metrics) : undefined;
}

export function listRevenueMetrics(): RevenueMetrics[] {
  return [...metricsStore.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetrics);
}

export function clearRevenueMetrics(): void {
  metricsStore.clear();
}
