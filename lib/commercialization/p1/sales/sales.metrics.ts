/**
 * Commercialization P1 — Sales metrics
 */

import { listOpportunities } from "./sales.registry";
import type {
  ComputeSalesMetricsInput,
  SalesMetrics,
} from "./sales.types";

const metricsStore = new Map<string, SalesMetrics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetrics(metrics: SalesMetrics): SalesMetrics {
  return { ...metrics };
}

export function computeSalesMetrics(
  input: ComputeSalesMetricsInput = {},
): SalesMetrics {
  const opportunities = listOpportunities(
    input.customerId ? { customerId: input.customerId } : undefined,
  );

  const open = opportunities.filter((o) => o.status === "OPEN");
  const won = opportunities.filter((o) => o.status === "WON");
  const lost = opportunities.filter((o) => o.status === "LOST");
  const closed = won.length + lost.length;

  const pipelineValue = open.reduce((sum, o) => sum + o.amount, 0);
  const wonValue = won.reduce((sum, o) => sum + o.amount, 0);
  const winRate =
    closed === 0 ? 0 : Math.round((won.length / closed) * 100);
  const averageDealSize =
    opportunities.length === 0
      ? 0
      : Math.round(
          opportunities.reduce((sum, o) => sum + o.amount, 0) /
            opportunities.length,
        );

  const id = input.id?.trim() || createId("smet");
  if (metricsStore.has(id)) {
    throw new Error(`sales metrics already exists: ${id}`);
  }

  const metrics: SalesMetrics = {
    id,
    opportunityCount: opportunities.length,
    openCount: open.length,
    wonCount: won.length,
    lostCount: lost.length,
    pipelineValue,
    wonValue,
    winRate,
    averageDealSize,
    detail: `open=${open.length} won=${won.length} pipeline=${pipelineValue}`,
    computedAt: nowIso(),
  };
  metricsStore.set(id, metrics);
  return cloneMetrics(metrics);
}

export function getSalesMetrics(id: string): SalesMetrics | undefined {
  const metrics = metricsStore.get(id.trim());
  return metrics ? cloneMetrics(metrics) : undefined;
}

export function listSalesMetrics(): SalesMetrics[] {
  return [...metricsStore.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetrics);
}

export function clearSalesMetrics(): void {
  metricsStore.clear();
}
