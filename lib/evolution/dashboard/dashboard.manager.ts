/**
 * Evolution P4 — Enterprise Intelligence Dashboard Manager
 */

import { getOpsControlRegistryManifest } from "../../operations/control/control.manager";
import { getGrowthRegistryManifest } from "../../operations/growth/growth.manager";
import { getAutonomousCsRegistryManifest } from "../customer/customer.manager";
import { getPredictiveRegistryManifest } from "../predictive/predictive.manager";
import {
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_FREEZE_VERSION,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
  EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION,
} from "./dashboard.constants";
import {
  clearBusinessIntelligenceViews,
  getBusinessIntelligenceView,
  listBusinessIntelligenceViews,
  renderBusinessIntelligenceView,
} from "./dashboard.bi";
import {
  clearExecutiveAnalytics,
  computeExecutiveAnalytics,
  getExecutiveAnalytics,
  listExecutiveAnalytics,
} from "./dashboard.executive";
import {
  clearOperationalInsights,
  generateOperationalInsights,
  getOperationalInsight,
  listOperationalInsights,
} from "./dashboard.insights";
import {
  clearCrossPlatformMetrics,
  computeCrossPlatformMetrics,
  getCrossPlatformMetrics,
  listCrossPlatformMetrics,
} from "./dashboard.metrics";
import {
  clearIntelligenceDashboards,
  createIntelligenceDashboard,
  getIntelligenceDashboard,
  listIntelligenceDashboards,
} from "./dashboard.model";
import {
  assertDashboardReadinessReady,
  evaluateDashboardReadiness,
} from "./dashboard.readiness";
import type {
  BusinessIntelligenceView,
  ComputeCrossPlatformMetricsInput,
  ComputeExecutiveAnalyticsInput,
  CreateIntelligenceDashboardInput,
  CrossPlatformMetrics,
  DashboardManagerStatus,
  DashboardReadinessResult,
  DashboardRegistryManifest,
  ExecutiveAnalytics,
  GenerateOperationalInsightsInput,
  IntelligenceDashboard,
  OperationalInsight,
  RenderBusinessIntelligenceViewInput,
} from "./dashboard.types";

export type DashboardManagerSnapshot = {
  managerId: string;
  status: DashboardManagerStatus;
  layerId: typeof EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID;
  version: typeof EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION;
  intelligenceDashboardCount: number;
  executiveAnalyticsCount: number;
  crossPlatformMetricsCount: number;
  operationalInsightCount: number;
  businessIntelligenceViewCount: number;
  predictiveModelCount: number;
  customerIntelligenceCount: number;
  growthDashboardCount: number;
  orchestrationCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type EnterpriseIntelligenceDashboardManager = {
  initialize: () => DashboardManagerSnapshot;
  start: () => DashboardManagerSnapshot;
  stop: () => DashboardManagerSnapshot;
  status: () => DashboardManagerSnapshot;
  createDashboard: (
    input: CreateIntelligenceDashboardInput,
  ) => IntelligenceDashboard;
  getDashboard: typeof getIntelligenceDashboard;
  listDashboards: typeof listIntelligenceDashboards;
  computeExecutive: (
    input: ComputeExecutiveAnalyticsInput,
  ) => ExecutiveAnalytics;
  getExecutive: typeof getExecutiveAnalytics;
  listExecutives: typeof listExecutiveAnalytics;
  computeMetrics: (
    input: ComputeCrossPlatformMetricsInput,
  ) => CrossPlatformMetrics;
  getMetrics: typeof getCrossPlatformMetrics;
  listMetrics: typeof listCrossPlatformMetrics;
  generateInsights: (
    input: GenerateOperationalInsightsInput,
  ) => OperationalInsight[];
  getInsight: typeof getOperationalInsight;
  listInsights: typeof listOperationalInsights;
  renderBiView: (
    input: RenderBusinessIntelligenceViewInput,
  ) => BusinessIntelligenceView;
  getBiView: typeof getBusinessIntelligenceView;
  listBiViews: typeof listBusinessIntelligenceViews;
  evaluateReadiness: (
    intelligenceDashboardId: string,
  ) => DashboardReadinessResult;
  manifest: () => DashboardRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getDashboardRegistryManifest(): DashboardRegistryManifest {
  return {
    dashboardId: EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
    version: EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION,
    freezeVersion: EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_FREEZE_VERSION,
    base: EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE,
    intelligenceDashboardCount: listIntelligenceDashboards().length,
    executiveAnalyticsCount: listExecutiveAnalytics().length,
    crossPlatformMetricsCount: listCrossPlatformMetrics().length,
    operationalInsightCount: listOperationalInsights().length,
    businessIntelligenceViewCount: listBusinessIntelligenceViews().length,
  };
}

export function clearEnterpriseIntelligenceDashboardLayer(): void {
  clearBusinessIntelligenceViews();
  clearOperationalInsights();
  clearCrossPlatformMetrics();
  clearExecutiveAnalytics();
  clearIntelligenceDashboards();
}

export function createEnterpriseIntelligenceDashboardManager(options?: {
  managerId?: string;
}): EnterpriseIntelligenceDashboardManager {
  const managerId =
    options?.managerId?.trim() || createId("evo-p4-dash-mgr");
  let state: DashboardManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): DashboardManagerSnapshot {
    const predReg = getPredictiveRegistryManifest();
    const acsReg = getAutonomousCsRegistryManifest();
    const growthReg = getGrowthRegistryManifest();
    const controlReg = getOpsControlRegistryManifest();
    const reg = getDashboardRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID,
      version: EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION,
      intelligenceDashboardCount: reg.intelligenceDashboardCount,
      executiveAnalyticsCount: reg.executiveAnalyticsCount,
      crossPlatformMetricsCount: reg.crossPlatformMetricsCount,
      operationalInsightCount: reg.operationalInsightCount,
      businessIntelligenceViewCount: reg.businessIntelligenceViewCount,
      predictiveModelCount: predReg.modelCount,
      customerIntelligenceCount: acsReg.intelligenceCount,
      growthDashboardCount: growthReg.dashboardCount,
      orchestrationCount: controlReg.orchestrationCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): DashboardManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearEnterpriseIntelligenceDashboardLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): DashboardManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): DashboardManagerSnapshot {
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
    createDashboard: (input) => {
      assertRunning("createDashboard");
      return createIntelligenceDashboard(input);
    },
    getDashboard: getIntelligenceDashboard,
    listDashboards: listIntelligenceDashboards,
    computeExecutive: (input) => {
      assertRunning("computeExecutive");
      return computeExecutiveAnalytics(input);
    },
    getExecutive: getExecutiveAnalytics,
    listExecutives: listExecutiveAnalytics,
    computeMetrics: (input) => {
      assertRunning("computeMetrics");
      return computeCrossPlatformMetrics(input);
    },
    getMetrics: getCrossPlatformMetrics,
    listMetrics: listCrossPlatformMetrics,
    generateInsights: (input) => {
      assertRunning("generateInsights");
      return generateOperationalInsights(input);
    },
    getInsight: getOperationalInsight,
    listInsights: listOperationalInsights,
    renderBiView: (input) => {
      assertRunning("renderBiView");
      return renderBusinessIntelligenceView(input);
    },
    getBiView: getBusinessIntelligenceView,
    listBiViews: listBusinessIntelligenceViews,
    evaluateReadiness: (intelligenceDashboardId) => {
      assertRunning("evaluateReadiness");
      return evaluateDashboardReadiness(intelligenceDashboardId);
    },
    manifest: getDashboardRegistryManifest,
  };
}

export { assertDashboardReadinessReady };
