/**
 * Evolution P7 — Evolution Control Plane Manager
 */

import { getAutonomousCsRegistryManifest } from "../customer/customer.manager";
import { getDashboardRegistryManifest } from "../dashboard/dashboard.manager";
import { getEvolutionRegistryManifest } from "../evolution.manager";
import { getGlobalRegistryManifest } from "../global/global.manager";
import { getMarketplaceRegistryManifest } from "../marketplace/marketplace.manager";
import { getPredictiveRegistryManifest } from "../predictive/predictive.manager";
import {
  EVOLUTION_CONTROL_PLANE_BASE,
  EVOLUTION_CONTROL_PLANE_FREEZE_VERSION,
  EVOLUTION_CONTROL_PLANE_ID,
  EVOLUTION_CONTROL_PLANE_VERSION,
} from "./control.constants";
import {
  buildIntelligenceCommandCenter,
  clearIntelligenceCommandCenters,
  getIntelligenceCommandCenter,
  listIntelligenceCommandCenters,
} from "./control.command";
import {
  clearEvolutionDecisions,
  decideEvolution,
  getEvolutionDecision,
  listEvolutionDecisions,
} from "./control.decision";
import {
  clearAutonomousImprovementLoops,
  getAutonomousImprovementLoop,
  listAutonomousImprovementLoops,
  runAutonomousImprovementLoop,
} from "./control.loop";
import {
  clearEvolutionMetrics,
  computeEvolutionMetrics,
  getEvolutionMetrics,
  listEvolutionMetrics,
} from "./control.metrics";
import {
  activateEvolutionOrchestration,
  clearEvolutionOrchestrations,
  createEvolutionOrchestration,
  getEvolutionOrchestration,
  listEvolutionOrchestrations,
} from "./control.orchestration";
import {
  assertEvoControlReadinessReady,
  evaluateEvoControlReadiness,
} from "./control.readiness";
import type {
  AutonomousImprovementLoop,
  BuildCommandCenterInput,
  ComputeEvolutionMetricsInput,
  CreateEvolutionOrchestrationInput,
  DecideEvolutionInput,
  EvolutionDecision,
  EvolutionMetrics,
  EvolutionOrchestration,
  EvoControlManagerStatus,
  EvoControlReadinessResult,
  EvoControlRegistryManifest,
  IntelligenceCommandCenter,
  RunImprovementLoopInput,
} from "./control.types";

