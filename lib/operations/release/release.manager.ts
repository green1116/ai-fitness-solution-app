/**
 * Post-Launch P4 — Release Management Operations Manager
 */

import { getControlRegistryManifest } from "../../launch/control/control.manager";
import { getDeploymentRegistryManifest } from "../../product/e12/deployment/deployment.manager";
import { getIncidentRegistryManifest } from "../incident/incident.manager";
import { getOperationsRegistryManifest } from "../production/production.manager";
import {
  clearDeploymentApprovals,
  decideDeploymentApproval,
  deployApprovedRelease,
  getDeploymentApproval,
  listDeploymentApprovals,
  requestDeploymentApproval,
} from "./release.approval";
import {
  OPERATIONS_RELEASE_MANAGEMENT_BASE,
  OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION,
  OPERATIONS_RELEASE_MANAGEMENT_ID,
  OPERATIONS_RELEASE_MANAGEMENT_VERSION,
} from "./release.constants";
import {
  clearOperationsReleases,
  createOperationsRelease,
  getOperationsRelease,
  listOperationsReleases,
  setOperationsReleaseStatus,
} from "./release.lifecycle";
import { computeReleaseMetrics } from "./release.metrics";
import {
  assertReleaseReadinessReady,
  evaluateReleaseReadiness,
} from "./release.readiness";
import {
  clearRollbackWorkflows,
  getRollbackWorkflow,
  listRollbackWorkflows,
  startRollbackWorkflow,
} from "./release.rollback";
import {
  clearReleaseVersions,
  getLatestReleaseVersion,
  getReleaseVersion,
  listReleaseVersions,
  trackReleaseVersion,
} from "./release.version";
import type {
  CreateOperationsReleaseInput,
  DecideDeploymentApprovalInput,
  DeploymentApproval,
  OperationsRelease,
  ReleaseLifecycleStatus,
  ReleaseManagerStatus,
  ReleaseMetrics,
  ReleaseReadinessResult,
  ReleaseRegistryManifest,
  ReleaseVersionRecord,
  RequestDeploymentApprovalInput,
  RollbackWorkflow,
  StartRollbackWorkflowInput,
  TrackReleaseVersionInput,
} from "./release.types";

