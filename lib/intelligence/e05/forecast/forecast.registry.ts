/**
 * E05-P4 — Forecast Registry
 * Binds forecasts onto E05 KPI definitions
 */

import { getKpiById } from "../kpi/kpi.registry";
import {
  E05_FORECAST_BASE,
  E05_FORECAST_FREEZE_VERSION,
  E05_FORECAST_RUNTIME_ID,
  E05_FORECAST_VERSION,
} from "./forecast.constants";
import type {
  ForecastDefinition,
  ForecastRegistryManifest,
} from "./forecast.types";

export const FORECAST_CATALOG: ForecastDefinition[] = [
  {
    id: "e05.forecast.opportunity",
    name: "Opportunity Forecast",
    description: "Project opportunity score trajectory",
    kpiId: "e05.kpi.opportunity",
    modelKind: "target-gap",
    horizon: "near",
    steps: 3,
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.forecast.pricing",
    name: "Pricing Forecast",
    description: "Project pricing band movement",
    kpiId: "e05.kpi.pricing",
    modelKind: "linear",
    horizon: "mid",
    steps: 4,
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.forecast.risk",
    name: "Risk Forecast",
    description: "Project risk index momentum",
    kpiId: "e05.kpi.risk",
    modelKind: "momentum",
    horizon: "near",
    steps: 3,
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.forecast.compliance",
    name: "Compliance Forecast",
    description: "Project compliance ratio toward target",
    kpiId: "e05.kpi.compliance",
    modelKind: "target-gap",
    horizon: "mid",
    steps: 4,
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.forecast.delivery",
    name: "Delivery Forecast",
    description: "Project delivery milestone coverage",
    kpiId: "e05.kpi.delivery",
    modelKind: "linear",
    horizon: "far",
    steps: 5,
    optional: false,
    readOnly: true,
  },
  {
    id: "e05.forecast.synthesis",
    name: "Synthesis Forecast",
    description: "Project synthesis index outlook",
    kpiId: "e05.kpi.synthesis",
    modelKind: "momentum",
    horizon: "mid",
    steps: 4,
    optional: true,
    readOnly: true,
  },
];

export function assertForecastDefinition(forecast: ForecastDefinition): void {
  if (!forecast.id.trim()) throw new Error("forecast.id is required");
  if (!forecast.name.trim()) throw new Error("forecast.name is required");
  if (forecast.readOnly !== true) throw new Error("readOnly must be true");
  if (forecast.steps < 1) throw new Error("forecast.steps must be >= 1");

  const kpi = getKpiById(forecast.kpiId);
  if (!kpi) {
    throw new Error(`unknown kpi: ${forecast.kpiId}`);
  }
}

export function buildForecastRegistryManifest(
  forecasts: ForecastDefinition[] = FORECAST_CATALOG,
): ForecastRegistryManifest {
  for (const forecast of forecasts) {
    assertForecastDefinition(forecast);
  }

  const required = forecasts.some((f) => !f.optional);
  if (!required) {
    throw new Error("forecast catalog missing required entry");
  }

  return {
    runtimeId: E05_FORECAST_RUNTIME_ID,
    version: E05_FORECAST_VERSION,
    freezeVersion: E05_FORECAST_FREEZE_VERSION,
    base: E05_FORECAST_BASE,
    forecastCount: forecasts.length,
    forecasts,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getForecastById(id: string): ForecastDefinition | undefined {
  return FORECAST_CATALOG.find((f) => f.id === id);
}

export function listRequiredForecasts(): ForecastDefinition[] {
  return FORECAST_CATALOG.filter((f) => !f.optional);
}
