/**
 * Launch P7 — Launch Control Plane Manager
 */

import { getDocumentationRegistryManifest } from "../documentation/documentation.manager";
import { getLaunchRegistryManifest } from "../launch.manager";
import {
  LAUNCH_CONTROL_PLANE_BASE,
  LAUNCH_CONTROL_PLANE_FREEZE_VERSION,
  LAUNCH_CONTROL_PLANE_ID,
  LAUNCH_CONTROL_PLANE_VERSION,
} from "./control.constants";
import { buildExecutiveDashboard } from "./control.dashboard";
import {
  clearReleaseDecisions,
  createReleaseDecision,
  getLatestReleaseDecision,
  getReleaseDecision,
  listReleaseDecisions,
} from "./control.decision";
import { aggregateDeploymentStatus } from "./control.deployment";
import {
  assertGoNoGo,
  clearGoNoGoResults,
  evaluateGoNoGo,
  getGoNoGoResult,
  listGoNoGoResults,
} from "./control.gonogo";
import { computeLaunchMetrics } from "./control.metrics";
import {
  clearLaunchOrchestrations,
  createLaunchOrchestration,
  getLaunchOrchestration,
  listLaunchOrchestrations,
  setOrchestrationStatus,
  updateOrchestrationStage,
} from "./control.orchestration";
import {
  assertControlReadinessReady,
  evaluateControlReadiness,
} from "./control.readiness";
import type {
  ControlManagerStatus,
  ControlReadinessResult,
  ControlRegistryManifest,
  CreateLaunchOrchestrationInput,
  CreateReleaseDecisionInput,
  DeploymentStatusAggregate,
  ExecutiveDashboard,
  GoNoGoResult,
  LaunchMetrics,
  LaunchOrchestration,
  OrchestrationStage,
  OrchestrationStageRecord,
  OrchestrationStatus,
  ReleaseDecision,
} from "./control.types";

export type ControlManagerSnapshot = {
  managerId: string;
  status: ControlManagerStatus;
  layerId: typeof LAUNCH_CONTROL_PLANE_ID;
  version: typeof LAUNCH_CONTROL_PLANE_VERSION;
  orchestrationCount: number;
  decisionCount: number;
  goNoGoCount: number;
  launchProfileCount: number;
  documentationPackageCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type LaunchControlPlaneManager = {
  initialize: () => ControlManagerSnapshot;
  start: () => ControlManagerSnapshot;
  stop: () => ControlManagerSnapshot;
  status: () => ControlManagerSnapshot;
  createOrchestration: (
    input: CreateLaunchOrchestrationInput,
  ) => LaunchOrchestration;
  setOrchestrationStatus: (
    id: string,
    status: OrchestrationStatus,
  ) => LaunchOrchestration;
  updateStage: (
    orchestrationId: string,
    stage: OrchestrationStage,
    patch: Partial<Pick<OrchestrationStageRecord, "status" | "detail">>,
  ) => LaunchOrchestration;
  getOrchestration: typeof getLaunchOrchestration;
  listOrchestrations: typeof listLaunchOrchestrations;
  evaluateGoNoGo: (orchestrationId: string) => GoNoGoResult;
  getGoNoGo: typeof getGoNoGoResult;
  listGoNoGo: typeof listGoNoGoResults;
  createDecision: (input: CreateReleaseDecisionInput) => ReleaseDecision;
  getDecision: typeof getReleaseDecision;
  getLatestDecision: typeof getLatestReleaseDecision;
  listDecisions: typeof listReleaseDecisions;
  computeMetrics: (orchestrationId: string) => LaunchMetrics;
  aggregateDeployment: (
    orchestrationId: string,
  ) => DeploymentStatusAggregate;
  buildDashboard: (
    orchestrationId: string,
    options?: { refreshGoNoGo?: boolean },
  ) => ExecutiveDashboard;
  evaluateReadiness: (orchestrationId: string) => ControlReadinessResult;
  manifest: () => ControlRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getControlRegistryManifest(): ControlRegistryManifest {
  return {
    controlPlaneId: LAUNCH_CONTROL_PLANE_ID,
    version: LAUNCH_CONTROL_PLANE_VERSION,
    freezeVersion: LAUNCH_CONTROL_PLANE_FREEZE_VERSION,
    base: LAUNCH_CONTROL_PLANE_BASE,
    orchestrationCount: listLaunchOrchestrations().length,
    decisionCount: listReleaseDecisions().length,
    goNoGoCount: listGoNoGoResults().length,
  };
}

export function clearControlLayer(): void {
  clearGoNoGoResults();
  clearReleaseDecisions();
  clearLaunchOrchestrations();
}

export function createLaunchControlPlaneManager(options?: {
  managerId?: string;
}): LaunchControlPlaneManager {
  const managerId =
    options?.managerId?.trim() || createId("launch-p7-mgr");
  let state: ControlManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ControlManagerSnapshot {
    const launchReg = getLaunchRegistryManifest();
    const docsReg = getDocumentationRegistryManifest();
    const reg = getControlRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_CONTROL_PLANE_ID,
      version: LAUNCH_CONTROL_PLANE_VERSION,
      orchestrationCount: reg.orchestrationCount,
      decisionCount: reg.decisionCount,
      goNoGoCount: reg.goNoGoCount,
      launchProfileCount: launchReg.profileCount,
      documentationPackageCount: docsReg.packageCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ControlManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearControlLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ControlManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ControlManagerSnapshot {
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
      return createLaunchOrchestration(input);
    },
    setOrchestrationStatus: (id, status) => {
      assertRunning("setOrchestrationStatus");
      return setOrchestrationStatus(id, status);
    },
    updateStage: (orchestrationId, stage, patch) => {
      assertRunning("updateStage");
      return updateOrchestrationStage(orchestrationId, stage, patch);
    },
    getOrchestration: getLaunchOrchestration,
    listOrchestrations: listLaunchOrchestrations,
    evaluateGoNoGo: (orchestrationId) => {
      assertRunning("evaluateGoNoGo");
      return evaluateGoNoGo(orchestrationId);
    },
    getGoNoGo: getGoNoGoResult,
    listGoNoGo: listGoNoGoResults,
    createDecision: (input) => {
      assertRunning("createDecision");
      return createReleaseDecision(input);
    },
    getDecision: getReleaseDecision,
    getLatestDecision: getLatestReleaseDecision,
    listDecisions: listReleaseDecisions,
    computeMetrics: (orchestrationId) => {
      assertRunning("computeMetrics");
      return computeLaunchMetrics(orchestrationId);
    },
    aggregateDeployment: (orchestrationId) => {
      assertRunning("aggregateDeployment");
      return aggregateDeploymentStatus(orchestrationId);
    },
    buildDashboard: (orchestrationId, options) => {
      assertRunning("buildDashboard");
      return buildExecutiveDashboard(orchestrationId, options);
    },
    evaluateReadiness: (orchestrationId) => {
      assertRunning("evaluateReadiness");
      return evaluateControlReadiness(orchestrationId);
    },
    manifest: getControlRegistryManifest,
  };
}

export { assertControlReadinessReady, assertGoNoGo };
