/**
 * Evolution P1 — AI Operations Optimization Manager
 */

import { getOpsControlRegistryManifest } from "../operations/control/control.manager";
import { getGrowthRegistryManifest } from "../operations/growth/growth.manager";
import { getSupportRegistryManifest } from "../launch/support/support.manager";
import { listRuntimes } from "../cloud-runtime/e11/registry/cloud.registry";
import {
  EVOLUTION_AI_OPS_OPTIMIZATION_BASE,
  EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION,
  EVOLUTION_AI_OPS_OPTIMIZATION_ID,
  EVOLUTION_AI_OPS_OPTIMIZATION_VERSION,
} from "./evolution.constants";
import {
  analyzeOperationsEfficiency,
  clearEfficiencyAnalyses,
  getEfficiencyAnalysis,
  listEfficiencyAnalyses,
} from "./evolution.efficiency";
import {
  clearImprovementRecords,
  getImprovementRecord,
  listImprovementRecords,
  trackImprovement,
  updateImprovement,
} from "./evolution.improvement";
import {
  clearOperationsIntelligenceProfiles,
  createOperationsIntelligenceProfile,
  getOperationsIntelligenceProfile,
  listOperationsIntelligenceProfiles,
} from "./evolution.intelligence";
import {
  assertEvolutionReadinessReady,
  evaluateEvolutionReadiness,
} from "./evolution.readiness";
import {
  clearOptimizationRecommendations,
  generateOptimizationRecommendations,
  getOptimizationRecommendation,
  listOptimizationRecommendations,
} from "./evolution.recommendation";
import {
  clearResourceInsights,
  computeResourceInsight,
  getResourceInsight,
  listResourceInsights,
} from "./evolution.resource";
import type {
  AnalyzeEfficiencyInput,
  ComputeResourceInsightInput,
  CreateOperationsIntelligenceInput,
  EfficiencyAnalysis,
  EvolutionManagerStatus,
  EvolutionReadinessResult,
  EvolutionRegistryManifest,
  GenerateRecommendationsInput,
  ImprovementRecord,
  OperationsIntelligenceProfile,
  OptimizationRecommendation,
  ResourceInsight,
  TrackImprovementInput,
  UpdateImprovementInput,
} from "./evolution.types";

