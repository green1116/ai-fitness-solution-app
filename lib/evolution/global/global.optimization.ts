/**
 * Evolution P5 — Deployment Optimization
 */

import { DEPLOYMENT_OPTIMIZATION_ACTIONS } from "./global.constants";
import { getDeploymentIntelligence } from "./global.deployment";
import { listRegionalHealthReports } from "./global.health";
import { listGlobalRoutingInsights } from "./global.routing";
import type {
  DeploymentOptimization,
  DeploymentOptimizationAction,
  OptimizeDeploymentInput,
} from "./global.types";

const optimizations = new Map<string, DeploymentOptimization>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOptimization(
  item: DeploymentOptimization,
): DeploymentOptimization {
  return { ...item };
}

export function optimizeGlobalDeployment(
  input: OptimizeDeploymentInput,
): DeploymentOptimization {
  const intel = getDeploymentIntelligence(
    input.deploymentIntelligenceId.trim(),
  );
  if (!intel) {
    throw new Error(
      `deployment intelligence not found: ${input.deploymentIntelligenceId}`,
    );
  }

  const healthReports = listRegionalHealthReports({
    deploymentIntelligenceId: intel.id,
  });
  const routing = listGlobalRoutingInsights({
    deploymentIntelligenceId: intel.id,
  })[0];

  const unhealthy = healthReports.filter(
    (h) => h.level === "UNHEALTHY" || h.level === "DEGRADED",
  );
  const healthy = healthReports
    .filter((h) => h.level === "HEALTHY")
    .sort((a, b) => b.score - a.score);

  let action: DeploymentOptimizationAction = "HOLD";
  let expectedGain = 4;
  let rationale = "network steady; hold current deployment footprint";
  let targetRegion = routing?.preferredRegion;

  if (unhealthy.length > 0 && healthy.length > 0) {
    action = "FAILOVER";
    targetRegion = healthy[0]!.region;
    expectedGain = 18;
    rationale = `failover away from ${unhealthy[0]!.region} toward ${targetRegion}`;
  } else if (
    healthReports.length >= 2 &&
    Math.max(...healthReports.map((h) => h.score)) -
      Math.min(...healthReports.map((h) => h.score)) >=
      25
  ) {
    action = "REBALANCE";
    targetRegion = routing?.preferredRegion ?? healthReports[0]?.region;
    expectedGain = 12;
    rationale = "rebalance traffic across uneven regional health";
  } else if (
    intel.intelligenceScore >= 70 &&
    (healthy.length >= 1 || healthReports.length === 0)
  ) {
    action = "SCALE_OUT";
    targetRegion = routing?.preferredRegion ?? healthReports[0]?.region;
    expectedGain = 10;
    rationale = "scale-out preferred region under strong intelligence score";
  }

  if (
    !(DEPLOYMENT_OPTIMIZATION_ACTIONS as readonly string[]).includes(action)
  ) {
    throw new Error(`invalid deployment optimization action: ${action}`);
  }

  const id = input.id?.trim() || createId("deplopt");
  if (optimizations.has(id)) {
    throw new Error(`deployment optimization already exists: ${id}`);
  }

  const item: DeploymentOptimization = {
    id,
    deploymentIntelligenceId: intel.id,
    action,
    targetRegion,
    expectedGain,
    rationale,
    detail: `action=${action} gain=${expectedGain} target=${targetRegion ?? "n/a"}`,
    recommendedAt: nowIso(),
  };
  optimizations.set(id, item);
  return cloneOptimization(item);
}

export function getDeploymentOptimization(
  id: string,
): DeploymentOptimization | undefined {
  const item = optimizations.get(id.trim());
  return item ? cloneOptimization(item) : undefined;
}

export function listDeploymentOptimizations(filter?: {
  deploymentIntelligenceId?: string;
  action?: DeploymentOptimizationAction;
}): DeploymentOptimization[] {
  let result = [...optimizations.values()];
  if (filter?.deploymentIntelligenceId) {
    const iid = filter.deploymentIntelligenceId.trim();
    result = result.filter((o) => o.deploymentIntelligenceId === iid);
  }
  if (filter?.action) result = result.filter((o) => o.action === filter.action);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOptimization);
}

export function clearDeploymentOptimizations(): void {
  optimizations.clear();
}
