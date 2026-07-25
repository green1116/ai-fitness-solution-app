/**
 * Product P12 — Production Launch Manager
 */

import {
  clearAdoptions,
  getAdoption,
  listAdoptions,
  recordAdoption,
} from "./adoption/adoption.registry";
import type {
  LaunchAdoption,
  RecordAdoptionInput,
} from "./adoption/adoption.types";
import {
  PRODUCT_P12_PRODUCTION_LAUNCH_BASE,
  PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION,
  PRODUCT_P12_PRODUCTION_LAUNCH_ID,
  PRODUCT_P12_PRODUCTION_LAUNCH_VERSION,
} from "./launch/launch.constants";
import {
  assertP12ProductionLaunchReadinessReady,
  evaluateP12ProductionLaunchReadiness,
} from "./launch/launch.readiness";
import {
  clearLaunches,
  createLaunch,
  getLaunch,
  listLaunches,
  updateLaunchStatus,
} from "./launch/launch.registry";
import type {
  CreateLaunchInput,
  P12ManagerStatus,
  P12ReadinessResult,
  P12RegistryManifest,
  ProductionLaunch,
  UpdateLaunchStatusInput,
} from "./launch/launch.types";
import {
  clearMonitoring,
  getMonitoring,
  listMonitoring,
  recordMonitoring,
} from "./monitoring/monitoring.registry";
import type {
  LaunchMonitoringSignal,
  RecordMonitoringInput,
} from "./monitoring/monitoring.types";
import {
  activateOperations,
  clearOperations,
  getOperations,
  listOperations,
} from "./operations/operations.registry";
import type {
  ActivateOperationsInput,
  LaunchOperations,
} from "./operations/operations.types";
import {
  clearReadiness,
  getReadiness,
  listReadiness,
  recordReadiness,
} from "./readiness/readiness.registry";
import type {
  LaunchReadinessCheck,
  RecordReadinessInput,
} from "./readiness/readiness.types";
import {
  advanceRollout,
  clearRollouts,
  getRollout,
  listRollouts,
  startRollout,
} from "./rollout/rollout.registry";
import type {
  AdvanceRolloutInput,
  LaunchRollout,
  StartRolloutInput,
} from "./rollout/rollout.types";
import {
  clearSupportCases,
  closeSupportCase,
  getSupportCase,
  listSupportCases,
  openSupportCase,
} from "./support/support.registry";
import type {
  CloseSupportCaseInput,
  LaunchSupportCase,
  OpenSupportCaseInput,
} from "./support/support.types";

export type P12LaunchManagerSnapshot = {
  managerId: string;
  status: P12ManagerStatus;
  layerId: typeof PRODUCT_P12_PRODUCTION_LAUNCH_ID;
  version: typeof PRODUCT_P12_PRODUCTION_LAUNCH_VERSION;
  launchCount: number;
  readinessCount: number;
  rolloutCount: number;
  adoptionCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P12LaunchManager = {
  initialize: () => P12LaunchManagerSnapshot;
  start: () => P12LaunchManagerSnapshot;
  stop: () => P12LaunchManagerSnapshot;
  status: () => P12LaunchManagerSnapshot;
  createLaunch: (input: CreateLaunchInput) => ProductionLaunch;
  updateLaunchStatus: (input: UpdateLaunchStatusInput) => ProductionLaunch;
  recordReadiness: (input: RecordReadinessInput) => LaunchReadinessCheck;
  startRollout: (input: StartRolloutInput) => LaunchRollout;
  advanceRollout: (input: AdvanceRolloutInput) => LaunchRollout;
  recordAdoption: (input: RecordAdoptionInput) => LaunchAdoption;
  activateOperations: (input: ActivateOperationsInput) => LaunchOperations;
  recordMonitoring: (input: RecordMonitoringInput) => LaunchMonitoringSignal;
  openSupportCase: (input: OpenSupportCaseInput) => LaunchSupportCase;
  closeSupportCase: (input: CloseSupportCaseInput) => LaunchSupportCase;
  evaluateReadiness: () => P12ReadinessResult;
  manifest: () => P12RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP12RegistryManifest(): P12RegistryManifest {
  return {
    foundationId: PRODUCT_P12_PRODUCTION_LAUNCH_ID,
    version: PRODUCT_P12_PRODUCTION_LAUNCH_VERSION,
    freezeVersion: PRODUCT_P12_PRODUCTION_LAUNCH_FREEZE_VERSION,
    base: PRODUCT_P12_PRODUCTION_LAUNCH_BASE,
    launchCount: listLaunches().length,
    readinessCount: listReadiness().length,
    rolloutCount: listRollouts().length,
    adoptionCount: listAdoptions().length,
    operationsCount: listOperations().length,
    monitoringCount: listMonitoring().length,
    supportCount: listSupportCases().length,
  };
}

export function clearP12ProductionLaunchLayer(): void {
  clearSupportCases();
  clearMonitoring();
  clearOperations();
  clearAdoptions();
  clearRollouts();
  clearReadiness();
  clearLaunches();
}

export function createP12LaunchManager(options?: {
  managerId?: string;
}): P12LaunchManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p12-lch-mgr");
  let state: P12ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P12LaunchManagerSnapshot {
    const reg = getP12RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P12_PRODUCTION_LAUNCH_ID,
      version: PRODUCT_P12_PRODUCTION_LAUNCH_VERSION,
      launchCount: reg.launchCount,
      readinessCount: reg.readinessCount,
      rolloutCount: reg.rolloutCount,
      adoptionCount: reg.adoptionCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P12LaunchManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP12ProductionLaunchLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P12LaunchManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P12LaunchManagerSnapshot {
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
    createLaunch: (input) => {
      assertRunning("createLaunch");
      return createLaunch(input);
    },
    updateLaunchStatus: (input) => {
      assertRunning("updateLaunchStatus");
      return updateLaunchStatus(input);
    },
    recordReadiness: (input) => {
      assertRunning("recordReadiness");
      return recordReadiness(input);
    },
    startRollout: (input) => {
      assertRunning("startRollout");
      return startRollout(input);
    },
    advanceRollout: (input) => {
      assertRunning("advanceRollout");
      return advanceRollout(input);
    },
    recordAdoption: (input) => {
      assertRunning("recordAdoption");
      return recordAdoption(input);
    },
    activateOperations: (input) => {
      assertRunning("activateOperations");
      return activateOperations(input);
    },
    recordMonitoring: (input) => {
      assertRunning("recordMonitoring");
      return recordMonitoring(input);
    },
    openSupportCase: (input) => {
      assertRunning("openSupportCase");
      return openSupportCase(input);
    },
    closeSupportCase: (input) => {
      assertRunning("closeSupportCase");
      return closeSupportCase(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP12ProductionLaunchReadiness();
    },
    manifest: getP12RegistryManifest,
  };
}

export {
  assertP12ProductionLaunchReadinessReady,
  getAdoption,
  getLaunch,
  getMonitoring,
  getOperations,
  getReadiness,
  getRollout,
  getSupportCase,
  listAdoptions,
  listLaunches,
  listMonitoring,
  listOperations,
  listReadiness,
  listRollouts,
  listSupportCases,
};
