/**
 * Launch L4 — Enterprise Delivery Validation Manager
 */

import {
  clearArtifactReports,
  generateArtifactReport,
  getArtifactReport,
  listArtifactReports,
} from "./artifact/artifact.report";
import type {
  ArtifactReport,
  ArtifactVerification,
  DeliveryArtifact,
  GenerateArtifactReportInput,
  RegisterDeliveryArtifactInput,
  VerifyArtifactInput,
} from "./artifact/artifact.types";
import {
  clearDeliveryArtifacts,
  listArtifactVerifications,
  listDeliveryArtifacts,
  registerDeliveryArtifact,
  verifyDeliveryArtifact,
} from "./artifact/artifact.verify";
import {
  acceptEnterpriseDelivery,
  clearDeliveryAcceptances,
  getDeliveryAcceptance,
  listDeliveryAcceptances,
} from "./delivery/delivery.acceptance";
import {
  assertL4DeliveryValidationReadinessReady,
  evaluateL4DeliveryValidationReadiness,
} from "./delivery/delivery.readiness";
import {
  clearDeliveryStatusRecords,
  getDeliveryStatusRecord,
  listDeliveryStatusRecords,
  updateDeliveryStatus,
} from "./delivery/delivery.status";
import type {
  AcceptDeliveryInput,
  DeliveryAcceptance,
  DeliveryStatusRecord,
  L4ManagerStatus,
  L4ReadinessResult,
  L4RegistryManifest,
  UpdateDeliveryStatusInput,
} from "./delivery/delivery.types";
import {
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION,
} from "./scenario/scenario.constants";
import {
  clearScenarios,
  getScenario,
  listScenarios,
  registerScenario,
} from "./scenario/scenario.registry";
import type {
  DeliveryScenario,
  RegisterScenarioInput,
} from "./scenario/scenario.types";
import {
  clearValidationChecks,
  getValidationCheck,
  listValidationChecks,
  runValidationCheck,
} from "./validation/validation.checks";
import {
  clearValidationResults,
  evaluateValidationResult,
  getValidationResult,
  listValidationResults,
} from "./validation/validation.result";
import type {
  EvaluateValidationResultInput,
  RunValidationCheckInput,
  ValidationCheck,
  ValidationResult,
} from "./validation/validation.types";
import {
  clearWorkflows,
  createWorkflow,
  getWorkflow,
  listWorkflows,
} from "./workflow/workflow.engine";
import {
  advanceWorkflowStep,
  clearWorkflowSteps,
  listWorkflowSteps,
} from "./workflow/workflow.steps";
import type {
  AdvanceWorkflowStepInput,
  CreateWorkflowInput,
  WorkflowDefinition,
  WorkflowStep,
} from "./workflow/workflow.types";

