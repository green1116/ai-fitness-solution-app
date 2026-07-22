/**
 * Evolution P7 — Evolution Metrics
 */

import { getEvolutionOrchestration } from "./control.orchestration";
import type {
  ComputeEvolutionMetricsInput,
  EvolutionMetrics,
} from "./control.types";

const metricsStore = new Map<string, EvolutionMetrics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetrics(metrics: EvolutionMetrics): EvolutionMetrics {
  return { ...metrics };
}

export function computeEvolutionMetrics(
  input: ComputeEvolutionMetricsInput,
): EvolutionMetrics {
  const orchestration = getEvolutionOrchestration(
    input.orchestrationId.trim(),
  );
  if (!orchestration) {
    throw new Error(
      `evolution orchestration not found: ${input.orchestrationId}`,
    );
  }

  const byDomain = Object.fromEntries(
    orchestration.domains.map((d) => [d.domain, d.present ? d.score : 0]),
  ) as Record<string, number>;

  const optimizationScore = byDomain.OPTIMIZATION ?? 0;
  const predictiveScore = byDomain.PREDICTIVE ?? 0;
  const customerScore = byDomain.CUSTOMER ?? 0;
  const dashboardScore = byDomain.DASHBOARD ?? 0;
  const globalScore = byDomain.GLOBAL ?? 0;
  const marketplaceScore = byDomain.MARKETPLACE ?? 0;

  const presentCount = orchestration.domains.filter((d) => d.present).length;
  const domainCoverage = Math.round(
    (presentCount / orchestration.domains.length) * 100,
  );

  const scored = [
    optimizationScore,
    predictiveScore,
    customerScore,
    dashboardScore,
    globalScore,
    marketplaceScore,
  ].filter((s) => s > 0);
  const overallScore =
    scored.length === 0
      ? 0
      : Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);

  const id = input.id?.trim() || createId("evomet");
  if (metricsStore.has(id)) {
    throw new Error(`evolution metrics already exists: ${id}`);
  }

  const metrics: EvolutionMetrics = {
    id,
    orchestrationId: orchestration.id,
    overallScore,
    domainCoverage,
    optimizationScore,
    predictiveScore,
    customerScore,
    dashboardScore,
    globalScore,
    marketplaceScore,
    detail: `overall=${overallScore} coverage=${domainCoverage}%`,
    computedAt: nowIso(),
  };
  metricsStore.set(id, metrics);
  return cloneMetrics(metrics);
}

export function getEvolutionMetrics(id: string): EvolutionMetrics | undefined {
  const metrics = metricsStore.get(id.trim());
  return metrics ? cloneMetrics(metrics) : undefined;
}

export function listEvolutionMetrics(filter?: {
  orchestrationId?: string;
}): EvolutionMetrics[] {
  let result = [...metricsStore.values()];
  if (filter?.orchestrationId) {
    const oid = filter.orchestrationId.trim();
    result = result.filter((m) => m.orchestrationId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetrics);
}

export function clearEvolutionMetrics(): void {
  metricsStore.clear();
}
