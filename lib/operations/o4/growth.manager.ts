/**
 * Operations O4 — Growth Analytics Foundation Manager
 */

import {
  analyzeCohort,
  clearCohortAnalyses,
  getCohortAnalysis,
  listCohortAnalyses,
} from "./cohort/cohort.analysis";
import {
  clearCohortReports,
  generateCohortReport,
  getCohortReport,
  listCohortReports,
} from "./cohort/cohort.report";
import type {
  AnalyzeCohortInput,
  CohortAnalysis,
  CohortReport,
  GenerateCohortReportInput,
} from "./cohort/cohort.types";
import {
  clearExpansionOpportunities,
  createExpansionOpportunity,
  getExpansionOpportunity,
  listExpansionOpportunities,
} from "./expansion/expansion.opportunity";
import {
  clearExpansionSignals,
  detectExpansionSignal,
  getExpansionSignal,
  listExpansionSignals,
} from "./expansion/expansion.signal";
import type {
  CreateExpansionOpportunityInput,
  DetectExpansionSignalInput,
  ExpansionOpportunity,
  ExpansionSignal,
} from "./expansion/expansion.types";
import {
  assertO4GrowthAnalyticsReadinessReady,
  evaluateO4GrowthAnalyticsReadiness,
} from "./forecast/forecast.readiness";
import {
  clearForecastModels,
  getForecastModel,
  listForecastModels,
  registerForecastModel,
} from "./forecast/forecast.model";
import {
  clearForecastPredictions,
  getForecastPrediction,
  listForecastPredictions,
  runForecastPrediction,
} from "./forecast/forecast.prediction";
import type {
  ForecastModel,
  ForecastPrediction,
  O4ManagerStatus,
  O4ReadinessResult,
  O4RegistryManifest,
  RegisterForecastModelInput,
  RunForecastPredictionInput,
} from "./forecast/forecast.types";
import {
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION,
} from "./growth/growth.constants";
import {
  clearGrowthMetrics,
  getGrowthMetrics,
  listGrowthMetrics,
  recordGrowthMetrics,
} from "./growth/growth.metrics";
import {
  clearGrowthTracking,
  getGrowthTracking,
  listGrowthTracking,
  trackGrowth,
} from "./growth/growth.tracker";
import type {
  GrowthMetrics,
  GrowthTracking,
  RecordGrowthMetricsInput,
  TrackGrowthInput,
} from "./growth/growth.types";
import {
  analyzeRetention,
  clearRetentionAnalyses,
  getRetentionAnalysis,
  listRetentionAnalyses,
} from "./retention/retention.analysis";
import {
  clearRetentionScores,
  getRetentionScore,
  listRetentionScores,
  scoreRetention,
} from "./retention/retention.score";
import type {
  AnalyzeRetentionInput,
  RetentionAnalysis,
  RetentionScore,
  ScoreRetentionInput,
} from "./retention/retention.types";

