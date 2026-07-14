/**
 * E05-P8 — Intelligence Platform layer version lock (read-only)
 */

import {
  E05_INTELLIGENCE_FREEZE_VERSION,
  E05_INTELLIGENCE_VERSION,
} from "../core/intelligence.constants";
import {
  E05_ANALYTICS_FREEZE_VERSION,
  E05_ANALYTICS_VERSION,
} from "../analytics/analytics.constants";
import {
  E05_KPI_FREEZE_VERSION,
  E05_KPI_VERSION,
} from "../kpi/kpi.constants";
import {
  E05_FORECAST_FREEZE_VERSION,
  E05_FORECAST_VERSION,
} from "../forecast/forecast.constants";
import {
  E05_OPTIMIZATION_FREEZE_VERSION,
  E05_OPTIMIZATION_VERSION,
} from "../optimization/optimization.constants";
import {
  E05_SIMULATION_FREEZE_VERSION,
  E05_SIMULATION_VERSION,
} from "../simulation/simulation.constants";
import {
  E05_STRATEGY_FREEZE_VERSION,
  E05_STRATEGY_VERSION,
} from "../strategy/strategy.constants";

import type { LockVersion } from "./signoff.types";
import {
  E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION,
  E05_INTELLIGENCE_SIGNOFF_VERSION,
} from "./signoff.types";

export const E05_INTELLIGENCE_LAYER_VERSION_LOCK: LockVersion = {
  foundation: E05_INTELLIGENCE_VERSION,
  analytics: E05_ANALYTICS_VERSION,
  kpi: E05_KPI_VERSION,
  forecast: E05_FORECAST_VERSION,
  optimization: E05_OPTIMIZATION_VERSION,
  simulation: E05_SIMULATION_VERSION,
  strategy: E05_STRATEGY_VERSION,
  foundationFreeze: E05_INTELLIGENCE_FREEZE_VERSION,
  analyticsFreeze: E05_ANALYTICS_FREEZE_VERSION,
  kpiFreeze: E05_KPI_FREEZE_VERSION,
  forecastFreeze: E05_FORECAST_FREEZE_VERSION,
  optimizationFreeze: E05_OPTIMIZATION_FREEZE_VERSION,
  simulationFreeze: E05_SIMULATION_FREEZE_VERSION,
  strategyFreeze: E05_STRATEGY_FREEZE_VERSION,
  signoff: E05_INTELLIGENCE_SIGNOFF_VERSION,
  freeze: E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION,
};

export const EXPECTED_INTELLIGENCE_LAYER_VERSIONS: LockVersion =
  E05_INTELLIGENCE_LAYER_VERSION_LOCK;

export function isIntelligenceLayerVersionLockIntact(): boolean {
  const lock = E05_INTELLIGENCE_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function intelligenceVersionLockMatchesExpected(): boolean {
  const lock = E05_INTELLIGENCE_LAYER_VERSION_LOCK;
  const expected = EXPECTED_INTELLIGENCE_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