export type EvolutionManagerSnapshot = {
  managerId: string;
  status: EvolutionManagerStatus;
  layerId: typeof EVOLUTION_AI_OPS_OPTIMIZATION_ID;
  version: typeof EVOLUTION_AI_OPS_OPTIMIZATION_VERSION;
  intelligenceCount: number;
  efficiencyCount: number;
  recommendationCount: number;
  resourceInsightCount: number;
  improvementCount: number;
  orchestrationCount: number;
  growthDashboardCount: number;
  supportProfileCount: number;
  cloudRuntimeCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AiOperationsOptimizationManager = {
  initialize: () => EvolutionManagerSnapshot;
  start: () => EvolutionManagerSnapshot;
  stop: () => EvolutionManagerSnapshot;
  status: () => EvolutionManagerSnapshot;
  createIntelligence: (
    input: CreateOperationsIntelligenceInput,
  ) => OperationsIntelligenceProfile;
  getIntelligence: typeof getOperationsIntelligenceProfile;
  listIntelligences: typeof listOperationsIntelligenceProfiles;
  analyzeEfficiency: (input: AnalyzeEfficiencyInput) => EfficiencyAnalysis;
  getEfficiency: typeof getEfficiencyAnalysis;
  listEfficiencies: typeof listEfficiencyAnalyses;
  generateRecommendations: (
    input: GenerateRecommendationsInput,
  ) => OptimizationRecommendation[];
  getRecommendation: typeof getOptimizationRecommendation;
  listRecommendations: typeof listOptimizationRecommendations;
  computeResource: (input: ComputeResourceInsightInput) => ResourceInsight;
  getResource: typeof getResourceInsight;
  listResources: typeof listResourceInsights;
  trackImprovement: (input: TrackImprovementInput) => ImprovementRecord;
  updateImprovement: (input: UpdateImprovementInput) => ImprovementRecord;
  getImprovement: typeof getImprovementRecord;
  listImprovements: typeof listImprovementRecords;
  evaluateReadiness: (
    intelligenceProfileId: string,
  ) => EvolutionReadinessResult;
  manifest: () => EvolutionRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getEvolutionRegistryManifest(): EvolutionRegistryManifest {
  return {
    evolutionId: EVOLUTION_AI_OPS_OPTIMIZATION_ID,
    version: EVOLUTION_AI_OPS_OPTIMIZATION_VERSION,
    freezeVersion: EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION,
    base: EVOLUTION_AI_OPS_OPTIMIZATION_BASE,
    intelligenceCount: listOperationsIntelligenceProfiles().length,
    efficiencyCount: listEfficiencyAnalyses().length,
    recommendationCount: listOptimizationRecommendations().length,
    resourceInsightCount: listResourceInsights().length,
    improvementCount: listImprovementRecords().length,
  };
}

export function clearEvolutionLayer(): void {
  clearImprovementRecords();
  clearResourceInsights();
  clearOptimizationRecommendations();
  clearEfficiencyAnalyses();
  clearOperationsIntelligenceProfiles();
}

export function createAiOperationsOptimizationManager(options?: {
  managerId?: string;
}): AiOperationsOptimizationManager {
  const managerId =
    options?.managerId?.trim() || createId("evo-p1-mgr");
  let state: EvolutionManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): EvolutionManagerSnapshot {
    const controlReg = getOpsControlRegistryManifest();
    const growthReg = getGrowthRegistryManifest();
    const supportReg = getSupportRegistryManifest();
    const reg = getEvolutionRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: EVOLUTION_AI_OPS_OPTIMIZATION_ID,
      version: EVOLUTION_AI_OPS_OPTIMIZATION_VERSION,
      intelligenceCount: reg.intelligenceCount,
      efficiencyCount: reg.efficiencyCount,
      recommendationCount: reg.recommendationCount,
      resourceInsightCount: reg.resourceInsightCount,
      improvementCount: reg.improvementCount,
      orchestrationCount: controlReg.orchestrationCount,
      growthDashboardCount: growthReg.dashboardCount,
      supportProfileCount: supportReg.profileCount,
      cloudRuntimeCount: listRuntimes().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): EvolutionManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearEvolutionLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): EvolutionManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): EvolutionManagerSnapshot {
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
    createIntelligence: (input) => {
      assertRunning("createIntelligence");
      return createOperationsIntelligenceProfile(input);
    },
    getIntelligence: getOperationsIntelligenceProfile,
    listIntelligences: listOperationsIntelligenceProfiles,
    analyzeEfficiency: (input) => {
      assertRunning("analyzeEfficiency");
      return analyzeOperationsEfficiency(input);
    },
    getEfficiency: getEfficiencyAnalysis,
    listEfficiencies: listEfficiencyAnalyses,
    generateRecommendations: (input) => {
      assertRunning("generateRecommendations");
      return generateOptimizationRecommendations(input);
    },
    getRecommendation: getOptimizationRecommendation,
    listRecommendations: listOptimizationRecommendations,
    computeResource: (input) => {
      assertRunning("computeResource");
      return computeResourceInsight(input);
    },
    getResource: getResourceInsight,
    listResources: listResourceInsights,
    trackImprovement: (input) => {
      assertRunning("trackImprovement");
      return trackImprovement(input);
    },
    updateImprovement: (input) => {
      assertRunning("updateImprovement");
      return updateImprovement(input);
    },
    getImprovement: getImprovementRecord,
    listImprovements: listImprovementRecords,
    evaluateReadiness: (intelligenceProfileId) => {
      assertRunning("evaluateReadiness");
      return evaluateEvolutionReadiness(intelligenceProfileId);
    },
    manifest: getEvolutionRegistryManifest,
  };
}

export { assertEvolutionReadinessReady };
