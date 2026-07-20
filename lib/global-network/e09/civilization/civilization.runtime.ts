/**
 * E09-P7 — Civilization Runtime
 * Instance-based runtime: initialize → start → stop + status
 */

import {
  E09_CIVILIZATION_ID,
  E09_CIVILIZATION_VERSION,
  CIVILIZATION_RUNTIME_STATUSES,
} from "./civilization.constants";
import {
  clearOrchestratorState,
  evaluate,
  listEvaluations,
  listOrchestrationPlans,
  listSynchronizationReports,
  orchestrate,
  synchronize,
} from "./civilization.orchestrator";
import {
  clearCivilizations,
  getCivilization,
  listCivilizations,
  registerCivilization,
  removeCivilization,
} from "./civilization.registry";
import type {
  Civilization,
  CivilizationEvaluation,
  OrchestrationMode,
  OrchestrationPlan,
  RegisterCivilizationInput,
  SynchronizationReport,
} from "./civilization.types";

export type CivilizationRuntimeStatus =
  (typeof CIVILIZATION_RUNTIME_STATUSES)[number];

export type CivilizationRuntimeSnapshot = {
  runtimeId: string;
  status: CivilizationRuntimeStatus;
  civilizationLayerId: typeof E09_CIVILIZATION_ID;
  version: typeof E09_CIVILIZATION_VERSION;
  civilizationCount: number;
  planCount: number;
  syncCount: number;
  evaluationCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CivilizationRuntime = {
  initialize: () => CivilizationRuntimeSnapshot;
  start: () => CivilizationRuntimeSnapshot;
  stop: () => CivilizationRuntimeSnapshot;
  status: () => CivilizationRuntimeSnapshot;
  registerCivilization: (
    input: RegisterCivilizationInput,
  ) => Civilization;
  getCivilization: typeof getCivilization;
  listCivilizations: typeof listCivilizations;
  removeCivilization: (id: string) => boolean;
  orchestrate: (
    civilizationId: string,
    options?: { mode?: OrchestrationMode },
  ) => OrchestrationPlan;
  synchronize: (civilizationId: string) => SynchronizationReport;
  evaluate: (civilizationId: string) => CivilizationEvaluation;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createCivilizationRuntime(options?: {
  runtimeId?: string;
}): CivilizationRuntime {
  const runtimeId =
    options?.runtimeId?.trim() || createId("civ-runtime");
  let state: CivilizationRuntimeStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): CivilizationRuntimeSnapshot {
    return {
      runtimeId,
      status: state,
      civilizationLayerId: E09_CIVILIZATION_ID,
      version: E09_CIVILIZATION_VERSION,
      civilizationCount: listCivilizations().length,
      planCount: listOrchestrationPlans().length,
      syncCount: listSynchronizationReports().length,
      evaluationCount: listEvaluations().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): CivilizationRuntimeSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }

    clearOrchestratorState();
    clearCivilizations();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): CivilizationRuntimeSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
    }

    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): CivilizationRuntimeSnapshot {
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
    registerCivilization: (input) => {
      assertRunning("registerCivilization");
      return registerCivilization(input);
    },
    getCivilization,
    listCivilizations,
    removeCivilization: (id) => {
      assertRunning("removeCivilization");
      return removeCivilization(id);
    },
    orchestrate: (civilizationId, orchOptions) => {
      assertRunning("orchestrate");
      return orchestrate(civilizationId, orchOptions);
    },
    synchronize: (civilizationId) => {
      assertRunning("synchronize");
      return synchronize(civilizationId);
    },
    evaluate: (civilizationId) => {
      assertRunning("evaluate");
      return evaluate(civilizationId);
    },
  };
}
