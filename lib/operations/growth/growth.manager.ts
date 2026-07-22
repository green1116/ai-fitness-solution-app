/**
 * Post-Launch P5 — Growth Analytics Operations Manager
 */

import { getApiProductRegistryManifest } from "../../product/e12/api/api.manager";
import { getBillingCommercialRegistryManifest } from "../../product/e12/billing/billing.manager";
import { getCommercialControlRegistryManifest } from "../../product/e12/commercial/commercial.manager";
import { getCustomerSuccessRegistryManifest } from "../customer-success/success.manager";
import { getReleaseRegistryManifest } from "../release/release.manager";
import {
  clearGrowthAdoptionMetrics,
  computeGrowthAdoptionMetrics,
  getGrowthAdoptionMetrics,
  listGrowthAdoptionMetrics,
} from "./growth.adoption";
import {
  OPERATIONS_GROWTH_ANALYTICS_BASE,
  OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION,
  OPERATIONS_GROWTH_ANALYTICS_ID,
  OPERATIONS_GROWTH_ANALYTICS_VERSION,
} from "./growth.constants";
import {
  buildGrowthDashboard,
  clearGrowthDashboards,
  getGrowthDashboard,
  listGrowthDashboards,
} from "./growth.dashboard";
import {
  clearExpansionSignals,
  detectExpansionSignals,
  getExpansionSignal,
  listExpansionSignals,
} from "./growth.expansion";
import {
  assertGrowthReadinessReady,
  evaluateGrowthReadiness,
} from "./growth.readiness";
import {
  clearRevenueInsights,
  computeRevenueInsights,
  getRevenueInsights,
  listRevenueInsights,
} from "./growth.revenue";
import {
  clearUsageAnalyticsSnapshots,
  computeUsageAnalytics,
  getUsageAnalyticsSnapshot,
  listUsageAnalyticsSnapshots,
} from "./growth.usage";
import type {
  BuildGrowthDashboardInput,
  ComputeGrowthAdoptionInput,
  ComputeRevenueInsightsInput,
  ComputeUsageAnalyticsInput,
  DetectExpansionSignalsInput,
  ExpansionSignal,
  GrowthAdoptionMetrics,
  GrowthDashboard,
  GrowthManagerStatus,
  GrowthReadinessResult,
  GrowthRegistryManifest,
  RevenueInsights,
  UsageAnalyticsSnapshot,
} from "./growth.types";

