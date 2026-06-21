/**
 * V65 — Revenue universe graph (multi-SaaS revenue matrix)
 */

import { aggregateRevenueMetrics } from "@/lib/revenue/core/revenue.context";
import type { UniverseRevenueGraph } from "./universe.types";
import { getSaaSInstancesSnapshot } from "./universe.store";

export function buildUniverseRevenueGraph(): UniverseRevenueGraph {
  const instances = getSaaSInstancesSnapshot();
  const platformMetrics = aggregateRevenueMetrics();

  const nodes = instances.map((inst) => {
    const mrr = inst.mrr > 0 ? inst.mrr : Math.floor(platformMetrics.mrr / Math.max(instances.length, 1));
    return {
      instanceId: inst.id,
      industry: inst.industry,
      name: inst.name,
      mrr,
      arr: mrr * 12,
      sharePct: 0,
    };
  });

  const instanceMrr = nodes.reduce((s, n) => s + n.mrr, 0);
  const totalMrr = Math.max(instanceMrr, platformMetrics.mrr);
  const totalArr = totalMrr * 12;

  const withShare = nodes.map((n) => ({
    ...n,
    sharePct: totalMrr > 0 ? Math.round((n.mrr / totalMrr) * 100) : 0,
  }));

  if (withShare.length === 0 && platformMetrics.mrr > 0) {
    withShare.push({
      instanceId: "platform-fitness",
      industry: "fitness",
      name: "AI Fitness SaaS",
      mrr: platformMetrics.mrr,
      arr: platformMetrics.arr,
      sharePct: 100,
    });
  }

  return {
    nodes: withShare,
    totalMrr,
    totalArr,
    streamCount: withShare.length,
  };
}

export function analyzeRevenueMatrix(): {
  graph: UniverseRevenueGraph;
  diversificationScore: number;
  topStream: string;
} {
  const graph = buildUniverseRevenueGraph();
  const streamCount = graph.streamCount || 1;
  const diversificationScore = Math.min(100, streamCount * 15 + graph.nodes.length * 5);
  const top = [...graph.nodes].sort((a, b) => b.mrr - a.mrr)[0];

  return {
    graph,
    diversificationScore,
    topStream: top?.name ?? "AI Fitness SaaS",
  };
}
