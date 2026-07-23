/**
 * Operations O2 — Usage Intelligence Foundation Manager
 */

import {
  analyzeActivity,
  clearActivityAnalytics,
  getActivityAnalytics,
  listActivityAnalytics,
} from "./activity/activity.analytics";
import {
  clearActivityEvents,
  getActivityEvent,
  listActivityEvents,
  recordActivityEvent,
} from "./activity/activity.event";
import type {
  ActivityAnalytics,
  ActivityEvent,
  AnalyzeActivityInput,
  RecordActivityEventInput,
} from "./activity/activity.types";
import {
  clearFeatureAdoptions,
  getFeatureAdoption,
  listFeatureAdoptions,
  recordFeatureAdoption,
} from "./feature/feature.adoption";
import {
  clearFeatureMetrics,
  computeFeatureMetrics,
  getFeatureMetrics,
  listFeatureMetrics,
} from "./feature/feature.metrics";
import type {
  ComputeFeatureMetricsInput,
  FeatureAdoption,
  FeatureMetrics,
  RecordFeatureAdoptionInput,
} from "./feature/feature.types";
import {
  clearUsageReports,
  generateUsageReport,
  getUsageReport,
  listUsageReports,
} from "./report/report.generator";
import {
  assertO2UsageIntelligenceReadinessReady,
  evaluateO2UsageIntelligenceReadiness,
} from "./report/report.readiness";
import type {
  GenerateUsageReportInput,
  O2ManagerStatus,
  O2ReadinessResult,
  O2RegistryManifest,
  UsageIntelligenceReport,
} from "./report/report.types";
import {
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION,
} from "./usage/usage.constants";
import {
  clearUsageStreams,
  getUsageStream,
  listUsageStreams,
  registerUsageStream,
} from "./usage/usage.registry";
import {
  clearUsageTracking,
  getUsageTracking,
  listUsageTracking,
  trackUsage,
} from "./usage/usage.tracking";
import type {
  RegisterUsageStreamInput,
  TrackUsageInput,
  UsageStream,
  UsageTracking,
} from "./usage/usage.types";
import {
  clearValueMetrics,
  getValueMetrics,
  listValueMetrics,
  recordValueMetrics,
} from "./value/value.metrics";
import {
  clearValueScores,
  getValueScore,
  listValueScores,
  scoreAccountValue,
} from "./value/value.score";
import type {
  RecordValueMetricsInput,
  ScoreAccountValueInput,
  ValueMetrics,
  ValueScore,
} from "./value/value.types";

export type O2UsageIntelligenceManagerSnapshot = {
  managerId: string;
  status: O2ManagerStatus;
  layerId: typeof OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID;
  version: typeof OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION;
  streamCount: number;
  trackingCount: number;
  reportCount: number;
  valueScoreCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type O2UsageIntelligenceManager = {
  initialize: () => O2UsageIntelligenceManagerSnapshot;
  start: () => O2UsageIntelligenceManagerSnapshot;
  stop: () => O2UsageIntelligenceManagerSnapshot;
  status: () => O2UsageIntelligenceManagerSnapshot;
  registerStream: (input: RegisterUsageStreamInput) => UsageStream;
  trackUsage: (input: TrackUsageInput) => UsageTracking;
  recordAdoption: (input: RecordFeatureAdoptionInput) => FeatureAdoption;
  computeFeatureMetrics: (
    input: ComputeFeatureMetricsInput,
  ) => FeatureMetrics;
  recordActivity: (input: RecordActivityEventInput) => ActivityEvent;
  analyzeActivity: (input: AnalyzeActivityInput) => ActivityAnalytics;
  recordValueMetrics: (input: RecordValueMetricsInput) => ValueMetrics;
  scoreValue: (input: ScoreAccountValueInput) => ValueScore;
  generateReport: (
    input: GenerateUsageReportInput,
  ) => UsageIntelligenceReport;
  evaluateReadiness: () => O2ReadinessResult;
  manifest: () => O2RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getO2RegistryManifest(): O2RegistryManifest {
  return {
    foundationId: OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
    version: OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION,
    freezeVersion: OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
    base: OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE,
    streamCount: listUsageStreams().length,
    trackingCount: listUsageTracking().length,
    adoptionCount: listFeatureAdoptions().length,
    featureMetricsCount: listFeatureMetrics().length,
    activityEventCount: listActivityEvents().length,
    activityAnalyticsCount: listActivityAnalytics().length,
    valueMetricsCount: listValueMetrics().length,
    valueScoreCount: listValueScores().length,
    reportCount: listUsageReports().length,
  };
}

export function clearO2UsageIntelligenceLayer(): void {
  clearUsageReports();
  clearValueScores();
  clearValueMetrics();
  clearActivityAnalytics();
  clearActivityEvents();
  clearFeatureMetrics();
  clearFeatureAdoptions();
  clearUsageTracking();
  clearUsageStreams();
}

export function createO2UsageIntelligenceManager(options?: {
  managerId?: string;
}): O2UsageIntelligenceManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-o2-usage-mgr");
  let state: O2ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): O2UsageIntelligenceManagerSnapshot {
    const reg = getO2RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
      version: OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION,
      streamCount: reg.streamCount,
      trackingCount: reg.trackingCount,
      reportCount: reg.reportCount,
      valueScoreCount: reg.valueScoreCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): O2UsageIntelligenceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearO2UsageIntelligenceLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): O2UsageIntelligenceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): O2UsageIntelligenceManagerSnapshot {
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
    registerStream: (input) => {
      assertRunning("registerStream");
      return registerUsageStream(input);
    },
    trackUsage: (input) => {
      assertRunning("trackUsage");
      return trackUsage(input);
    },
    recordAdoption: (input) => {
      assertRunning("recordAdoption");
      return recordFeatureAdoption(input);
    },
    computeFeatureMetrics: (input) => {
      assertRunning("computeFeatureMetrics");
      return computeFeatureMetrics(input);
    },
    recordActivity: (input) => {
      assertRunning("recordActivity");
      return recordActivityEvent(input);
    },
    analyzeActivity: (input) => {
      assertRunning("analyzeActivity");
      return analyzeActivity(input);
    },
    recordValueMetrics: (input) => {
      assertRunning("recordValueMetrics");
      return recordValueMetrics(input);
    },
    scoreValue: (input) => {
      assertRunning("scoreValue");
      return scoreAccountValue(input);
    },
    generateReport: (input) => {
      assertRunning("generateReport");
      return generateUsageReport(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateO2UsageIntelligenceReadiness();
    },
    manifest: getO2RegistryManifest,
  };
}

export {
  assertO2UsageIntelligenceReadinessReady,
  getActivityAnalytics,
  getActivityEvent,
  getFeatureAdoption,
  getFeatureMetrics,
  getUsageReport,
  getUsageStream,
  getUsageTracking,
  getValueMetrics,
  getValueScore,
  listActivityAnalytics,
  listActivityEvents,
  listFeatureAdoptions,
  listFeatureMetrics,
  listUsageReports,
  listUsageStreams,
  listUsageTracking,
  listValueMetrics,
  listValueScores,
};
