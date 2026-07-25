/**
 * Product Operations — Operational Console Manager
 */

import {
  PRODUCT_OPERATIONS_CONSOLE_BASE,
  PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION,
  PRODUCT_OPERATIONS_CONSOLE_ID,
  PRODUCT_OPERATIONS_CONSOLE_VERSION,
} from "./console/console.constants";
import {
  assertOperationsConsoleReadinessReady,
  evaluateOperationsConsoleReadiness,
} from "./console/console.readiness";
import type {
  OperationsManagerStatus,
  OperationsReadinessResult,
  OperationsRegistryManifest,
} from "./console/console.types";
import {
  clearOpsDispatches,
  getOpsDispatch,
  listOpsDispatches,
  queueOpsDispatch,
  runOpsDispatch,
} from "./dispatch/dispatch.registry";
import type {
  OpsDispatch,
  QueueOpsDispatchInput,
  RunOpsDispatchInput,
} from "./dispatch/dispatch.types";
import {
  clearOpsIncidents,
  getOpsIncident,
  listOpsIncidents,
  openOpsIncident,
  updateOpsIncidentStatus,
} from "./incident/incident.registry";
import type {
  OpenOpsIncidentInput,
  OpsIncident,
  UpdateOpsIncidentStatusInput,
} from "./incident/incident.types";
import {
  clearOpsPlaybooks,
  getOpsPlaybook,
  listOpsPlaybooks,
  registerOpsPlaybook,
} from "./playbook/playbook.registry";
import type {
  OpsPlaybook,
  RegisterOpsPlaybookInput,
} from "./playbook/playbook.types";
import {
  clearOpsSurfaces,
  getOpsSurface,
  listOpsSurfaces,
  registerOpsSurface,
  updateOpsSurfaceStatus,
} from "./surface/surface.registry";
import type {
  OpsSurface,
  RegisterOpsSurfaceInput,
  UpdateOpsSurfaceStatusInput,
} from "./surface/surface.types";

export type OperationsManagerSnapshot = {
  managerId: string;
  status: OperationsManagerStatus;
  layerId: typeof PRODUCT_OPERATIONS_CONSOLE_ID;
  version: typeof PRODUCT_OPERATIONS_CONSOLE_VERSION;
  surfaceCount: number;
  incidentCount: number;
  playbookCount: number;
  dispatchCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type OperationsManager = {
  initialize: () => OperationsManagerSnapshot;
  start: () => OperationsManagerSnapshot;
  stop: () => OperationsManagerSnapshot;
  status: () => OperationsManagerSnapshot;
  registerSurface: (input: RegisterOpsSurfaceInput) => OpsSurface;
  updateSurfaceStatus: (input: UpdateOpsSurfaceStatusInput) => OpsSurface;
  openIncident: (input: OpenOpsIncidentInput) => OpsIncident;
  updateIncidentStatus: (
    input: UpdateOpsIncidentStatusInput,
  ) => OpsIncident;
  registerPlaybook: (input: RegisterOpsPlaybookInput) => OpsPlaybook;
  queueDispatch: (input: QueueOpsDispatchInput) => OpsDispatch;
  runDispatch: (input: RunOpsDispatchInput) => OpsDispatch;
  evaluateReadiness: () => OperationsReadinessResult;
  manifest: () => OperationsRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getOperationsRegistryManifest(): OperationsRegistryManifest {
  return {
    consoleId: PRODUCT_OPERATIONS_CONSOLE_ID,
    version: PRODUCT_OPERATIONS_CONSOLE_VERSION,
    freezeVersion: PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION,
    base: PRODUCT_OPERATIONS_CONSOLE_BASE,
    surfaceCount: listOpsSurfaces().length,
    incidentCount: listOpsIncidents().length,
    playbookCount: listOpsPlaybooks().length,
    dispatchCount: listOpsDispatches().length,
  };
}

export function clearOperationsConsoleLayer(): void {
  clearOpsDispatches();
  clearOpsPlaybooks();
  clearOpsIncidents();
  clearOpsSurfaces();
}

export function createOperationsManager(options?: {
  managerId?: string;
}): OperationsManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-ops-mgr");
  let state: OperationsManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): OperationsManagerSnapshot {
    const reg = getOperationsRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_OPERATIONS_CONSOLE_ID,
      version: PRODUCT_OPERATIONS_CONSOLE_VERSION,
      surfaceCount: reg.surfaceCount,
      incidentCount: reg.incidentCount,
      playbookCount: reg.playbookCount,
      dispatchCount: reg.dispatchCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): OperationsManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearOperationsConsoleLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): OperationsManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): OperationsManagerSnapshot {
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
    registerSurface: (input) => {
      assertRunning("registerSurface");
      return registerOpsSurface(input);
    },
    updateSurfaceStatus: (input) => {
      assertRunning("updateSurfaceStatus");
      return updateOpsSurfaceStatus(input);
    },
    openIncident: (input) => {
      assertRunning("openIncident");
      return openOpsIncident(input);
    },
    updateIncidentStatus: (input) => {
      assertRunning("updateIncidentStatus");
      return updateOpsIncidentStatus(input);
    },
    registerPlaybook: (input) => {
      assertRunning("registerPlaybook");
      return registerOpsPlaybook(input);
    },
    queueDispatch: (input) => {
      assertRunning("queueDispatch");
      return queueOpsDispatch(input);
    },
    runDispatch: (input) => {
      assertRunning("runDispatch");
      return runOpsDispatch(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateOperationsConsoleReadiness();
    },
    manifest: getOperationsRegistryManifest,
  };
}

export {
  assertOperationsConsoleReadinessReady,
  getOpsDispatch,
  getOpsIncident,
  getOpsPlaybook,
  getOpsSurface,
  listOpsDispatches,
  listOpsIncidents,
  listOpsPlaybooks,
  listOpsSurfaces,
};
