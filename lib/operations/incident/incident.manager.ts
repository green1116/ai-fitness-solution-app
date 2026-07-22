/**
 * Post-Launch P3 — Incident Response Operations Manager
 */

import { getAdminConsoleRegistryManifest } from "../../product/e12/admin/admin.manager";
import { getSupportRegistryManifest } from "../../launch/support/support.manager";
import { getCustomerSuccessRegistryManifest } from "../customer-success/success.manager";
import { getOperationsRegistryManifest } from "../production/production.manager";
import {
  OPERATIONS_INCIDENT_RESPONSE_BASE,
  OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION,
  OPERATIONS_INCIDENT_RESPONSE_ID,
  OPERATIONS_INCIDENT_RESPONSE_VERSION,
} from "./incident.constants";
import {
  clearEscalationWorkflows,
  getEscalationWorkflow,
  listEscalationWorkflows,
  startEscalationWorkflow,
} from "./incident.escalation";
import { computeIncidentMetrics } from "./incident.metrics";
import {
  clearOperationsIncidents,
  getOperationsIncident,
  listOperationsIncidents,
  openOperationsIncident,
  setOperationsIncidentStatus,
} from "./incident.model";
import {
  assertIncidentReadinessReady,
  evaluateIncidentReadiness,
} from "./incident.readiness";
import {
  clearIncidentResolutions,
  getIncidentResolution,
  listIncidentResolutions,
  recordIncidentResolution,
} from "./incident.resolution";
import { classifyIncidentSeverity } from "./incident.severity";
import type {
  ClassifySeverityInput,
  EscalationWorkflow,
  IncidentManagerStatus,
  IncidentMetrics,
  IncidentReadinessResult,
  IncidentRegistryManifest,
  IncidentResolution,
  OpenOperationsIncidentInput,
  OperationsIncident,
  OperationsIncidentStatus,
  RecordIncidentResolutionInput,
  SeverityClassification,
  StartEscalationWorkflowInput,
} from "./incident.types";

export type IncidentManagerSnapshot = {
  managerId: string;
  status: IncidentManagerStatus;
  layerId: typeof OPERATIONS_INCIDENT_RESPONSE_ID;
  version: typeof OPERATIONS_INCIDENT_RESPONSE_VERSION;
  incidentCount: number;
  escalationCount: number;
  resolutionCount: number;
  productionOperationCount: number;
  supportProfileCount: number;
  customerHealthProfileCount: number;
  adminAuditCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type IncidentResponseOperationsManager = {
  initialize: () => IncidentManagerSnapshot;
  start: () => IncidentManagerSnapshot;
  stop: () => IncidentManagerSnapshot;
  status: () => IncidentManagerSnapshot;
  classifySeverity: (input: ClassifySeverityInput) => SeverityClassification;
  openIncident: (input: OpenOperationsIncidentInput) => OperationsIncident;
  setIncidentStatus: (
    id: string,
    status: OperationsIncidentStatus,
    detail?: string,
  ) => OperationsIncident;
  getIncident: typeof getOperationsIncident;
  listIncidents: typeof listOperationsIncidents;
  startEscalation: (input: StartEscalationWorkflowInput) => EscalationWorkflow;
  getEscalation: typeof getEscalationWorkflow;
  listEscalations: typeof listEscalationWorkflows;
  recordResolution: (
    input: RecordIncidentResolutionInput,
  ) => IncidentResolution;
  getResolution: typeof getIncidentResolution;
  listResolutions: typeof listIncidentResolutions;
  computeMetrics: (filter?: {
    productionOperationId?: string;
    supportSlaProfileId?: string;
  }) => IncidentMetrics;
  evaluateReadiness: (operationsIncidentId: string) => IncidentReadinessResult;
  manifest: () => IncidentRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getIncidentRegistryManifest(): IncidentRegistryManifest {
  return {
    incidentResponseId: OPERATIONS_INCIDENT_RESPONSE_ID,
    version: OPERATIONS_INCIDENT_RESPONSE_VERSION,
    freezeVersion: OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION,
    base: OPERATIONS_INCIDENT_RESPONSE_BASE,
    incidentCount: listOperationsIncidents().length,
    escalationCount: listEscalationWorkflows().length,
    resolutionCount: listIncidentResolutions().length,
  };
}

export function clearIncidentResponseLayer(): void {
  clearIncidentResolutions();
  clearEscalationWorkflows();
  clearOperationsIncidents();
}

export function createIncidentResponseOperationsManager(options?: {
  managerId?: string;
}): IncidentResponseOperationsManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-p3-ir-mgr");
  let state: IncidentManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): IncidentManagerSnapshot {
    const opsReg = getOperationsRegistryManifest();
    const supportReg = getSupportRegistryManifest();
    const csReg = getCustomerSuccessRegistryManifest();
    const adminReg = getAdminConsoleRegistryManifest();
    const reg = getIncidentRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_INCIDENT_RESPONSE_ID,
      version: OPERATIONS_INCIDENT_RESPONSE_VERSION,
      incidentCount: reg.incidentCount,
      escalationCount: reg.escalationCount,
      resolutionCount: reg.resolutionCount,
      productionOperationCount: opsReg.operationCount,
      supportProfileCount: supportReg.profileCount,
      customerHealthProfileCount: csReg.healthProfileCount,
      adminAuditCount: adminReg.auditCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): IncidentManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearIncidentResponseLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): IncidentManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): IncidentManagerSnapshot {
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
    classifySeverity: (input) => {
      assertRunning("classifySeverity");
      return classifyIncidentSeverity(input);
    },
    openIncident: (input) => {
      assertRunning("openIncident");
      return openOperationsIncident(input);
    },
    setIncidentStatus: (id, status, detail) => {
      assertRunning("setIncidentStatus");
      return setOperationsIncidentStatus(id, status, detail);
    },
    getIncident: getOperationsIncident,
    listIncidents: listOperationsIncidents,
    startEscalation: (input) => {
      assertRunning("startEscalation");
      return startEscalationWorkflow(input);
    },
    getEscalation: getEscalationWorkflow,
    listEscalations: listEscalationWorkflows,
    recordResolution: (input) => {
      assertRunning("recordResolution");
      return recordIncidentResolution(input);
    },
    getResolution: getIncidentResolution,
    listResolutions: listIncidentResolutions,
    computeMetrics: (filter) => {
      assertRunning("computeMetrics");
      return computeIncidentMetrics(filter);
    },
    evaluateReadiness: (operationsIncidentId) => {
      assertRunning("evaluateReadiness");
      return evaluateIncidentReadiness(operationsIncidentId);
    },
    manifest: getIncidentRegistryManifest,
  };
}

export { assertIncidentReadinessReady };
