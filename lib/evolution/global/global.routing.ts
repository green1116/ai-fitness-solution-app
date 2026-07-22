/**
 * Evolution P5 — Global Routing Insights
 */

import { ROUTING_STRATEGIES } from "./global.constants";
import { getDeploymentIntelligence } from "./global.deployment";
import { listRegionalHealthReports } from "./global.health";
import { getMultiRegionProfile } from "./global.region";
import type {
  ComputeRoutingInsightInput,
  GlobalRegion,
  GlobalRoutingInsight,
  RoutingStrategy,
} from "./global.types";

const insights = new Map<string, GlobalRoutingInsight>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneInsight(insight: GlobalRoutingInsight): GlobalRoutingInsight {
  return {
    ...insight,
    alternateRegions: [...insight.alternateRegions],
  };
}

export function computeGlobalRoutingInsight(
  input: ComputeRoutingInsightInput,
): GlobalRoutingInsight {
  const intel = getDeploymentIntelligence(
    input.deploymentIntelligenceId.trim(),
  );
  if (!intel) {
    throw new Error(
      `deployment intelligence not found: ${input.deploymentIntelligenceId}`,
    );
  }

  const strategy: RoutingStrategy = input.strategy ?? "LATENCY";
  if (!(ROUTING_STRATEGIES as readonly string[]).includes(strategy)) {
    throw new Error(`invalid routing strategy: ${strategy}`);
  }

  const regions = intel.regionProfileIds
    .map((id) => getMultiRegionProfile(id))
    .filter((r): r is NonNullable<typeof r> => !!r);

  if (regions.length === 0) {
    throw new Error("no region profiles available for routing");
  }

  const healthByRegion = new Map(
    listRegionalHealthReports({
      deploymentIntelligenceId: intel.id,
    }).map((h) => [h.regionProfileId, h]),
  );

  const ranked = regions
    .map((region) => {
      const health = healthByRegion.get(region.id);
      const healthScore = health?.score ?? region.weight;
      const roleBoost =
        region.role === "PRIMARY"
          ? 12
          : region.role === "EDGE"
            ? strategy === "LATENCY"
              ? 10
              : 2
            : region.role === "DR"
              ? strategy === "FAILOVER"
                ? 15
                : -5
              : 5;
      const capacityBoost =
        strategy === "CAPACITY" ? region.weight * 0.2 : 0;
      const affinityBoost =
        strategy === "AFFINITY" && region.role === "PRIMARY" ? 15 : 0;
      const score =
        healthScore + roleBoost + capacityBoost + affinityBoost;
      return { region, score, healthScore };
    })
    .sort((a, b) => b.score - a.score);

  const preferred = ranked[0]!.region.region as GlobalRegion;
  const alternateRegions = ranked
    .slice(1)
    .map((r) => r.region.region)
    .filter((r, idx, arr) => arr.indexOf(r) === idx);

  const latencyBias =
    strategy === "LATENCY"
      ? 70
      : strategy === "FAILOVER"
        ? 40
        : 50;
  const capacityBias =
    strategy === "CAPACITY"
      ? 75
      : strategy === "AFFINITY"
        ? 45
        : 55;

  const id = input.id?.trim() || createId("routeins");
  if (insights.has(id)) {
    throw new Error(`global routing insight already exists: ${id}`);
  }

  const insight: GlobalRoutingInsight = {
    id,
    deploymentIntelligenceId: intel.id,
    strategy,
    preferredRegion: preferred,
    alternateRegions,
    latencyBias,
    capacityBias,
    detail: `strategy=${strategy} preferred=${preferred} alternates=${alternateRegions.length}`,
    computedAt: nowIso(),
  };
  insights.set(id, insight);
  return cloneInsight(insight);
}

export function getGlobalRoutingInsight(
  id: string,
): GlobalRoutingInsight | undefined {
  const insight = insights.get(id.trim());
  return insight ? cloneInsight(insight) : undefined;
}

export function listGlobalRoutingInsights(filter?: {
  deploymentIntelligenceId?: string;
  strategy?: RoutingStrategy;
}): GlobalRoutingInsight[] {
  let result = [...insights.values()];
  if (filter?.deploymentIntelligenceId) {
    const iid = filter.deploymentIntelligenceId.trim();
    result = result.filter((i) => i.deploymentIntelligenceId === iid);
  }
  if (filter?.strategy) {
    result = result.filter((i) => i.strategy === filter.strategy);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneInsight);
}

export function clearGlobalRoutingInsights(): void {
  insights.clear();
}
