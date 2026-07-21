/**
 * E11-P7 — Enterprise Control Plane Manager
 * Orchestrates model / policy / orchestration / command / compliance / snapshot
 * Integrates autonomous, governance, observability, tenant, execution
 */

import type { AutonomousManager } from "../autonomous/autonomous.manager";
import type { ExecutionManager } from "../execution/execution.manager";
import type { GovernanceManager } from "../governance/governance.manager";
import type { ObservabilityManager } from "../observability/observability.manager";
import {
  E11_CONTROL_PLANE_BASE,
  E11_CONTROL_PLANE_FREEZE_VERSION,
  E11_CONTROL_PLANE_ID,
  E11_CONTROL_PLANE_VERSION,
} from "./control-plane.constants";
import {
  assessCompliance,
  captureComplianceState,
} from "./control-plane.compliance";
import {
  clearControlCommands,
  dispatchControlCommand,
  getControlCommand,
  issueControlCommand,
  listControlCommands,
} from "./control-plane.command";
import {
  clearControlPlanes,
  getControlPlane,
  listControlPlanes,
  registerControlPlane,
  setControlPlaneStatus,
} from "./control-plane.model";
import {
  clearOrchestrationPlans,
  createOrchestrationPlan,
  executeOrchestration,
  getOrchestrationPlan,
  listOrchestrationPlans,
} from "./control-plane.orchestration";
import {
  clearGlobalPolicies,
  createGlobalPolicy,
  evaluateGlobalPolicy,
  getGlobalPolicy,
  listGlobalPolicies,
} from "./control-plane.policy";
import { captureControlSnapshot } from "./control-plane.snapshot";
import type {
  CommandDispatchResult,
  ComplianceStateReport,
  ControlCommand,
  ControlPlaneManagerStatus,
  ControlPlaneRecord,
  ControlPlaneRegistryManifest,
  ControlSnapshot,
  CreateGlobalPolicyInput,
  CreateOrchestrationInput,
  GlobalPolicy,
  GlobalPolicyEvaluation,
  IssueControlCommandInput,
  OrchestrationPlan,
  OrchestrationResult,
  RegisterControlPlaneInput,
} from "./control-plane.types";