export type L4DeliveryValidationManagerSnapshot = {
  managerId: string;
  status: L4ManagerStatus;
  layerId: typeof LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID;
  version: typeof LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION;
  scenarioCount: number;
  workflowCount: number;
  checkCount: number;
  artifactCount: number;
  acceptanceCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type L4DeliveryValidationManager = {
  initialize: () => L4DeliveryValidationManagerSnapshot;
  start: () => L4DeliveryValidationManagerSnapshot;
  stop: () => L4DeliveryValidationManagerSnapshot;
  status: () => L4DeliveryValidationManagerSnapshot;
  registerScenario: (input: RegisterScenarioInput) => DeliveryScenario;
  createWorkflow: (input: CreateWorkflowInput) => WorkflowDefinition;
  advanceStep: (input: AdvanceWorkflowStepInput) => WorkflowStep;
  runCheck: (input: RunValidationCheckInput) => ValidationCheck;
  evaluateValidation: (
    input: EvaluateValidationResultInput,
  ) => ValidationResult;
  registerArtifact: (
    input: RegisterDeliveryArtifactInput,
  ) => DeliveryArtifact;
  verifyArtifact: (input: VerifyArtifactInput) => ArtifactVerification;
  generateReport: (input: GenerateArtifactReportInput) => ArtifactReport;
  acceptDelivery: (input: AcceptDeliveryInput) => DeliveryAcceptance;
  updateStatus: (input: UpdateDeliveryStatusInput) => DeliveryStatusRecord;
  evaluateReadiness: () => L4ReadinessResult;
  manifest: () => L4RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getL4RegistryManifest(): L4RegistryManifest {
  return {
    foundationId: LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID,
    version: LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION,
    freezeVersion: LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION,
    base: LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE,
    scenarioCount: listScenarios().length,
    workflowCount: listWorkflows().length,
    stepCount: listWorkflowSteps().length,
    checkCount: listValidationChecks().length,
    validationResultCount: listValidationResults().length,
    artifactCount: listDeliveryArtifacts().length,
    reportCount: listArtifactReports().length,
    acceptanceCount: listDeliveryAcceptances().length,
    statusCount: listDeliveryStatusRecords().length,
  };
}

export function clearL4DeliveryValidationLayer(): void {
  clearDeliveryStatusRecords();
  clearDeliveryAcceptances();
  clearArtifactReports();
  clearDeliveryArtifacts();
  clearValidationResults();
  clearValidationChecks();
  clearWorkflowSteps();
  clearWorkflows();
  clearScenarios();
}

export function createL4DeliveryValidationManager(options?: {
  managerId?: string;
}): L4DeliveryValidationManager {
  const managerId =
    options?.managerId?.trim() || createId("launch-l4-val-mgr");
  let state: L4ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): L4DeliveryValidationManagerSnapshot {
    const reg = getL4RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID,
      version: LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION,
      scenarioCount: reg.scenarioCount,
      workflowCount: reg.workflowCount,
      checkCount: reg.checkCount,
      artifactCount: reg.artifactCount,
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

  function initialize(): L4DeliveryValidationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearL4DeliveryValidationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): L4DeliveryValidationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): L4DeliveryValidationManagerSnapshot {
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
    registerScenario: (input) => {
      assertRunning("registerScenario");
      return registerScenario(input);
    },
    createWorkflow: (input) => {
      assertRunning("createWorkflow");
      return createWorkflow(input);
    },
    advanceStep: (input) => {
      assertRunning("advanceStep");
      return advanceWorkflowStep(input);
    },
    runCheck: (input) => {
      assertRunning("runCheck");
      return runValidationCheck(input);
    },
    evaluateValidation: (input) => {
      assertRunning("evaluateValidation");
      return evaluateValidationResult(input);
    },
    registerArtifact: (input) => {
      assertRunning("registerArtifact");
      return registerDeliveryArtifact(input);
    },
    verifyArtifact: (input) => {
      assertRunning("verifyArtifact");
      return verifyDeliveryArtifact(input);
    },
    generateReport: (input) => {
      assertRunning("generateReport");
      return generateArtifactReport(input);
    },
    acceptDelivery: (input) => {
      assertRunning("acceptDelivery");
      return acceptEnterpriseDelivery(input);
    },
    updateStatus: (input) => {
      assertRunning("updateStatus");
      return updateDeliveryStatus(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateL4DeliveryValidationReadiness();
    },
    manifest: getL4RegistryManifest,
  };
}

export {
  assertL4DeliveryValidationReadinessReady,
  getArtifactReport,
  getDeliveryAcceptance,
  getDeliveryStatusRecord,
  getScenario,
  getValidationCheck,
  getValidationResult,
  getWorkflow,
  listArtifactReports,
  listArtifactVerifications,
  listDeliveryAcceptances,
  listDeliveryArtifacts,
  listDeliveryStatusRecords,
  listScenarios,
  listValidationChecks,
  listValidationResults,
  listWorkflowSteps,
  listWorkflows,
};
