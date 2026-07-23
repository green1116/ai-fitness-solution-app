/**
 * Commercialization P5 — Delivery Operations Foundation Manager
 */

import {
  clearArtifactTrackingRecords,
  getArtifactTrackingRecord,
  listArtifactTrackingRecords,
  trackArtifact,
} from "./artifact/artifact.tracking";
import {
  clearDeliveryArtifacts,
  getDeliveryArtifact,
  listDeliveryArtifacts,
  registerArtifact,
} from "./artifact/artifact.registry";
import type {
  DeliveryArtifact,
  RegisterArtifactInput,
  TrackArtifactInput,
  ArtifactTrackingRecord,
} from "./artifact/artifact.types";
import {
  COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
  COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION,
} from "./delivery/delivery.constants";
import {
  clearDeliveryPlans,
  getDeliveryPlan,
  listDeliveryPlans,
  registerDelivery,
} from "./delivery/delivery.registry";
import type {
  AdvanceDeliveryInput,
  DeliveryPlan,
  DeliveryWorkflowEvent,
  RegisterDeliveryInput,
} from "./delivery/delivery.types";
import {
  advanceDeliveryWorkflow,
  clearDeliveryWorkflowEvents,
  getDeliveryWorkflowEvent,
  listDeliveryWorkflowEvents,
} from "./delivery/delivery.workflow";
import {
  clearDeliveryExecutions,
  getDeliveryExecution,
  listDeliveryExecutions,
  startExecution,
} from "./execution/execution.runner";
import {
  clearExecutionStatusRecords,
  getExecutionStatusRecord,
  listExecutionStatusRecords,
  recordExecutionStatus,
} from "./execution/execution.status";
import type {
  DeliveryExecution,
  ExecutionStatusRecord,
  RecordExecutionStatusInput,
  StartExecutionInput,
} from "./execution/execution.types";
import {
  clearProjectLifecycleRecords,
  getProjectLifecycleRecord,
  listProjectLifecycleRecords,
  transitionProject,
} from "./project/project.lifecycle";
import {
  clearDeliveryProjects,
  getDeliveryProject,
  listDeliveryProjects,
  registerProject,
} from "./project/project.registry";
import type {
  DeliveryProject,
  ProjectLifecycleRecord,
  RegisterProjectInput,
  TransitionProjectInput,
} from "./project/project.types";
import {
  clearAcceptanceRecords,
  getAcceptanceRecord,
  listAcceptanceRecords,
  recordAcceptance,
} from "./quality/quality.acceptance";
import {
  clearQualityChecks,
  getQualityCheck,
  listQualityChecks,
  runQualityCheck,
} from "./quality/quality.checks";
import {
  assertDeliveryOpsReadinessReady,
  evaluateDeliveryOpsReadiness,
} from "./quality/quality.readiness";
import type {
  AcceptanceRecord,
  DeliveryOpsManagerStatus,
  DeliveryOpsReadinessResult,
  DeliveryOpsRegistryManifest,
  QualityCheck,
  RecordAcceptanceInput,
  RunQualityCheckInput,
} from "./quality/quality.types";

