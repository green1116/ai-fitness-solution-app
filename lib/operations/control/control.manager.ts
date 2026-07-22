/**
 * Post-Launch P7 — Operations Control Plane Manager
 */

import { getCustomerSuccessRegistryManifest } from "../customer-success/success.manager";
import { getEnterpriseSupportRegistryManifest } from "../support/support.manager";
import { getGrowthRegistryManifest } from "../growth/growth.manager";
import { getIncidentRegistryManifest } from "../incident/incident.manager";
import { getOperationsRegistryManifest } from "../production/production.manager";
import { getReleaseRegistryManifest } from "../release/release.manager";
import {
  buildCommandCenter,
  clearCommandCenterSnapshots,
  getCommandCenterSnapshot,
  listCommandCenterSnapshots,
} from "./control.command";
import {
  OPERATIONS_CONTROL_PLANE_BASE,
  OPERATIONS_CONTROL_PLANE_FREEZE_VERSION,
  OPERATIONS_CONTROL_PLANE_ID,
  OPERATIONS_CONTROL_PLANE_VERSION,
} from "./control.constants";
import {
  buildExecutiveOpsDashboard,
  clearExecutiveOpsDashboards,
  getExecutiveOpsDashboard,
  listExecutiveOpsDashboards,
} from "./control.dashboard";
import {
  clearOperationalDecisions,
  decideOperations,
  getOperationalDecision,
  listOperationalDecisions,
} from "./control.decision";
import { aggregateOperationsHealth } from "./control.health";
import {
  activateOperationsOrchestration,
  clearOperationsOrchestrations,
  createOperationsOrchestration,
  getOperationsOrchestration,
  listOperationsOrchestrations,
  setOperationsOrchestrationStatus,
} from "./control.orchestration";
import {
  assertOpsControlReadinessReady,
  evaluateOpsControlReadiness,
} from "./control.readiness";
import type {
  AggregatedOpsHealth,
  BuildCommandCenterInput,
  BuildExecutiveOpsDashboardInput,
  CommandCenterSnapshot,
  CreateOperationsOrchestrationInput,
  DecideOperationsInput,
  ExecutiveOpsDashboard,
  OperationalDecision,
  OperationsOrchestration,
  OpsControlManagerStatus,
  OpsControlReadinessResult,
  OpsControlRegistryManifest,
  OpsOrchestrationStatus,
} from "./control.types";