export type ReleaseManagerSnapshot = {
  managerId: string;
  status: ReleaseManagerStatus;
  layerId: typeof OPERATIONS_RELEASE_MANAGEMENT_ID;
  version: typeof OPERATIONS_RELEASE_MANAGEMENT_VERSION;
  releaseCount: number;
  versionCount: number;
  approvalCount: number;
  rollbackCount: number;
  productionOperationCount: number;
  orchestrationCount: number;
  deploymentPackageCount: number;
  incidentCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ReleaseManagementOperationsManager = {
  initialize: () => ReleaseManagerSnapshot;
  start: () => ReleaseManagerSnapshot;
  stop: () => ReleaseManagerSnapshot;
  status: () => ReleaseManagerSnapshot;
  createRelease: (input: CreateOperationsReleaseInput) => OperationsRelease;
  setReleaseStatus: (
    id: string,
    status: ReleaseLifecycleStatus,
    detail?: string,
  ) => OperationsRelease;
  getRelease: typeof getOperationsRelease;
  listReleases: typeof listOperationsReleases;
  trackVersion: (input: TrackReleaseVersionInput) => ReleaseVersionRecord;
  getVersion: typeof getReleaseVersion;
  getLatestVersion: typeof getLatestReleaseVersion;
  listVersions: typeof listReleaseVersions;
  requestApproval: (
    input: RequestDeploymentApprovalInput,
  ) => DeploymentApproval;
  decideApproval: (input: DecideDeploymentApprovalInput) => DeploymentApproval;
  deploy: (operationsReleaseId: string, detail?: string) => OperationsRelease;
  getApproval: typeof getDeploymentApproval;
  listApprovals: typeof listDeploymentApprovals;
  startRollback: (input: StartRollbackWorkflowInput) => RollbackWorkflow;
  getRollback: typeof getRollbackWorkflow;
  listRollbacks: typeof listRollbackWorkflows;
  computeMetrics: (filter?: {
    productionOperationId?: string;
  }) => ReleaseMetrics;
  evaluateReadiness: (operationsReleaseId: string) => ReleaseReadinessResult;
  manifest: () => ReleaseRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getReleaseRegistryManifest(): ReleaseRegistryManifest {
  return {
    releaseManagementId: OPERATIONS_RELEASE_MANAGEMENT_ID,
    version: OPERATIONS_RELEASE_MANAGEMENT_VERSION,
    freezeVersion: OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION,
    base: OPERATIONS_RELEASE_MANAGEMENT_BASE,
    releaseCount: listOperationsReleases().length,
    versionCount: listReleaseVersions().length,
    approvalCount: listDeploymentApprovals().length,
    rollbackCount: listRollbackWorkflows().length,
  };
}

export function clearReleaseManagementLayer(): void {
  clearRollbackWorkflows();
  clearDeploymentApprovals();
  clearReleaseVersions();
  clearOperationsReleases();
}

export function createReleaseManagementOperationsManager(options?: {
  managerId?: string;
}): ReleaseManagementOperationsManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-p4-rm-mgr");
  let state: ReleaseManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ReleaseManagerSnapshot {
    const opsReg = getOperationsRegistryManifest();
    const controlReg = getControlRegistryManifest();
    const deplReg = getDeploymentRegistryManifest();
    const irReg = getIncidentRegistryManifest();
    const reg = getReleaseRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_RELEASE_MANAGEMENT_ID,
      version: OPERATIONS_RELEASE_MANAGEMENT_VERSION,
      releaseCount: reg.releaseCount,
      versionCount: reg.versionCount,
      approvalCount: reg.approvalCount,
      rollbackCount: reg.rollbackCount,
      productionOperationCount: opsReg.operationCount,
      orchestrationCount: controlReg.orchestrationCount,
      deploymentPackageCount: deplReg.packageCount,
      incidentCount: irReg.incidentCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ReleaseManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearReleaseManagementLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ReleaseManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ReleaseManagerSnapshot {
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
    createRelease: (input) => {
      assertRunning("createRelease");
      return createOperationsRelease(input);
    },
    setReleaseStatus: (id, status, detail) => {
      assertRunning("setReleaseStatus");
      return setOperationsReleaseStatus(id, status, detail);
    },
    getRelease: getOperationsRelease,
    listReleases: listOperationsReleases,
    trackVersion: (input) => {
      assertRunning("trackVersion");
      return trackReleaseVersion(input);
    },
    getVersion: getReleaseVersion,
    getLatestVersion: getLatestReleaseVersion,
    listVersions: listReleaseVersions,
    requestApproval: (input) => {
      assertRunning("requestApproval");
      return requestDeploymentApproval(input);
    },
    decideApproval: (input) => {
      assertRunning("decideApproval");
      return decideDeploymentApproval(input);
    },
    deploy: (operationsReleaseId, detail) => {
      assertRunning("deploy");
      const released = deployApprovedRelease(operationsReleaseId, detail);
      if (!released) {
        throw new Error(`deploy failed: ${operationsReleaseId}`);
      }
      return released;
    },
    getApproval: getDeploymentApproval,
    listApprovals: listDeploymentApprovals,
    startRollback: (input) => {
      assertRunning("startRollback");
      return startRollbackWorkflow(input);
    },
    getRollback: getRollbackWorkflow,
    listRollbacks: listRollbackWorkflows,
    computeMetrics: (filter) => {
      assertRunning("computeMetrics");
      return computeReleaseMetrics(filter);
    },
    evaluateReadiness: (operationsReleaseId) => {
      assertRunning("evaluateReadiness");
      return evaluateReleaseReadiness(operationsReleaseId);
    },
    manifest: getReleaseRegistryManifest,
  };
}

export { assertReleaseReadinessReady };
