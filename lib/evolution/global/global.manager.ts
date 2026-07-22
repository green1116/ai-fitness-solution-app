/**
 * Evolution P5 — Global Deployment Network Manager
 */

import { listRuntimes } from "../../cloud-runtime/e11/registry/cloud.registry";
import { getOpsControlRegistryManifest } from "../../operations/control/control.manager";
import { listDeploymentPackages } from "../../product/e12/deployment/deployment.package";
import { getDashboardRegistryManifest } from "../dashboard/dashboard.manager";
import {
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_FREEZE_VERSION,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
  EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION,
} from "./global.constants";
import {
  clearDeploymentIntelligences,
  createDeploymentIntelligence,
  getDeploymentIntelligence,
  listDeploymentIntelligences,
} from "./global.deployment";
import {
  assessRegionalHealth,
  clearRegionalHealthReports,
  getRegionalHealthReport,
  listRegionalHealthReports,
} from "./global.health";
import {
  clearDeploymentOptimizations,
  getDeploymentOptimization,
  listDeploymentOptimizations,
  optimizeGlobalDeployment,
} from "./global.optimization";
import {
  assertGlobalReadinessReady,
  evaluateGlobalReadiness,
} from "./global.readiness";
import {
  clearMultiRegionProfiles,
  createMultiRegionProfile,
  getMultiRegionProfile,
  listMultiRegionProfiles,
} from "./global.region";
import {
  clearGlobalRoutingInsights,
  computeGlobalRoutingInsight,
  getGlobalRoutingInsight,
  listGlobalRoutingInsights,
} from "./global.routing";
import type {
  AssessRegionalHealthInput,
  ComputeRoutingInsightInput,
  CreateDeploymentIntelligenceInput,
  CreateMultiRegionProfileInput,
  DeploymentIntelligence,
  DeploymentOptimization,
  GlobalManagerStatus,
  GlobalReadinessResult,
  GlobalRegistryManifest,
  GlobalRoutingInsight,
  MultiRegionProfile,
  OptimizeDeploymentInput,
  RegionalHealthReport,
} from "./global.types";

export type GlobalManagerSnapshot = {
  managerId: string;
  status: GlobalManagerStatus;
  layerId: typeof EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID;
  version: typeof EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION;
  regionProfileCount: number;
  deploymentIntelligenceCount: number;
  regionalHealthCount: number;
  routingInsightCount: number;
  optimizationCount: number;
  deploymentPackageCount: number;
  cloudRuntimeCount: number;
  intelligenceDashboardCount: number;
  orchestrationCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type GlobalDeploymentNetworkManager = {
  initialize: () => GlobalManagerSnapshot;
  start: () => GlobalManagerSnapshot;
  stop: () => GlobalManagerSnapshot;
  status: () => GlobalManagerSnapshot;
  createRegion: (input: CreateMultiRegionProfileInput) => MultiRegionProfile;
  getRegion: typeof getMultiRegionProfile;
  listRegions: typeof listMultiRegionProfiles;
  createIntelligence: (
    input: CreateDeploymentIntelligenceInput,
  ) => DeploymentIntelligence;
  getIntelligence: typeof getDeploymentIntelligence;
  listIntelligences: typeof listDeploymentIntelligences;
  assessHealth: (input: AssessRegionalHealthInput) => RegionalHealthReport;
  getHealth: typeof getRegionalHealthReport;
  listHealth: typeof listRegionalHealthReports;
  computeRouting: (input: ComputeRoutingInsightInput) => GlobalRoutingInsight;
  getRouting: typeof getGlobalRoutingInsight;
  listRouting: typeof listGlobalRoutingInsights;
  optimize: (input: OptimizeDeploymentInput) => DeploymentOptimization;
  getOptimization: typeof getDeploymentOptimization;
  listOptimizations: typeof listDeploymentOptimizations;
  evaluateReadiness: (
    deploymentIntelligenceId: string,
  ) => GlobalReadinessResult;
  manifest: () => GlobalRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getGlobalRegistryManifest(): GlobalRegistryManifest {
  return {
    globalNetworkId: EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
    version: EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION,
    freezeVersion: EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_FREEZE_VERSION,
    base: EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE,
    regionProfileCount: listMultiRegionProfiles().length,
    deploymentIntelligenceCount: listDeploymentIntelligences().length,
    regionalHealthCount: listRegionalHealthReports().length,
    routingInsightCount: listGlobalRoutingInsights().length,
    optimizationCount: listDeploymentOptimizations().length,
  };
}

export function clearGlobalDeploymentNetworkLayer(): void {
  clearDeploymentOptimizations();
  clearGlobalRoutingInsights();
  clearRegionalHealthReports();
  clearDeploymentIntelligences();
  clearMultiRegionProfiles();
}

export function createGlobalDeploymentNetworkManager(options?: {
  managerId?: string;
}): GlobalDeploymentNetworkManager {
  const managerId =
    options?.managerId?.trim() || createId("evo-p5-gdn-mgr");
  let state: GlobalManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): GlobalManagerSnapshot {
    const dashReg = getDashboardRegistryManifest();
    const controlReg = getOpsControlRegistryManifest();
    const reg = getGlobalRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
      version: EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION,
      regionProfileCount: reg.regionProfileCount,
      deploymentIntelligenceCount: reg.deploymentIntelligenceCount,
      regionalHealthCount: reg.regionalHealthCount,
      routingInsightCount: reg.routingInsightCount,
      optimizationCount: reg.optimizationCount,
      deploymentPackageCount: listDeploymentPackages().length,
      cloudRuntimeCount: listRuntimes().length,
      intelligenceDashboardCount: dashReg.intelligenceDashboardCount,
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

  function initialize(): GlobalManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearGlobalDeploymentNetworkLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): GlobalManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): GlobalManagerSnapshot {
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
    createRegion: (input) => {
      assertRunning("createRegion");
      return createMultiRegionProfile(input);
    },
    getRegion: getMultiRegionProfile,
    listRegions: listMultiRegionProfiles,
    createIntelligence: (input) => {
      assertRunning("createIntelligence");
      return createDeploymentIntelligence(input);
    },
    getIntelligence: getDeploymentIntelligence,
    listIntelligences: listDeploymentIntelligences,
    assessHealth: (input) => {
      assertRunning("assessHealth");
      return assessRegionalHealth(input);
    },
    getHealth: getRegionalHealthReport,
    listHealth: listRegionalHealthReports,
    computeRouting: (input) => {
      assertRunning("computeRouting");
      return computeGlobalRoutingInsight(input);
    },
    getRouting: getGlobalRoutingInsight,
    listRouting: listGlobalRoutingInsights,
    optimize: (input) => {
      assertRunning("optimize");
      return optimizeGlobalDeployment(input);
    },
    getOptimization: getDeploymentOptimization,
    listOptimizations: listDeploymentOptimizations,
    evaluateReadiness: (deploymentIntelligenceId) => {
      assertRunning("evaluateReadiness");
      return evaluateGlobalReadiness(deploymentIntelligenceId);
    },
    manifest: getGlobalRegistryManifest,
  };
}

export { assertGlobalReadinessReady };
