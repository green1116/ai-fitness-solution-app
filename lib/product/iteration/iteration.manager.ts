/**
 * Product Iteration — Commercial Product Iteration Foundation Manager
 */

import {
  clearBacklog,
  createBacklogItem,
  getBacklogItem,
  listBacklog,
} from "./backlog/backlog.registry";
import type {
  BacklogItem,
  CreateBacklogInput,
} from "./backlog/backlog.types";
import {
  clearCadences,
  createCadence,
  getCadence,
  listCadences,
} from "./cadence/cadence.registry";
import type {
  CreateCadenceInput,
  IterationCadence,
} from "./cadence/cadence.types";
import {
  PRODUCT_ITERATION_FOUNDATION_BASE,
  PRODUCT_ITERATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ITERATION_FOUNDATION_ID,
  PRODUCT_ITERATION_FOUNDATION_VERSION,
} from "./cycle/cycle.constants";
import {
  assertIterationFoundationReadinessReady,
  evaluateIterationFoundationReadiness,
} from "./cycle/cycle.readiness";
import {
  clearCycles,
  createCycle,
  getCycle,
  listCycles,
  updateCycleStatus,
} from "./cycle/cycle.registry";
import type {
  CreateCycleInput,
  IterationCycle,
  IterationManagerStatus,
  IterationReadinessResult,
  IterationRegistryManifest,
  UpdateCycleStatusInput,
} from "./cycle/cycle.types";
import {
  clearExperiments,
  concludeExperiment,
  createExperiment,
  getExperiment,
  listExperiments,
} from "./experiment/experiment.registry";
import type {
  ConcludeExperimentInput,
  CreateExperimentInput,
  ProductExperiment,
} from "./experiment/experiment.types";
import {
  clearImpact,
  getImpact,
  listImpact,
  scoreImpact,
} from "./impact/impact.registry";
import type { ImpactScore, ScoreImpactInput } from "./impact/impact.types";
import {
  clearRoadmap,
  createRoadmapItem,
  getRoadmapItem,
  listRoadmap,
} from "./roadmap/roadmap.registry";
import type {
  CreateRoadmapInput,
  RoadmapItem,
} from "./roadmap/roadmap.types";

export type IterationManagerSnapshot = {
  managerId: string;
  status: IterationManagerStatus;
  layerId: typeof PRODUCT_ITERATION_FOUNDATION_ID;
  version: typeof PRODUCT_ITERATION_FOUNDATION_VERSION;
  cycleCount: number;
  backlogCount: number;
  experimentCount: number;
  roadmapCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type IterationManager = {
  initialize: () => IterationManagerSnapshot;
  start: () => IterationManagerSnapshot;
  stop: () => IterationManagerSnapshot;
  status: () => IterationManagerSnapshot;
  createCycle: (input: CreateCycleInput) => IterationCycle;
  updateCycleStatus: (input: UpdateCycleStatusInput) => IterationCycle;
  createBacklogItem: (input: CreateBacklogInput) => BacklogItem;
  createExperiment: (input: CreateExperimentInput) => ProductExperiment;
  concludeExperiment: (
    input: ConcludeExperimentInput,
  ) => ProductExperiment;
  createRoadmapItem: (input: CreateRoadmapInput) => RoadmapItem;
  scoreImpact: (input: ScoreImpactInput) => ImpactScore;
  createCadence: (input: CreateCadenceInput) => IterationCadence;
  evaluateReadiness: () => IterationReadinessResult;
  manifest: () => IterationRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getIterationRegistryManifest(): IterationRegistryManifest {
  return {
    foundationId: PRODUCT_ITERATION_FOUNDATION_ID,
    version: PRODUCT_ITERATION_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_ITERATION_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_ITERATION_FOUNDATION_BASE,
    cycleCount: listCycles().length,
    backlogCount: listBacklog().length,
    experimentCount: listExperiments().length,
    roadmapCount: listRoadmap().length,
    impactCount: listImpact().length,
    cadenceCount: listCadences().length,
  };
}

export function clearIterationFoundationLayer(): void {
  clearCadences();
  clearImpact();
  clearRoadmap();
  clearExperiments();
  clearBacklog();
  clearCycles();
}

export function createIterationManager(options?: {
  managerId?: string;
}): IterationManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-iter-mgr");
  let state: IterationManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): IterationManagerSnapshot {
    const reg = getIterationRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_ITERATION_FOUNDATION_ID,
      version: PRODUCT_ITERATION_FOUNDATION_VERSION,
      cycleCount: reg.cycleCount,
      backlogCount: reg.backlogCount,
      experimentCount: reg.experimentCount,
      roadmapCount: reg.roadmapCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): IterationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearIterationFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): IterationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): IterationManagerSnapshot {
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
    createCycle: (input) => {
      assertRunning("createCycle");
      return createCycle(input);
    },
    updateCycleStatus: (input) => {
      assertRunning("updateCycleStatus");
      return updateCycleStatus(input);
    },
    createBacklogItem: (input) => {
      assertRunning("createBacklogItem");
      return createBacklogItem(input);
    },
    createExperiment: (input) => {
      assertRunning("createExperiment");
      return createExperiment(input);
    },
    concludeExperiment: (input) => {
      assertRunning("concludeExperiment");
      return concludeExperiment(input);
    },
    createRoadmapItem: (input) => {
      assertRunning("createRoadmapItem");
      return createRoadmapItem(input);
    },
    scoreImpact: (input) => {
      assertRunning("scoreImpact");
      return scoreImpact(input);
    },
    createCadence: (input) => {
      assertRunning("createCadence");
      return createCadence(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateIterationFoundationReadiness();
    },
    manifest: getIterationRegistryManifest,
  };
}

export {
  assertIterationFoundationReadinessReady,
  getBacklogItem,
  getCadence,
  getCycle,
  getExperiment,
  getImpact,
  getRoadmapItem,
  listBacklog,
  listCadences,
  listCycles,
  listExperiments,
  listImpact,
  listRoadmap,
};