export type O4GrowthAnalyticsManagerSnapshot = {
  managerId: string;
  status: O4ManagerStatus;
  layerId: typeof OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID;
  version: typeof OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION;
  growthMetricsCount: number;
  retentionScoreCount: number;
  expansionOpportunityCount: number;
  forecastPredictionCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type O4GrowthAnalyticsManager = {
  initialize: () => O4GrowthAnalyticsManagerSnapshot;
  start: () => O4GrowthAnalyticsManagerSnapshot;
  stop: () => O4GrowthAnalyticsManagerSnapshot;
  status: () => O4GrowthAnalyticsManagerSnapshot;
  recordGrowthMetrics: (input: RecordGrowthMetricsInput) => GrowthMetrics;
  trackGrowth: (input: TrackGrowthInput) => GrowthTracking;
  scoreRetention: (input: ScoreRetentionInput) => RetentionScore;
  analyzeRetention: (input: AnalyzeRetentionInput) => RetentionAnalysis;
  detectExpansionSignal: (
    input: DetectExpansionSignalInput,
  ) => ExpansionSignal;
  createExpansionOpportunity: (
    input: CreateExpansionOpportunityInput,
  ) => ExpansionOpportunity;
  analyzeCohort: (input: AnalyzeCohortInput) => CohortAnalysis;
  generateCohortReport: (input: GenerateCohortReportInput) => CohortReport;
  registerForecastModel: (input: RegisterForecastModelInput) => ForecastModel;
  runForecastPrediction: (
    input: RunForecastPredictionInput,
  ) => ForecastPrediction;
  evaluateReadiness: () => O4ReadinessResult;
  manifest: () => O4RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getO4RegistryManifest(): O4RegistryManifest {
  return {
    foundationId: OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID,
    version: OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION,
    freezeVersion: OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION,
    base: OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE,
    growthMetricsCount: listGrowthMetrics().length,
    growthTrackingCount: listGrowthTracking().length,
    retentionScoreCount: listRetentionScores().length,
    retentionAnalysisCount: listRetentionAnalyses().length,
    expansionSignalCount: listExpansionSignals().length,
    expansionOpportunityCount: listExpansionOpportunities().length,
    cohortAnalysisCount: listCohortAnalyses().length,
    cohortReportCount: listCohortReports().length,
    forecastModelCount: listForecastModels().length,
    forecastPredictionCount: listForecastPredictions().length,
  };
}

export function clearO4GrowthAnalyticsLayer(): void {
  clearForecastPredictions();
  clearForecastModels();
  clearCohortReports();
  clearCohortAnalyses();
  clearExpansionOpportunities();
  clearExpansionSignals();
  clearRetentionAnalyses();
  clearRetentionScores();
  clearGrowthTracking();
  clearGrowthMetrics();
}

export function createO4GrowthAnalyticsManager(options?: {
  managerId?: string;
}): O4GrowthAnalyticsManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-o4-growth-mgr");
  let state: O4ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): O4GrowthAnalyticsManagerSnapshot {
    const reg = getO4RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID,
      version: OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION,
      growthMetricsCount: reg.growthMetricsCount,
      retentionScoreCount: reg.retentionScoreCount,
      expansionOpportunityCount: reg.expansionOpportunityCount,
      forecastPredictionCount: reg.forecastPredictionCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): O4GrowthAnalyticsManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearO4GrowthAnalyticsLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): O4GrowthAnalyticsManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): O4GrowthAnalyticsManagerSnapshot {
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
    recordGrowthMetrics: (input) => {
      assertRunning("recordGrowthMetrics");
      return recordGrowthMetrics(input);
    },
    trackGrowth: (input) => {
      assertRunning("trackGrowth");
      return trackGrowth(input);
    },
    scoreRetention: (input) => {
      assertRunning("scoreRetention");
      return scoreRetention(input);
    },
    analyzeRetention: (input) => {
      assertRunning("analyzeRetention");
      return analyzeRetention(input);
    },
    detectExpansionSignal: (input) => {
      assertRunning("detectExpansionSignal");
      return detectExpansionSignal(input);
    },
    createExpansionOpportunity: (input) => {
      assertRunning("createExpansionOpportunity");
      return createExpansionOpportunity(input);
    },
    analyzeCohort: (input) => {
      assertRunning("analyzeCohort");
      return analyzeCohort(input);
    },
    generateCohortReport: (input) => {
      assertRunning("generateCohortReport");
      return generateCohortReport(input);
    },
    registerForecastModel: (input) => {
      assertRunning("registerForecastModel");
      return registerForecastModel(input);
    },
    runForecastPrediction: (input) => {
      assertRunning("runForecastPrediction");
      return runForecastPrediction(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateO4GrowthAnalyticsReadiness();
    },
    manifest: getO4RegistryManifest,
  };
}

export {
  assertO4GrowthAnalyticsReadinessReady,
  getCohortAnalysis,
  getCohortReport,
  getExpansionOpportunity,
  getExpansionSignal,
  getForecastModel,
  getForecastPrediction,
  getGrowthMetrics,
  getGrowthTracking,
  getRetentionAnalysis,
  getRetentionScore,
  listCohortAnalyses,
  listCohortReports,
  listExpansionOpportunities,
  listExpansionSignals,
  listForecastModels,
  listForecastPredictions,
  listGrowthMetrics,
  listGrowthTracking,
  listRetentionAnalyses,
  listRetentionScores,
};