export type GrowthManagerSnapshot = {
  managerId: string;
  status: GrowthManagerStatus;
  layerId: typeof OPERATIONS_GROWTH_ANALYTICS_ID;
  version: typeof OPERATIONS_GROWTH_ANALYTICS_VERSION;
  usageSnapshotCount: number;
  adoptionMetricCount: number;
  expansionSignalCount: number;
  revenueInsightCount: number;
  dashboardCount: number;
  customerHealthProfileCount: number;
  billingSubscriptionCount: number;
  apiUsageLinked: number;
  commercialCustomerCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type GrowthAnalyticsOperationsManager = {
  initialize: () => GrowthManagerSnapshot;
  start: () => GrowthManagerSnapshot;
  stop: () => GrowthManagerSnapshot;
  status: () => GrowthManagerSnapshot;
  computeUsage: (input: ComputeUsageAnalyticsInput) => UsageAnalyticsSnapshot;
  getUsage: typeof getUsageAnalyticsSnapshot;
  listUsage: typeof listUsageAnalyticsSnapshots;
  computeAdoption: (
    input: ComputeGrowthAdoptionInput,
  ) => GrowthAdoptionMetrics;
  getAdoption: typeof getGrowthAdoptionMetrics;
  listAdoptions: typeof listGrowthAdoptionMetrics;
  detectExpansion: (input: DetectExpansionSignalsInput) => ExpansionSignal[];
  getExpansion: typeof getExpansionSignal;
  listExpansions: typeof listExpansionSignals;
  computeRevenue: (input: ComputeRevenueInsightsInput) => RevenueInsights;
  getRevenue: typeof getRevenueInsights;
  listRevenues: typeof listRevenueInsights;
  buildDashboard: (input: BuildGrowthDashboardInput) => GrowthDashboard;
  getDashboard: typeof getGrowthDashboard;
  listDashboards: typeof listGrowthDashboards;
  evaluateReadiness: (dashboardId: string) => GrowthReadinessResult;
  manifest: () => GrowthRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getGrowthRegistryManifest(): GrowthRegistryManifest {
  return {
    growthAnalyticsId: OPERATIONS_GROWTH_ANALYTICS_ID,
    version: OPERATIONS_GROWTH_ANALYTICS_VERSION,
    freezeVersion: OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION,
    base: OPERATIONS_GROWTH_ANALYTICS_BASE,
    usageSnapshotCount: listUsageAnalyticsSnapshots().length,
    adoptionMetricCount: listGrowthAdoptionMetrics().length,
    expansionSignalCount: listExpansionSignals().length,
    revenueInsightCount: listRevenueInsights().length,
    dashboardCount: listGrowthDashboards().length,
  };
}

export function clearGrowthAnalyticsLayer(): void {
  clearGrowthDashboards();
  clearExpansionSignals();
  clearRevenueInsights();
  clearGrowthAdoptionMetrics();
  clearUsageAnalyticsSnapshots();
}

export function createGrowthAnalyticsOperationsManager(options?: {
  managerId?: string;
}): GrowthAnalyticsOperationsManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-p5-ga-mgr");
  let state: GrowthManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): GrowthManagerSnapshot {
    const csReg = getCustomerSuccessRegistryManifest();
    const billingReg = getBillingCommercialRegistryManifest();
    const apiReg = getApiProductRegistryManifest();
    const commercialReg = getCommercialControlRegistryManifest();
    const releaseReg = getReleaseRegistryManifest();
    const reg = getGrowthRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_GROWTH_ANALYTICS_ID,
      version: OPERATIONS_GROWTH_ANALYTICS_VERSION,
      usageSnapshotCount: reg.usageSnapshotCount,
      adoptionMetricCount: reg.adoptionMetricCount,
      expansionSignalCount: reg.expansionSignalCount,
      revenueInsightCount: reg.revenueInsightCount,
      dashboardCount: reg.dashboardCount,
      customerHealthProfileCount: csReg.healthProfileCount,
      billingSubscriptionCount: billingReg.billingSubscriptionCount,
      apiUsageLinked: apiReg.usageRecordCount,
      commercialCustomerCount: commercialReg.customerCount,
      releaseCount: releaseReg.releaseCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): GrowthManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearGrowthAnalyticsLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): GrowthManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): GrowthManagerSnapshot {
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
    computeUsage: (input) => {
      assertRunning("computeUsage");
      return computeUsageAnalytics(input);
    },
    getUsage: getUsageAnalyticsSnapshot,
    listUsage: listUsageAnalyticsSnapshots,
    computeAdoption: (input) => {
      assertRunning("computeAdoption");
      return computeGrowthAdoptionMetrics(input);
    },
    getAdoption: getGrowthAdoptionMetrics,
    listAdoptions: listGrowthAdoptionMetrics,
    detectExpansion: (input) => {
      assertRunning("detectExpansion");
      return detectExpansionSignals(input);
    },
    getExpansion: getExpansionSignal,
    listExpansions: listExpansionSignals,
    computeRevenue: (input) => {
      assertRunning("computeRevenue");
      return computeRevenueInsights(input);
    },
    getRevenue: getRevenueInsights,
    listRevenues: listRevenueInsights,
    buildDashboard: (input) => {
      assertRunning("buildDashboard");
      return buildGrowthDashboard(input);
    },
    getDashboard: getGrowthDashboard,
    listDashboards: listGrowthDashboards,
    evaluateReadiness: (dashboardId) => {
      assertRunning("evaluateReadiness");
      return evaluateGrowthReadiness(dashboardId);
    },
    manifest: getGrowthRegistryManifest,
  };
}

export { assertGrowthReadinessReady };
