/**
 * Post-Launch P1 — Production Operations Manager
 */

import { getControlRegistryManifest } from "../../launch/control/control.manager";
import { getSupportRegistryManifest } from "../../launch/support/support.manager";
import {
  clearOperationChecklists,
  createOperationChecklist,
  getOperationChecklist,
  listOperationChecklists,
  markRequiredOperationChecklistPassed,
  setOperationChecklistItem,
} from "./production.checklist";
import {
  OPERATIONS_PRODUCTION_FOUNDATION_BASE,
  OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_PRODUCTION_FOUNDATION_ID,
  OPERATIONS_PRODUCTION_FOUNDATION_VERSION,
} from "./production.constants";
import { buildRuntimeHealthDashboard } from "./production.dashboard";
import { computeProductionMetrics } from "./production.metrics";
import {
  clearProductionOperations,
  createProductionOperation,
  getProductionOperation,
  listProductionOperations,
  setProductionOperationStatus,
} from "./production.operation";
import {
  assertOperationsReadinessReady,
  evaluateOperationsReadiness,
} from "./production.readiness";
import {
  clearOperationalStatuses,
  getLatestOperationalStatus,
  getOperationalStatus,
  listOperationalStatuses,
  recordOperationalStatus,
} from "./production.status";
import type {
  CreateOperationChecklistInput,
  CreateProductionOperationInput,
  OperationChecklist,
  OperationsManagerStatus,
  OperationsReadinessResult,
  OperationsRegistryManifest,
  ProductionMetrics,
  ProductionOperation,
  RecordOperationalStatusInput,
  RuntimeHealthDashboard,
  SetOperationChecklistItemInput,
  OperationalStatusRecord,
} from "./production.types";

export type OperationsManagerSnapshot = {
  managerId: string;
  status: OperationsManagerStatus;
  layerId: typeof OPERATIONS_PRODUCTION_FOUNDATION_ID;
  version: typeof OPERATIONS_PRODUCTION_FOUNDATION_VERSION;
  operationCount: number;
  statusRecordCount: number;
  checklistCount: number;
  controlOrchestrationCount: number;
  supportProfileCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ProductionOperationsManager = {
  initialize: () => OperationsManagerSnapshot;
  start: () => OperationsManagerSnapshot;
  stop: () => OperationsManagerSnapshot;
  status: () => OperationsManagerSnapshot;
  createOperation: (
    input: CreateProductionOperationInput,
  ) => ProductionOperation;
  setOperationStatus: typeof setProductionOperationStatus;
  getOperation: typeof getProductionOperation;
  listOperations: typeof listProductionOperations;
  recordStatus: (
    input: RecordOperationalStatusInput,
  ) => OperationalStatusRecord;
  getStatus: typeof getOperationalStatus;
  getLatestStatus: typeof getLatestOperationalStatus;
  listStatuses: typeof listOperationalStatuses;
  createChecklist: (
    input: CreateOperationChecklistInput,
  ) => OperationChecklist;
  setChecklistItem: (
    input: SetOperationChecklistItemInput,
  ) => OperationChecklist;
  markChecklistPassed: typeof markRequiredOperationChecklistPassed;
  getChecklist: typeof getOperationChecklist;
  listChecklists: typeof listOperationChecklists;
  buildHealthDashboard: (
    productionOperationId: string,
  ) => RuntimeHealthDashboard;
  computeMetrics: (productionOperationId: string) => ProductionMetrics;
  evaluateReadiness: (
    productionOperationId: string,
  ) => OperationsReadinessResult;
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
    operationsId: OPERATIONS_PRODUCTION_FOUNDATION_ID,
    version: OPERATIONS_PRODUCTION_FOUNDATION_VERSION,
    freezeVersion: OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION,
    base: OPERATIONS_PRODUCTION_FOUNDATION_BASE,
    operationCount: listProductionOperations().length,
    statusRecordCount: listOperationalStatuses().length,
    checklistCount: listOperationChecklists().length,
  };
}

export function clearOperationsProductionLayer(): void {
  clearOperationChecklists();
  clearOperationalStatuses();
  clearProductionOperations();
}

export function createProductionOperationsManager(options?: {
  managerId?: string;
}): ProductionOperationsManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-p1-mgr");
  let state: OperationsManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): OperationsManagerSnapshot {
    const controlReg = getControlRegistryManifest();
    const supportReg = getSupportRegistryManifest();
    const reg = getOperationsRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_PRODUCTION_FOUNDATION_ID,
      version: OPERATIONS_PRODUCTION_FOUNDATION_VERSION,
      operationCount: reg.operationCount,
      statusRecordCount: reg.statusRecordCount,
      checklistCount: reg.checklistCount,
      controlOrchestrationCount: controlReg.orchestrationCount,
      supportProfileCount: supportReg.profileCount,
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
    clearOperationsProductionLayer();
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
    createOperation: (input) => {
      assertRunning("createOperation");
      return createProductionOperation(input);
    },
    setOperationStatus: (id, status) => {
      assertRunning("setOperationStatus");
      return setProductionOperationStatus(id, status);
    },
    getOperation: getProductionOperation,
    listOperations: listProductionOperations,
    recordStatus: (input) => {
      assertRunning("recordStatus");
      return recordOperationalStatus(input);
    },
    getStatus: getOperationalStatus,
    getLatestStatus: getLatestOperationalStatus,
    listStatuses: listOperationalStatuses,
    createChecklist: (input) => {
      assertRunning("createChecklist");
      return createOperationChecklist(input);
    },
    setChecklistItem: (input) => {
      assertRunning("setChecklistItem");
      return setOperationChecklistItem(input);
    },
    markChecklistPassed: (checklistId) => {
      assertRunning("markChecklistPassed");
      return markRequiredOperationChecklistPassed(checklistId);
    },
    getChecklist: getOperationChecklist,
    listChecklists: listOperationChecklists,
    buildHealthDashboard: (productionOperationId) => {
      assertRunning("buildHealthDashboard");
      return buildRuntimeHealthDashboard(productionOperationId);
    },
    computeMetrics: (productionOperationId) => {
      assertRunning("computeMetrics");
      return computeProductionMetrics(productionOperationId);
    },
    evaluateReadiness: (productionOperationId) => {
      assertRunning("evaluateReadiness");
      return evaluateOperationsReadiness(productionOperationId);
    },
    manifest: getOperationsRegistryManifest,
  };
}

export { assertOperationsReadinessReady };