export type OpsControlManagerSnapshot = {
  managerId: string;
  status: OpsControlManagerStatus;
  layerId: typeof OPERATIONS_CONTROL_PLANE_ID;
  version: typeof OPERATIONS_CONTROL_PLANE_VERSION;
  orchestrationCount: number;
  commandCenterCount: number;
  decisionCount: number;
  dashboardCount: number;
  productionOperationCount: number;
  customerHealthProfileCount: number;
  incidentCount: number;
  releaseCount: number;
  growthDashboardCount: number;
  supportCaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type OperationsControlPlaneManager = {
  initialize: () => OpsControlManagerSnapshot;
  start: () => OpsControlManagerSnapshot;
  stop: () => OpsControlManagerSnapshot;
  status: () => OpsControlManagerSnapshot;
  createOrchestration: (
    input: CreateOperationsOrchestrationInput,
  ) => OperationsOrchestration;
  setOrchestrationStatus: (
    id: string,
    status: OpsOrchestrationStatus,
    detail?: string,
  ) => OperationsOrchestration;
  activateOrchestration: typeof activateOperationsOrchestration;
  getOrchestration: typeof getOperationsOrchestration;
  listOrchestrations: typeof listOperationsOrchestrations;
  aggregateHealth: (orchestrationId: string) => AggregatedOpsHealth;
  buildCommandCenter: (
    input: BuildCommandCenterInput,
  ) => CommandCenterSnapshot;
  getCommandCenter: typeof getCommandCenterSnapshot;
  listCommandCenters: typeof listCommandCenterSnapshots;
  decide: (input: DecideOperationsInput) => OperationalDecision;
  getDecision: typeof getOperationalDecision;
  listDecisions: typeof listOperationalDecisions;
  buildDashboard: (
    input: BuildExecutiveOpsDashboardInput,
  ) => ExecutiveOpsDashboard;
  getDashboard: typeof getExecutiveOpsDashboard;
  listDashboards: typeof listExecutiveOpsDashboards;
  evaluateReadiness: (orchestrationId: string) => OpsControlReadinessResult;
  manifest: () => OpsControlRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getOpsControlRegistryManifest(): OpsControlRegistryManifest {
  return {
    controlPlaneId: OPERATIONS_CONTROL_PLANE_ID,
    version: OPERATIONS_CONTROL_PLANE_VERSION,
    freezeVersion: OPERATIONS_CONTROL_PLANE_FREEZE_VERSION,
    base: OPERATIONS_CONTROL_PLANE_BASE,
    orchestrationCount: listOperationsOrchestrations().length,
    commandCenterCount: listCommandCenterSnapshots().length,
    decisionCount: listOperationalDecisions().length,
    dashboardCount: listExecutiveOpsDashboards().length,
  };
}

export function clearOperationsControlLayer(): void {
  clearExecutiveOpsDashboards();
  clearOperationalDecisions();
  clearCommandCenterSnapshots();
  clearOperationsOrchestrations();
}

export function createOperationsControlPlaneManager(options?: {
  managerId?: string;
}): OperationsControlPlaneManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-p7-oc-mgr");
  let state: OpsControlManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): OpsControlManagerSnapshot {
    const prodReg = getOperationsRegistryManifest();
    const csReg = getCustomerSuccessRegistryManifest();
    const irReg = getIncidentRegistryManifest();
    const relReg = getReleaseRegistryManifest();
    const growthReg = getGrowthRegistryManifest();
    const supportReg = getEnterpriseSupportRegistryManifest();
    const reg = getOpsControlRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_CONTROL_PLANE_ID,
      version: OPERATIONS_CONTROL_PLANE_VERSION,
      orchestrationCount: reg.orchestrationCount,
      commandCenterCount: reg.commandCenterCount,
      decisionCount: reg.decisionCount,
      dashboardCount: reg.dashboardCount,
      productionOperationCount: prodReg.operationCount,
      customerHealthProfileCount: csReg.healthProfileCount,
      incidentCount: irReg.incidentCount,
      releaseCount: relReg.releaseCount,
      growthDashboardCount: growthReg.dashboardCount,
      supportCaseCount: supportReg.caseCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): OpsControlManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearOperationsControlLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): OpsControlManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): OpsControlManagerSnapshot {
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
      return createOperationsOrchestration(input);
    },
    setOrchestrationStatus: (id, status, detail) => {
      assertRunning("setOrchestrationStatus");
      return setOperationsOrchestrationStatus(id, status, detail);
    },
    activateOrchestration: (id) => {
      assertRunning("activateOrchestration");
      return activateOperationsOrchestration(id);
    },
    getOrchestration: getOperationsOrchestration,
    listOrchestrations: listOperationsOrchestrations,
    aggregateHealth: (orchestrationId) => {
      assertRunning("aggregateHealth");
      return aggregateOperationsHealth(orchestrationId);
    },
    buildCommandCenter: (input) => {
      assertRunning("buildCommandCenter");
      return buildCommandCenter(input);
    },
    getCommandCenter: getCommandCenterSnapshot,
    listCommandCenters: listCommandCenterSnapshots,
    decide: (input) => {
      assertRunning("decide");
      return decideOperations(input);
    },
    getDecision: getOperationalDecision,
    listDecisions: listOperationalDecisions,
    buildDashboard: (input) => {
      assertRunning("buildDashboard");
      return buildExecutiveOpsDashboard(input);
    },
    getDashboard: getExecutiveOpsDashboard,
    listDashboards: listExecutiveOpsDashboards,
    evaluateReadiness: (orchestrationId) => {
      assertRunning("evaluateReadiness");
      return evaluateOpsControlReadiness(orchestrationId);
    },
    manifest: getOpsControlRegistryManifest,
  };
}

export { assertOpsControlReadinessReady };
