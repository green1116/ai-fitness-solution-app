/**
 * Commercialization P6 — Revenue Intelligence Manager
 */

import {
  calculateAnalyticsMetric,
  clearAnalyticsCalculations,
  getAnalyticsCalculation,
  listAnalyticsCalculations,
} from "./analytics/analytics.calculator";
import {
  clearAnalyticsSnapshots,
  getAnalyticsSnapshot,
  listAnalyticsSnapshots,
  runRevenueAnalytics,
} from "./analytics/analytics.engine";
import type {
  AnalyticsCalculation,
  AnalyticsSnapshot,
  CalculateAnalyticsInput,
  RunAnalyticsInput,
} from "./analytics/analytics.types";
import {
  assessCustomerHealth,
  clearCustomerHealthProfiles,
  getCustomerHealthProfile,
  listCustomerHealthProfiles,
} from "./customer/customer.health";
import {
  clearCustomerScoreCards,
  getCustomerScoreCard,
  listCustomerScoreCards,
  scoreCustomer,
} from "./customer/customer.score";
import {
  captureCustomerValue,
  clearCustomerValueProfiles,
  getCustomerValueProfile,
  listCustomerValueProfiles,
} from "./customer/customer.value";
import type {
  AssessCustomerHealthInput,
  CaptureCustomerValueInput,
  CustomerHealthProfile,
  CustomerScoreCard,
  CustomerValueProfile,
  ScoreCustomerInput,
} from "./customer/customer.types";
import {
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION,
} from "./kpi/kpi.constants";
import {
  clearRevenueKpis,
  getRevenueKpi,
  listRevenueKpis,
  registerKpi,
} from "./kpi/kpi.registry";
import type { RegisterKpiInput, RevenueKpi } from "./kpi/kpi.types";
import {
  clearRevenueReports,
  generateRevenueReport,
  getRevenueReport,
  listRevenueReports,
} from "./report/report.generator";
import {
  assertRevenueIntelligenceReadinessReady,
  evaluateRevenueIntelligenceReadiness,
} from "./report/report.readiness";
import type {
  GenerateReportInput,
  RevenueManagerStatus,
  RevenueReadinessResult,
  RevenueRegistryManifest,
  RevenueReport,
} from "./report/report.types";
import {
  clearRevenueMetrics,
  computeRevenueMetrics,
  getRevenueMetrics,
  listRevenueMetrics,
} from "./revenue/revenue.metrics";
import {
  clearRevenueStreams,
  getRevenueStream,
  listRevenueStreams,
  registerRevenueStream,
} from "./revenue/revenue.registry";
import type {
  ComputeRevenueMetricsInput,
  RegisterRevenueStreamInput,
  RevenueMetrics,
  RevenueStream,
} from "./revenue/revenue.types";

export type RevenueIntelligenceManagerSnapshot = {
  managerId: string;
  status: RevenueManagerStatus;
  layerId: typeof COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID;
  version: typeof COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION;
  streamCount: number;
  metricsCount: number;
  analyticsCount: number;
  kpiCount: number;
  scoreCount: number;
  reportCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type RevenueIntelligenceManager = {
  initialize: () => RevenueIntelligenceManagerSnapshot;
  start: () => RevenueIntelligenceManagerSnapshot;
  stop: () => RevenueIntelligenceManagerSnapshot;
  status: () => RevenueIntelligenceManagerSnapshot;
  registerStream: (input: RegisterRevenueStreamInput) => RevenueStream;
  computeMetrics: (input?: ComputeRevenueMetricsInput) => RevenueMetrics;
  runAnalytics: (input?: RunAnalyticsInput) => AnalyticsSnapshot;
  calculateAnalytics: (
    input: CalculateAnalyticsInput,
  ) => AnalyticsCalculation;
  registerKpi: (input: RegisterKpiInput) => RevenueKpi;
  captureValue: (input: CaptureCustomerValueInput) => CustomerValueProfile;
  assessHealth: (input: AssessCustomerHealthInput) => CustomerHealthProfile;
  scoreCustomer: (input: ScoreCustomerInput) => CustomerScoreCard;
  generateReport: (input: GenerateReportInput) => RevenueReport;
  evaluateReadiness: () => RevenueReadinessResult;
  manifest: () => RevenueRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getRevenueRegistryManifest(): RevenueRegistryManifest {
  return {
    foundationId: COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
    version: COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION,
    freezeVersion: COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION,
    base: COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE,
    streamCount: listRevenueStreams().length,
    metricsCount: listRevenueMetrics().length,
    analyticsCount: listAnalyticsSnapshots().length,
    calculationCount: listAnalyticsCalculations().length,
    kpiCount: listRevenueKpis().length,
    valueCount: listCustomerValueProfiles().length,
    healthCount: listCustomerHealthProfiles().length,
    scoreCount: listCustomerScoreCards().length,
    reportCount: listRevenueReports().length,
  };
}

export function clearRevenueIntelligenceLayer(): void {
  clearRevenueReports();
  clearCustomerScoreCards();
  clearCustomerHealthProfiles();
  clearCustomerValueProfiles();
  clearRevenueKpis();
  clearAnalyticsCalculations();
  clearAnalyticsSnapshots();
  clearRevenueMetrics();
  clearRevenueStreams();
}

export function createRevenueIntelligenceManager(options?: {
  managerId?: string;
}): RevenueIntelligenceManager {
  const managerId =
    options?.managerId?.trim() || createId("comm-p6-rev-mgr");
  let state: RevenueManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): RevenueIntelligenceManagerSnapshot {
    const reg = getRevenueRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
      version: COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION,
      streamCount: reg.streamCount,
      metricsCount: reg.metricsCount,
      analyticsCount: reg.analyticsCount,
      kpiCount: reg.kpiCount,
      scoreCount: reg.scoreCount,
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

  function initialize(): RevenueIntelligenceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearRevenueIntelligenceLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): RevenueIntelligenceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): RevenueIntelligenceManagerSnapshot {
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
      return registerRevenueStream(input);
    },
    computeMetrics: (input) => {
      assertRunning("computeMetrics");
      return computeRevenueMetrics(input);
    },
    runAnalytics: (input) => {
      assertRunning("runAnalytics");
      return runRevenueAnalytics(input);
    },
    calculateAnalytics: (input) => {
      assertRunning("calculateAnalytics");
      return calculateAnalyticsMetric(input);
    },
    registerKpi: (input) => {
      assertRunning("registerKpi");
      return registerKpi(input);
    },
    captureValue: (input) => {
      assertRunning("captureValue");
      return captureCustomerValue(input);
    },
    assessHealth: (input) => {
      assertRunning("assessHealth");
      return assessCustomerHealth(input);
    },
    scoreCustomer: (input) => {
      assertRunning("scoreCustomer");
      return scoreCustomer(input);
    },
    generateReport: (input) => {
      assertRunning("generateReport");
      return generateRevenueReport(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateRevenueIntelligenceReadiness();
    },
    manifest: getRevenueRegistryManifest,
  };
}

export {
  assertRevenueIntelligenceReadinessReady,
  getAnalyticsCalculation,
  getAnalyticsSnapshot,
  getCustomerHealthProfile,
  getCustomerScoreCard,
  getCustomerValueProfile,
  getRevenueKpi,
  getRevenueMetrics,
  getRevenueReport,
  getRevenueStream,
  listAnalyticsCalculations,
  listAnalyticsSnapshots,
  listCustomerHealthProfiles,
  listCustomerScoreCards,
  listCustomerValueProfiles,
  listRevenueKpis,
  listRevenueMetrics,
  listRevenueReports,
  listRevenueStreams,
};
