/**
 * Product Analytics — Analytics Foundation Manager
 */

import {
  clearDatasets,
  getDataset,
  listDatasets,
  registerDataset,
  updateDatasetStatus,
} from "./dataset/dataset.registry";
import type {
  AnalyticsDataset,
  RegisterDatasetInput,
  UpdateDatasetStatusInput,
} from "./dataset/dataset.types";
import {
  PRODUCT_ANALYTICS_FOUNDATION_BASE,
  PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ANALYTICS_FOUNDATION_ID,
  PRODUCT_ANALYTICS_FOUNDATION_VERSION,
} from "./foundation/foundation.constants";
import {
  assertAnalyticsFoundationReadinessReady,
  evaluateAnalyticsFoundationReadiness,
} from "./foundation/foundation.readiness";
import type {
  AnalyticsManagerStatus,
  AnalyticsReadinessResult,
  AnalyticsRegistryManifest,
} from "./foundation/foundation.types";
import {
  clearMetrics,
  getMetric,
  listMetrics,
  registerMetric,
} from "./metric/metric.registry";
import type {
  AnalyticsMetric,
  RegisterMetricInput,
} from "./metric/metric.types";
import {
  clearPipelines,
  createPipeline,
  getPipeline,
  listPipelines,
  runPipeline,
} from "./pipeline/pipeline.registry";
import type {
  AnalyticsPipeline,
  CreatePipelineInput,
  RunPipelineInput,
} from "./pipeline/pipeline.types";
import {
  clearReports,
  generateReport,
  getReport,
  listReports,
} from "./report/report.registry";
import type {
  AnalyticsReport,
  GenerateReportInput,
} from "./report/report.types";

export type AnalyticsManagerSnapshot = {
  managerId: string;
  status: AnalyticsManagerStatus;
  layerId: typeof PRODUCT_ANALYTICS_FOUNDATION_ID;
  version: typeof PRODUCT_ANALYTICS_FOUNDATION_VERSION;
  metricCount: number;
  datasetCount: number;
  pipelineCount: number;
  reportCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AnalyticsManager = {
  initialize: () => AnalyticsManagerSnapshot;
  start: () => AnalyticsManagerSnapshot;
  stop: () => AnalyticsManagerSnapshot;
  status: () => AnalyticsManagerSnapshot;
  registerMetric: (input: RegisterMetricInput) => AnalyticsMetric;
  registerDataset: (input: RegisterDatasetInput) => AnalyticsDataset;
  updateDatasetStatus: (
    input: UpdateDatasetStatusInput,
  ) => AnalyticsDataset;
  createPipeline: (input: CreatePipelineInput) => AnalyticsPipeline;
  runPipeline: (input: RunPipelineInput) => AnalyticsPipeline;
  generateReport: (input: GenerateReportInput) => AnalyticsReport;
  evaluateReadiness: () => AnalyticsReadinessResult;
  manifest: () => AnalyticsRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getAnalyticsRegistryManifest(): AnalyticsRegistryManifest {
  return {
    foundationId: PRODUCT_ANALYTICS_FOUNDATION_ID,
    version: PRODUCT_ANALYTICS_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_ANALYTICS_FOUNDATION_BASE,
    metricCount: listMetrics().length,
    datasetCount: listDatasets().length,
    pipelineCount: listPipelines().length,
    reportCount: listReports().length,
  };
}

export function clearAnalyticsFoundationLayer(): void {
  clearReports();
  clearPipelines();
  clearDatasets();
  clearMetrics();
}

export function createAnalyticsManager(options?: {
  managerId?: string;
}): AnalyticsManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-anl-mgr");
  let state: AnalyticsManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AnalyticsManagerSnapshot {
    const reg = getAnalyticsRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_ANALYTICS_FOUNDATION_ID,
      version: PRODUCT_ANALYTICS_FOUNDATION_VERSION,
      metricCount: reg.metricCount,
      datasetCount: reg.datasetCount,
      pipelineCount: reg.pipelineCount,
      reportCount: reg.reportCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): AnalyticsManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAnalyticsFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AnalyticsManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): AnalyticsManagerSnapshot {
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
    registerMetric: (input) => {
      assertRunning("registerMetric");
      return registerMetric(input);
    },
    registerDataset: (input) => {
      assertRunning("registerDataset");
      return registerDataset(input);
    },
    updateDatasetStatus: (input) => {
      assertRunning("updateDatasetStatus");
      return updateDatasetStatus(input);
    },
    createPipeline: (input) => {
      assertRunning("createPipeline");
      return createPipeline(input);
    },
    runPipeline: (input) => {
      assertRunning("runPipeline");
      return runPipeline(input);
    },
    generateReport: (input) => {
      assertRunning("generateReport");
      return generateReport(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateAnalyticsFoundationReadiness();
    },
    manifest: getAnalyticsRegistryManifest,
  };
}

export {
  assertAnalyticsFoundationReadinessReady,
  getDataset,
  getMetric,
  getPipeline,
  getReport,
  listDatasets,
  listMetrics,
  listPipelines,
  listReports,
};