export type ControlPlaneManagerSnapshot = {
  managerId: string;
  status: ControlPlaneManagerStatus;
  layerId: typeof E11_CONTROL_PLANE_ID;
  version: typeof E11_CONTROL_PLANE_VERSION;
  planeCount: number;
  policyCount: number;
  commandCount: number;
  orchestrationCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ControlPlaneDeps = {
  autonomous?: AutonomousManager;
  governance?: GovernanceManager;
  observability?: ObservabilityManager;
  execution?: ExecutionManager;
};

export type ControlPlaneManager = {
  initialize: () => ControlPlaneManagerSnapshot;
  start: () => ControlPlaneManagerSnapshot;
  stop: () => ControlPlaneManagerSnapshot;
  status: () => ControlPlaneManagerSnapshot;
  registerPlane: (input: RegisterControlPlaneInput) => ControlPlaneRecord;
  getPlane: typeof getControlPlane;
  listPlanes: typeof listControlPlanes;
  setPlaneStatus: typeof setControlPlaneStatus;
  createPolicy: (input: CreateGlobalPolicyInput) => GlobalPolicy;
  getPolicy: typeof getGlobalPolicy;
  listPolicies: typeof listGlobalPolicies;
  evaluatePolicy: typeof evaluateGlobalPolicy;
  planOrchestration: (input: CreateOrchestrationInput) => OrchestrationPlan;
  getOrchestration: typeof getOrchestrationPlan;
  listOrchestrations: typeof listOrchestrationPlans;
  runOrchestration: (planId: string) => OrchestrationResult;
  issueCommand: (input: IssueControlCommandInput) => ControlCommand;
  getCommand: typeof getControlCommand;
  listCommands: typeof listControlCommands;
  dispatch: (
    commandId: string,
    deps?: ControlPlaneDeps,
  ) => CommandDispatchResult;
  compliance: (options?: { tenantId?: string }) => ComplianceStateReport;
  snapshot: (options?: {
    tenantId?: string;
    metadata?: Record<string, unknown>;
  }) => ControlSnapshot;
  /** Full sweep: compliance + optional autonomous react + snapshot */
  sweep: (
    deps: ControlPlaneDeps & { tenantId?: string },
  ) => {
    compliance: ComplianceStateReport;
    snapshot: ControlSnapshot;
    react?: { anomalies: number; operations: string[]; incidents: string[] };
  };
  manifest: () => ControlPlaneRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createControlPlaneManager(options?: {
  managerId?: string;
}): ControlPlaneManager {
  const managerId =
    options?.managerId?.trim() || createId("e11-cp-mgr");
  let state: ControlPlaneManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ControlPlaneManagerSnapshot {
    return {
      managerId,
      status: state,
      layerId: E11_CONTROL_PLANE_ID,
      version: E11_CONTROL_PLANE_VERSION,
      planeCount: listControlPlanes().length,
      policyCount: listGlobalPolicies().length,
      commandCount: listControlCommands().length,
      orchestrationCount: listOrchestrationPlans().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ControlPlaneManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearGlobalPolicies();
    clearControlCommands();
    clearOrchestrationPlans();
    clearControlPlanes();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ControlPlaneManagerSnapshot {
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

  function stop(): ControlPlaneManagerSnapshot {
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
    registerPlane: (input) => {
      assertRunning("registerPlane");
      return registerControlPlane(input);
    },
    getPlane: getControlPlane,
    listPlanes: listControlPlanes,
    setPlaneStatus: (id, status) => {
      assertRunning("setPlaneStatus");
      return setControlPlaneStatus(id, status);
    },
    createPolicy: (input) => {
      assertRunning("createPolicy");
      return createGlobalPolicy(input);
    },
    getPolicy: getGlobalPolicy,
    listPolicies: listGlobalPolicies,
    evaluatePolicy: evaluateGlobalPolicy,
    planOrchestration: (input) => {
      assertRunning("planOrchestration");
      return createOrchestrationPlan(input);
    },
    getOrchestration: getOrchestrationPlan,
    listOrchestrations: listOrchestrationPlans,
    runOrchestration: (planId) => {
      assertRunning("runOrchestration");
      return executeOrchestration(planId);
    },
    issueCommand: (input) => {
      assertRunning("issueCommand");
      return issueControlCommand(input);
    },
    getCommand: getControlCommand,
    listCommands: listControlCommands,
    dispatch: (commandId, deps) => {
      assertRunning("dispatch");
      return dispatchControlCommand(commandId, deps ?? {});
    },
    compliance: (opts) => {
      assertRunning("compliance");
      return captureComplianceState(opts);
    },
    snapshot: (opts) => {
      assertRunning("snapshot");
      return captureControlSnapshot({
        ...opts,
        commandCount: listControlCommands().length,
      });
    },
    sweep: (deps) => {
      assertRunning("sweep");
      const compliance = assessCompliance({ tenantId: deps.tenantId });
      let react:
        | { anomalies: number; operations: string[]; incidents: string[] }
        | undefined;
      if (deps.autonomous) {
        react = deps.autonomous.reactToAnomalies({
          tenantId: deps.tenantId,
          execution: deps.execution,
        });
      }
      if (deps.observability) {
        deps.observability.detectAnomalies();
      }
      const snap = captureControlSnapshot({
        tenantId: deps.tenantId,
        commandCount: listControlCommands().length,
      });
      return { compliance, snapshot: snap, react };
    },
    manifest: () => ({
      planeId: E11_CONTROL_PLANE_ID,
      version: E11_CONTROL_PLANE_VERSION,
      freezeVersion: E11_CONTROL_PLANE_FREEZE_VERSION,
      base: E11_CONTROL_PLANE_BASE,
      planeCount: listControlPlanes().length,
      policyCount: listGlobalPolicies().length,
      commandCount: listControlCommands().length,
      orchestrationCount: listOrchestrationPlans().length,
    }),
  };
}

export function getControlPlaneRegistryManifest(): ControlPlaneRegistryManifest {
  return {
    planeId: E11_CONTROL_PLANE_ID,
    version: E11_CONTROL_PLANE_VERSION,
    freezeVersion: E11_CONTROL_PLANE_FREEZE_VERSION,
    base: E11_CONTROL_PLANE_BASE,
    planeCount: listControlPlanes().length,
    policyCount: listGlobalPolicies().length,
    commandCount: listControlCommands().length,
    orchestrationCount: listOrchestrationPlans().length,
  };
}
