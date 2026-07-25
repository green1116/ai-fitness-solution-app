/**
 * Product Forecast — Forecast Trend Manager
 */

import {
  clearModels,
  getModel,
  listModels,
  registerModel,
} from "./model/model.registry";
import type {
  ForecastModel,
  RegisterModelInput,
} from "./model/model.types";
import {
  clearProjections,
  getProjection,
  listProjections,
  projectForecast,
} from "./projection/projection.registry";
import type {
  ForecastProjection,
  ProjectForecastInput,
} from "./projection/projection.types";
import {
  clearSeries,
  getSeries,
  ingestSeries,
  listSeries,
} from "./series/series.registry";
import type {
  ForecastSeries,
  IngestSeriesInput,
} from "./series/series.types";
import {
  clearTrendSignals,
  detectTrend,
  getTrendSignal,
  listTrendSignals,
} from "./signal/signal.registry";
import type {
  DetectTrendInput,
  ForecastTrendSignal,
} from "./signal/signal.types";
import {
  PRODUCT_FORECAST_TREND_BASE,
  PRODUCT_FORECAST_TREND_FREEZE_VERSION,
  PRODUCT_FORECAST_TREND_ID,
  PRODUCT_FORECAST_TREND_VERSION,
} from "./trend/trend.constants";
import {
  assertForecastTrendReadinessReady,
  evaluateForecastTrendReadiness,
} from "./trend/trend.readiness";
import type {
  ForecastManagerStatus,
  ForecastReadinessResult,
  ForecastRegistryManifest,
} from "./trend/trend.types";

export type ForecastManagerSnapshot = {
  managerId: string;
  status: ForecastManagerStatus;
  layerId: typeof PRODUCT_FORECAST_TREND_ID;
  version: typeof PRODUCT_FORECAST_TREND_VERSION;
  modelCount: number;
  seriesCount: number;
  projectionCount: number;
  trendCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ForecastManager = {
  initialize: () => ForecastManagerSnapshot;
  start: () => ForecastManagerSnapshot;
  stop: () => ForecastManagerSnapshot;
  status: () => ForecastManagerSnapshot;
  registerModel: (input: RegisterModelInput) => ForecastModel;
  ingestSeries: (input: IngestSeriesInput) => ForecastSeries;
  projectForecast: (input: ProjectForecastInput) => ForecastProjection;
  detectTrend: (input: DetectTrendInput) => ForecastTrendSignal;
  evaluateReadiness: () => ForecastReadinessResult;
  manifest: () => ForecastRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getForecastRegistryManifest(): ForecastRegistryManifest {
  return {
    trendId: PRODUCT_FORECAST_TREND_ID,
    version: PRODUCT_FORECAST_TREND_VERSION,
    freezeVersion: PRODUCT_FORECAST_TREND_FREEZE_VERSION,
    base: PRODUCT_FORECAST_TREND_BASE,
    modelCount: listModels().length,
    seriesCount: listSeries().length,
    projectionCount: listProjections().length,
    trendCount: listTrendSignals().length,
  };
}

export function clearForecastTrendLayer(): void {
  clearTrendSignals();
  clearProjections();
  clearSeries();
  clearModels();
}

export function createForecastManager(options?: {
  managerId?: string;
}): ForecastManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-fst-mgr");
  let state: ForecastManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ForecastManagerSnapshot {
    const reg = getForecastRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_FORECAST_TREND_ID,
      version: PRODUCT_FORECAST_TREND_VERSION,
      modelCount: reg.modelCount,
      seriesCount: reg.seriesCount,
      projectionCount: reg.projectionCount,
      trendCount: reg.trendCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ForecastManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearForecastTrendLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ForecastManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ForecastManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerModel: (input) => {
      assertRunning("registerModel");
      return registerModel(input);
    },
    ingestSeries: (input) => {
      assertRunning("ingestSeries");
      return ingestSeries(input);
    },
    projectForecast: (input) => {
      assertRunning("projectForecast");
      return projectForecast(input);
    },
    detectTrend: (input) => {
      assertRunning("detectTrend");
      return detectTrend(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateForecastTrendReadiness();
    },
    manifest: getForecastRegistryManifest,
  };
}

export {
  assertForecastTrendReadinessReady,
  getModel,
  getProjection,
  getSeries,
  getTrendSignal,
  listModels,
  listProjections,
  listSeries,
  listTrendSignals,
};
