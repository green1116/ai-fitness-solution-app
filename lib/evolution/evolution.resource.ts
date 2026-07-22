/**
 * Evolution P1 — Resource Insight
 * Integrates cloud runtime + SLA metrics + growth
 */

import {
  aggregateCloudHealth,
  checkRuntimeHealth,
} from "../cloud-runtime/e11/runtime/cloud.health";
import { listRuntimes } from "../cloud-runtime/e11/registry/cloud.registry";
import { getGrowthDashboard } from "../operations/growth/growth.dashboard";
import { computeSupportResponseMetrics } from "../launch/support/support.metrics";
import { getOperationsIntelligenceProfile } from "./evolution.intelligence";
import type {
  ComputeResourceInsightInput,
  ResourceInsight,
} from "./evolution.types";

const insights = new Map<string, ResourceInsight>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneInsight(insight: ResourceInsight): ResourceInsight {
  return { ...insight };
}

export function computeResourceInsight(
  input: ComputeResourceInsightInput,
): ResourceInsight {
  const profile = getOperationsIntelligenceProfile(
    input.intelligenceProfileId.trim(),
  );
  if (!profile) {
    throw new Error(
      `operations intelligence profile not found: ${input.intelligenceProfileId}`,
    );
  }

  const runtimes = listRuntimes();
  const aggregated = aggregateCloudHealth();
  let runtimeHealthy = aggregated.level === "HEALTHY";
  if (profile.cloudRuntimeId) {
    try {
      const report = checkRuntimeHealth(profile.cloudRuntimeId);
      runtimeHealthy = report.level === "HEALTHY";
    } catch {
      runtimeHealthy = false;
    }
  }

  let slaComplianceRate: number | undefined;
  let openSlaIncidents = 0;
  if (profile.supportSlaProfileId) {
    try {
      const sla = computeSupportResponseMetrics(profile.supportSlaProfileId);
      slaComplianceRate =
        sla.slaComplianceRate != null ? sla.slaComplianceRate : undefined;
      openSlaIncidents = sla.openCount;
    } catch {
      openSlaIncidents = 0;
    }
  }

  let growthScore: number | undefined;
  if (profile.growthDashboardId) {
    growthScore = getGrowthDashboard(profile.growthDashboardId)?.growthScore;
  }

  let utilizationHint = "balanced";
  if (!runtimeHealthy || openSlaIncidents > 0) {
    utilizationHint = "overloaded-or-at-risk";
  } else if ((growthScore ?? 0) >= 75 && runtimeHealthy) {
    utilizationHint = "headroom-for-growth";
  } else if ((growthScore ?? 0) < 40) {
    utilizationHint = "underutilized";
  }

  const id = input.id?.trim() || createId("resins");
  if (insights.has(id)) {
    throw new Error(`resource insight already exists: ${id}`);
  }

  const insight: ResourceInsight = {
    id,
    intelligenceProfileId: profile.id,
    runtimeHealthy,
    runtimeCount: runtimes.length,
    slaComplianceRate,
    openSlaIncidents,
    growthScore,
    utilizationHint,
    detail: `runtimes=${runtimes.length} cloud=${aggregated.level} hint=${utilizationHint}`,
    computedAt: nowIso(),
  };
  insights.set(id, insight);
  return cloneInsight(insight);
}

export function getResourceInsight(id: string): ResourceInsight | undefined {
  const insight = insights.get(id.trim());
  return insight ? cloneInsight(insight) : undefined;
}

export function listResourceInsights(filter?: {
  intelligenceProfileId?: string;
}): ResourceInsight[] {
  let result = [...insights.values()];
  if (filter?.intelligenceProfileId) {
    const pid = filter.intelligenceProfileId.trim();
    result = result.filter((i) => i.intelligenceProfileId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneInsight);
}

export function clearResourceInsights(): void {
  insights.clear();
}
