/**
 * V65 — Universe orchestrator
 */

import { createTraceId } from "@/lib/ai-execution/core/execution.context";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import type { UniverseLoopResult } from "@/lib/universe/universe.types";
import { computeUniverseThresholds } from "@/lib/universe/universe.types";
import { buildBusinessUniverse } from "@/lib/universe/universe.builder";
import { buildUniverseRevenueGraph, analyzeRevenueMatrix } from "@/lib/universe/revenue.universe";
import { getSaaSInstancesSnapshot } from "@/lib/universe/universe.store";
import {
  autoCreateSaaS,
  autoScaleSaaS,
  findIndustriesNeedingInstances,
  listManagedSaaS,
} from "./saas.manager";
import { routeBusinessOperation } from "./business.router";
import { aggregateRevenueMetrics } from "@/lib/revenue/core/revenue.context";

export function autoAllocateResources(traceId?: string): string[] {
  const tid = traceId ?? createTraceId();
  const instances = listManagedSaaS();
  const metrics = aggregateRevenueMetrics();
  const thresholds = computeUniverseThresholds({
    totalMrr: metrics.mrr,
    instanceCount: instances.length,
  });

  const allocations: string[] = [];
  const cap = thresholds.resourceAllocationCap;
  const sorted = [...instances].sort((a, b) => a.mrr - b.mrr);

  for (const inst of sorted.slice(0, cap)) {
    allocations.push(`Allocate growth budget to ${inst.name} (${inst.industry})`);
    routeBusinessOperation("growth", `${tid}-${inst.id}`);
  }

  return allocations;
}

export function autoOptimizeUniverse(traceId?: string): UniverseLoopResult {
  const tid = traceId ?? createTraceId();
  const metrics = aggregateRevenueMetrics();
  const instances = getSaaSInstancesSnapshot();
  const thresholds = computeUniverseThresholds({
    totalMrr: metrics.mrr,
    instanceCount: instances.length,
  });

  const actions: string[] = [];
  const optimizations: string[] = [];

  const needing = findIndustriesNeedingInstances();
  for (const industry of needing.slice(0, 2)) {
    autoCreateSaaS(industry);
    actions.push(`autoCreateSaaS: ${industry}`);
  }

  const universes = buildBusinessUniverse();
  const revenueGraph = buildUniverseRevenueGraph();
  const matrix = analyzeRevenueMatrix();

  if (revenueGraph.totalMrr < thresholds.mrrScaleMin) {
    for (const inst of instances.slice(0, 2)) {
      try {
        autoScaleSaaS(inst.id);
        actions.push(`autoScaleSaaS: ${inst.id}`);
      } catch {
        // instance may not exist in empty test state
      }
    }
  }

  const allocations = autoAllocateResources(tid);
  actions.push(...allocations);

  routeBusinessOperation("revenue", tid);
  routeBusinessOperation("conversion", `${tid}-cro`);

  optimizations.push(`Revenue diversification score: ${matrix.diversificationScore}`);
  optimizations.push(`Top revenue stream: ${matrix.topStream}`);
  optimizations.push(`Universe instances: ${universes.reduce((s, u) => s + u.instances.length, 0)}`);
  optimizations.push(`Parallel revenue streams: ${revenueGraph.streamCount}`);

  appendGrowthEvent({
    event: "universe.loop_completed",
    meta: { traceId: tid, streamCount: revenueGraph.streamCount, layer: "v65-universe" },
  });

  return {
    traceId: tid,
    instances: getSaaSInstancesSnapshot(),
    universes,
    revenueGraph,
    thresholds,
    actions,
    optimizations,
    generatedAt: new Date().toISOString(),
  };
}

export function runUniverseOrchestrator(traceId?: string): UniverseLoopResult {
  return autoOptimizeUniverse(traceId);
}
