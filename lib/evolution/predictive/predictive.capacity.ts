/**
 * Evolution P2 — Capacity Forecasting
 * Integrates cloud runtime metrics + growth analytics
 */

import {
  aggregateCloudHealth,
  checkRuntimeHealth,
} from "../../cloud-runtime/e11/runtime/cloud.health";
import { listRuntimes } from "../../cloud-runtime/e11/registry/cloud.registry";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { getOperationsIntelligenceProfile } from "../evolution.intelligence";
import { CAPACITY_OUTLOOKS } from "./predictive.constants";
import { getPredictionModel } from "./predictive.model";
import type {
  CapacityForecast,
  CapacityOutlook,
  ForecastCapacityInput,
} from "./predictive.types";

const forecasts = new Map<string, CapacityForecast>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneForecast(forecast: CapacityForecast): CapacityForecast {
  return { ...forecast };
}

function outlookFromUtilization(util: number): CapacityOutlook {
  if (util >= 90) return "CRITICAL";
  if (util >= 75) return "TIGHT";
  if (util >= 50) return "ADEQUATE";
  if (util > 0) return "AMPLE";
  return "UNKNOWN";
}

export function forecastCapacity(
  input: ForecastCapacityInput,
): CapacityForecast {
  const model = getPredictionModel(input.predictionModelId.trim());
  if (!model) {
    throw new Error(
      `prediction model not found: ${input.predictionModelId}`,
    );
  }

  const intel = getOperationsIntelligenceProfile(model.intelligenceProfileId);
  const capacitySignal =
    intel?.signals.find((s) => s.kind === "CAPACITY")?.score ?? 60;

  let runtimeHealthy = aggregateCloudHealth().level === "HEALTHY";
  if (model.cloudRuntimeId) {
    try {
      const report = checkRuntimeHealth(model.cloudRuntimeId);
      runtimeHealthy = report.level === "HEALTHY";
    } catch {
      runtimeHealthy = false;
    }
  }

  let growthPressure = 40;
  if (model.growthDashboardId) {
    const dash = getGrowthDashboard(model.growthDashboardId);
    growthPressure = dash?.growthScore ?? 40;
  }

  const runtimeCount = Math.max(1, listRuntimes().length);
  const projectedUtilization = Math.round(
    Math.max(
      10,
      Math.min(
        98,
        100 -
          capacitySignal * 0.55 +
          growthPressure * 0.35 +
          (runtimeHealthy ? 0 : 18) +
          Math.max(0, 3 - runtimeCount) * 6,
      ),
    ),
  );
  const headroom = Math.max(0, 100 - projectedUtilization);
  const outlook = outlookFromUtilization(projectedUtilization);
  if (!(CAPACITY_OUTLOOKS as readonly string[]).includes(outlook)) {
    throw new Error(`invalid capacity outlook: ${outlook}`);
  }

  const id = input.id?.trim() || createId("capfcst");
  if (forecasts.has(id)) {
    throw new Error(`capacity forecast already exists: ${id}`);
  }

  const forecast: CapacityForecast = {
    id,
    predictionModelId: model.id,
    outlook,
    projectedUtilization,
    headroom,
    runtimeHealthy,
    growthPressure,
    detail: `outlook=${outlook} util=${projectedUtilization} headroom=${headroom}`,
    forecastAt: nowIso(),
  };
  forecasts.set(id, forecast);
  return cloneForecast(forecast);
}

export function getCapacityForecast(id: string): CapacityForecast | undefined {
  const forecast = forecasts.get(id.trim());
  return forecast ? cloneForecast(forecast) : undefined;
}

export function listCapacityForecasts(filter?: {
  predictionModelId?: string;
  outlook?: CapacityOutlook;
}): CapacityForecast[] {
  let result = [...forecasts.values()];
  if (filter?.predictionModelId) {
    const mid = filter.predictionModelId.trim();
    result = result.filter((f) => f.predictionModelId === mid);
  }
  if (filter?.outlook) {
    result = result.filter((f) => f.outlook === filter.outlook);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneForecast);
}

export function clearCapacityForecasts(): void {
  forecasts.clear();
}
