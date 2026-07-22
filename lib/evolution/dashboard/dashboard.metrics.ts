/**
 * Evolution P4 — Cross-Platform Metrics
 */

import { aggregateOperationsHealth } from "../../operations/control/control.health";
import { getExecutiveOpsDashboard } from "../../operations/control/control.dashboard";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { listRuntimes } from "../../cloud-runtime/e11/registry/cloud.registry";
import { aggregateCloudHealth } from "../../cloud-runtime/e11/runtime/cloud.health";
import { getCustomerIntelligenceProfile } from "../customer/customer.intelligence";
import { getPredictionModel } from "../predictive/predictive.model";
import { CROSS_PLATFORM_DOMAINS } from "./dashboard.constants";
import { getIntelligenceDashboard } from "./dashboard.model";
import type {
  ComputeCrossPlatformMetricsInput,
  CrossPlatformMetric,
  CrossPlatformMetrics,
} from "./dashboard.types";

const metricsStore = new Map<string, CrossPlatformMetrics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetrics(item: CrossPlatformMetrics): CrossPlatformMetrics {
  return {
    ...item,
    metrics: item.metrics.map((m) => ({ ...m })),
  };
}

export function computeCrossPlatformMetrics(
  input: ComputeCrossPlatformMetricsInput,
): CrossPlatformMetrics {
  const dashboard = getIntelligenceDashboard(
    input.intelligenceDashboardId.trim(),
  );
  if (!dashboard) {
    throw new Error(
      `intelligence dashboard not found: ${input.intelligenceDashboardId}`,
    );
  }

  const metrics: CrossPlatformMetric[] = [];

  const model = dashboard.predictionModelId
    ? getPredictionModel(dashboard.predictionModelId)
    : undefined;
  metrics.push({
    domain: "PREDICTIVE",
    score: model?.confidence ?? 0,
    label: "Predictive intelligence",
    present: !!model,
  });

  const cs = dashboard.customerIntelligenceId
    ? getCustomerIntelligenceProfile(dashboard.customerIntelligenceId)
    : undefined;
  metrics.push({
    domain: "CUSTOMER",
    score: cs?.intelligenceScore ?? 0,
    label: "Autonomous customer success",
    present: !!cs,
  });

  const growth = dashboard.growthDashboardId
    ? getGrowthDashboard(dashboard.growthDashboardId)
    : undefined;
  metrics.push({
    domain: "GROWTH",
    score: growth?.growthScore ?? 0,
    label: "Growth analytics",
    present: !!growth,
  });

  let opsScore = 0;
  let opsPresent = false;
  if (dashboard.executiveOpsDashboardId) {
    const exec = getExecutiveOpsDashboard(dashboard.executiveOpsDashboardId);
    opsScore = exec?.executiveScore ?? 0;
    opsPresent = !!exec;
  } else {
    try {
      const health = aggregateOperationsHealth(dashboard.orchestrationId);
      opsScore = health.overallScore;
      opsPresent = true;
    } catch {
      opsPresent = false;
    }
  }
  metrics.push({
    domain: "OPERATIONS",
    score: opsScore,
    label: "Operations control plane",
    present: opsPresent,
  });

  const cloud = aggregateCloudHealth();
  const cloudScore =
    cloud.level === "HEALTHY"
      ? 90
      : cloud.level === "DEGRADED"
        ? 55
        : cloud.level === "UNHEALTHY"
          ? 25
          : listRuntimes().length > 0
            ? 40
            : 0;
  metrics.push({
    domain: "CLOUD",
    score: cloudScore,
    label: "Cloud runtime",
    present: listRuntimes().length > 0,
  });

  for (const metric of metrics) {
    if (!(CROSS_PLATFORM_DOMAINS as readonly string[]).includes(metric.domain)) {
      throw new Error(`invalid cross-platform domain: ${metric.domain}`);
    }
  }

  const presentCount = metrics.filter((m) => m.present).length;
  const coverage = Math.round((presentCount / metrics.length) * 100);

  const id = input.id?.trim() || createId("xplat");
  if (metricsStore.has(id)) {
    throw new Error(`cross-platform metrics already exists: ${id}`);
  }

  const item: CrossPlatformMetrics = {
    id,
    intelligenceDashboardId: dashboard.id,
    metrics,
    coverage,
    detail: `coverage=${coverage}% domains=${presentCount}/${metrics.length}`,
    computedAt: nowIso(),
  };
  metricsStore.set(id, item);
  return cloneMetrics(item);
}

export function getCrossPlatformMetrics(
  id: string,
): CrossPlatformMetrics | undefined {
  const item = metricsStore.get(id.trim());
  return item ? cloneMetrics(item) : undefined;
}

export function listCrossPlatformMetrics(filter?: {
  intelligenceDashboardId?: string;
}): CrossPlatformMetrics[] {
  let result = [...metricsStore.values()];
  if (filter?.intelligenceDashboardId) {
    const did = filter.intelligenceDashboardId.trim();
    result = result.filter((m) => m.intelligenceDashboardId === did);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetrics);
}

export function clearCrossPlatformMetrics(): void {
  metricsStore.clear();
}