export type DeliveryOpsManagerSnapshot = {
  managerId: string;
  status: DeliveryOpsManagerStatus;
  layerId: typeof COMMERCIALIZATION_DELIVERY_OPERATIONS_ID;
  version: typeof COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION;
  projectCount: number;
  deliveryCount: number;
  executionCount: number;
  artifactCount: number;
  qualityCount: number;
  acceptanceCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type DeliveryOpsFoundationManager = {
  initialize: () => DeliveryOpsManagerSnapshot;
  start: () => DeliveryOpsManagerSnapshot;
  stop: () => DeliveryOpsManagerSnapshot;
  status: () => DeliveryOpsManagerSnapshot;
  registerProject: (input: RegisterProjectInput) => DeliveryProject;
  transitionProject: (
    input: TransitionProjectInput,
  ) => ProjectLifecycleRecord;
  registerDelivery: (input: RegisterDeliveryInput) => DeliveryPlan;
  advanceWorkflow: (input: AdvanceDeliveryInput) => DeliveryWorkflowEvent;
  startExecution: (input: StartExecutionInput) => DeliveryExecution;
  recordExecutionStatus: (
    input: RecordExecutionStatusInput,
  ) => ExecutionStatusRecord;
  registerArtifact: (input: RegisterArtifactInput) => DeliveryArtifact;
  trackArtifact: (input: TrackArtifactInput) => ArtifactTrackingRecord;
  runQualityCheck: (input: RunQualityCheckInput) => QualityCheck;
  recordAcceptance: (input: RecordAcceptanceInput) => AcceptanceRecord;
  evaluateReadiness: () => DeliveryOpsReadinessResult;
  manifest: () => DeliveryOpsRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getDeliveryOpsRegistryManifest(): DeliveryOpsRegistryManifest {
  return {
    foundationId: COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
    version: COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION,
    freezeVersion: COMMERCIALIZATION_DELIVERY_OPERATIONS_FREEZE_VERSION,
    base: COMMERCIALIZATION_DELIVERY_OPERATIONS_BASE,
    projectCount: listDeliveryProjects().length,
    lifecycleCount: listProjectLifecycleRecords().length,
    deliveryCount: listDeliveryPlans().length,
    workflowCount: listDeliveryWorkflowEvents().length,
    executionCount: listDeliveryExecutions().length,
    statusCount: listExecutionStatusRecords().length,
    artifactCount: listDeliveryArtifacts().length,
    trackingCount: listArtifactTrackingRecords().length,
    qualityCount: listQualityChecks().length,
    acceptanceCount: listAcceptanceRecords().length,
  };
}

export function clearDeliveryOpsFoundationLayer(): void {
  clearAcceptanceRecords();
  clearQualityChecks();
  clearArtifactTrackingRecords();
  clearDeliveryArtifacts();
  clearExecutionStatusRecords();
  clearDeliveryExecutions();
  clearDeliveryWorkflowEvents();
  clearDeliveryPlans();
  clearProjectLifecycleRecords();
  clearDeliveryProjects();
}

export function createDeliveryOpsFoundationManager(options?: {
  managerId?: string;
}): DeliveryOpsFoundationManager {
  const managerId =
    options?.managerId?.trim() || createId("comm-p5-deliv-mgr");
  let state: DeliveryOpsManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): DeliveryOpsManagerSnapshot {
    const reg = getDeliveryOpsRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
      version: COMMERCIALIZATION_DELIVERY_OPERATIONS_VERSION,
      projectCount: reg.projectCount,
      deliveryCount: reg.deliveryCount,
      executionCount: reg.executionCount,
      artifactCount: reg.artifactCount,
      qualityCount: reg.qualityCount,
      acceptanceCount: reg.acceptanceCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): DeliveryOpsManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearDeliveryOpsFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): DeliveryOpsManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): DeliveryOpsManagerSnapshot {
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
    registerProject: (input) => {
      assertRunning("registerProject");
      return registerProject(input);
    },
    transitionProject: (input) => {
      assertRunning("transitionProject");
      return transitionProject(input);
    },
    registerDelivery: (input) => {
      assertRunning("registerDelivery");
      return registerDelivery(input);
    },
    advanceWorkflow: (input) => {
      assertRunning("advanceWorkflow");
      return advanceDeliveryWorkflow(input);
    },
    startExecution: (input) => {
      assertRunning("startExecution");
      return startExecution(input);
    },
    recordExecutionStatus: (input) => {
      assertRunning("recordExecutionStatus");
      return recordExecutionStatus(input);
    },
    registerArtifact: (input) => {
      assertRunning("registerArtifact");
      return registerArtifact(input);
    },
    trackArtifact: (input) => {
      assertRunning("trackArtifact");
      return trackArtifact(input);
    },
    runQualityCheck: (input) => {
      assertRunning("runQualityCheck");
      return runQualityCheck(input);
    },
    recordAcceptance: (input) => {
      assertRunning("recordAcceptance");
      return recordAcceptance(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateDeliveryOpsReadiness();
    },
    manifest: getDeliveryOpsRegistryManifest,
  };
}

export {
  assertDeliveryOpsReadinessReady,
  getAcceptanceRecord,
  getArtifactTrackingRecord,
  getDeliveryArtifact,
  getDeliveryExecution,
  getDeliveryPlan,
  getDeliveryProject,
  getDeliveryWorkflowEvent,
  getExecutionStatusRecord,
  getProjectLifecycleRecord,
  getQualityCheck,
  listAcceptanceRecords,
  listArtifactTrackingRecords,
  listDeliveryArtifacts,
  listDeliveryExecutions,
  listDeliveryPlans,
  listDeliveryProjects,
  listDeliveryWorkflowEvents,
  listExecutionStatusRecords,
  listProjectLifecycleRecords,
  listQualityChecks,
};