export type EvoControlManagerSnapshot = {
  managerId: string;
  status: EvoControlManagerStatus;
  layerId: typeof EVOLUTION_CONTROL_PLANE_ID;
  version: typeof EVOLUTION_CONTROL_PLANE_VERSION;
  orchestrationCount: number;
  commandCenterCount: number;
  loopCount: number;
  decisionCount: number;
  metricsCount: number;
  optimizationCount: number;
  predictiveCount: number;
  customerCount: number;
  dashboardCount: number;
  globalCount: number;
  marketplaceCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type EvolutionControlPlaneManager = {
  initialize: () => EvoControlManagerSnapshot;
  start: () => EvoControlManagerSnapshot;
  stop: () => EvoControlManagerSnapshot;
  status: () => EvoControlManagerSnapshot;
  createOrchestration: (
    input: CreateEvolutionOrchestrationInput,
  ) => EvolutionOrchestration;
  activateOrchestration: (id: string) => EvolutionOrchestration;
  getOrchestration: typeof getEvolutionOrchestration;
  listOrchestrations: typeof listEvolutionOrchestrations;
  buildCommandCenter: (
    input: BuildCommandCenterInput,
  ) => IntelligenceCommandCenter;
  getCommandCenter: typeof getIntelligenceCommandCenter;
  listCommandCenters: typeof listIntelligenceCommandCenters;
  runLoop: (input: RunImprovementLoopInput) => AutonomousImprovementLoop;
  getLoop: typeof getAutonomousImprovementLoop;
  listLoops: typeof listAutonomousImprovementLoops;
  decide: (input: DecideEvolutionInput) => EvolutionDecision;
  getDecision: typeof getEvolutionDecision;
  listDecisions: typeof listEvolutionDecisions;
  computeMetrics: (input: ComputeEvolutionMetricsInput) => EvolutionMetrics;
  getMetrics: typeof getEvolutionMetrics;
  listMetrics: typeof listEvolutionMetrics;
  evaluateReadiness: (orchestrationId: string) => EvoControlReadinessResult;
  manifest: () => EvoControlRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getEvoControlRegistryManifest(): EvoControlRegistryManifest {
  return {
    controlPlaneId: EVOLUTION_CONTROL_PLANE_ID,
    version: EVOLUTION_CONTROL_PLANE_VERSION,
    freezeVersion: EVOLUTION_CONTROL_PLANE_FREEZE_VERSION,
    base: EVOLUTION_CONTROL_PLANE_BASE,
    orchestrationCount: listEvolutionOrchestrations().length,
    commandCenterCount: listIntelligenceCommandCenters().length,
    loopCount: listAutonomousImprovementLoops().length,
    decisionCount: listEvolutionDecisions().length,
    metricsCount: listEvolutionMetrics().length,
  };
}

export function clearEvolutionControlLayer(): void {
  clearEvolutionMetrics();
  clearEvolutionDecisions();
  clearAutonomousImprovementLoops();
  clearIntelligenceCommandCenters();
  clearEvolutionOrchestrations();
}

export function createEvolutionControlPlaneManager(options?: {
  managerId?: string;
}): EvolutionControlPlaneManager {
  const managerId =
    options?.managerId?.trim() || createId("evo-p7-ctrl-mgr");
  let state: EvoControlManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): EvoControlManagerSnapshot {
    const evoReg = getEvolutionRegistryManifest();
    const predReg = getPredictiveRegistryManifest();
    const acsReg = getAutonomousCsRegistryManifest();
    const dashReg = getDashboardRegistryManifest();
    const globalReg = getGlobalRegistryManifest();
    const mktReg = getMarketplaceRegistryManifest();
    const reg = getEvoControlRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: EVOLUTION_CONTROL_PLANE_ID,
      version: EVOLUTION_CONTROL_PLANE_VERSION,
      orchestrationCount: reg.orchestrationCount,
      commandCenterCount: reg.commandCenterCount,
      loopCount: reg.loopCount,
      decisionCount: reg.decisionCount,
      metricsCount: reg.metricsCount,
      optimizationCount: evoReg.intelligenceCount,
      predictiveCount: predReg.modelCount,
      customerCount: acsReg.intelligenceCount,
      dashboardCount: dashReg.intelligenceDashboardCount,
      globalCount: globalReg.deploymentIntelligenceCount,
      marketplaceCount: mktReg.marketplaceCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): EvoControlManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearEvolutionControlLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): EvoControlManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): EvoControlManagerSnapshot {
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
    createOrchestration: (input) => {
      assertRunning("createOrchestration");
      return createEvolutionOrchestration(input);
    },
    activateOrchestration: (id) => {
      assertRunning("activateOrchestration");
      return activateEvolutionOrchestration(id);
    },
    getOrchestration: getEvolutionOrchestration,
    listOrchestrations: listEvolutionOrchestrations,
    buildCommandCenter: (input) => {
      assertRunning("buildCommandCenter");
      return buildIntelligenceCommandCenter(input);
    },
    getCommandCenter: getIntelligenceCommandCenter,
    listCommandCenters: listIntelligenceCommandCenters,
    runLoop: (input) => {
      assertRunning("runLoop");
      return runAutonomousImprovementLoop(input);
    },
    getLoop: getAutonomousImprovementLoop,
    listLoops: listAutonomousImprovementLoops,
    decide: (input) => {
      assertRunning("decide");
      return decideEvolution(input);
    },
    getDecision: getEvolutionDecision,
    listDecisions: listEvolutionDecisions,
    computeMetrics: (input) => {
      assertRunning("computeMetrics");
      return computeEvolutionMetrics(input);
    },
    getMetrics: getEvolutionMetrics,
    listMetrics: listEvolutionMetrics,
    evaluateReadiness: (orchestrationId) => {
      assertRunning("evaluateReadiness");
      return evaluateEvoControlReadiness(orchestrationId);
    },
    manifest: getEvoControlRegistryManifest,
  };
}

export { assertEvoControlReadinessReady };
