/**
 * E11-P4 — Governance Manager
 * Orchestrates resource / allocation / capacity / throttle / admission / metrics
 * Integrates tenant quota, execution manager, runtime registry
 */

import type { ExecutionManager } from "../execution/execution.manager";
import {
  E11_GOVERNANCE_BASE,
  E11_GOVERNANCE_FREEZE_VERSION,
  E11_GOVERNANCE_ID,
  E11_GOVERNANCE_VERSION,
} from "./governance.constants";
import {
  allocateResource,
  clearAllocations,
  getAllocation,
  listAllocations,
  releaseAllocation,
} from "./governance.allocation";
import {
  evaluateAdmission,
  resetAdmissionCounters,
} from "./governance.admission";
import {
  captureAllCapacities,
  captureCapacity,
} from "./governance.capacity";
import { captureGovernanceMetrics } from "./governance.metrics";
import {
  clearResources,
  getResource,
  listResources,
  registerResource,
} from "./governance.resource";
import {
  clearThrottlePolicies,
  createThrottlePolicy,
  listThrottlePolicies,
  resolveThrottlePolicy,
} from "./governance.throttle";
import type {
  AdmissionRequest,
  AdmissionResult,
  AllocateResourceInput,
  CapacitySnapshot,
  CreateThrottlePolicyInput,
  GovernanceManagerStatus,
  GovernanceMetrics,
  GovernanceRegistryManifest,
  GovernanceResource,
  RegisterGovernanceResourceInput,
  ResourceAllocation,
  ThrottlePolicy,
} from "./governance.types";

export type GovernanceManagerSnapshot = {
  managerId: string;
  status: GovernanceManagerStatus;
  layerId: typeof E11_GOVERNANCE_ID;
  version: typeof E11_GOVERNANCE_VERSION;
  resourceCount: number;
  activeAllocationCount: number;
  throttlePolicyCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type GovernanceManager = {
  initialize: () => GovernanceManagerSnapshot;
  start: () => GovernanceManagerSnapshot;
  stop: () => GovernanceManagerSnapshot;
  status: () => GovernanceManagerSnapshot;
  registerResource: (
    input: RegisterGovernanceResourceInput,
  ) => GovernanceResource;
  getResource: typeof getResource;
  listResources: typeof listResources;
  allocate: (input: AllocateResourceInput) => ResourceAllocation;
  release: (allocationId: string) => ResourceAllocation;
  getAllocation: typeof getAllocation;
  listAllocations: typeof listAllocations;
  capacity: (resourceId: string) => CapacitySnapshot;
  capacities: typeof captureAllCapacities;
  createThrottlePolicy: (input: CreateThrottlePolicyInput) => ThrottlePolicy;
  listThrottlePolicies: typeof listThrottlePolicies;
  admit: (request: AdmissionRequest) => AdmissionResult;
  /** Admit then allocate when ADMIT. */
  admitAndAllocate: (
    request: AdmissionRequest,
  ) => {
    admission: AdmissionResult;
    allocation?: ResourceAllocation;
  };
  /**
   * Admit + allocate, then create/queue/execute via execution manager when allowed.
   */
  admitAndExecute: (
    execution: ExecutionManager,
    input: {
      tenantId: string;
      resourceId: string;
      runtimeId: string;
      amount: number;
      priority?: AdmissionRequest["priority"];
      taskName: string;
      kind?: "JOB" | "INVOKE" | "BATCH" | "PROBE";
      payload?: Record<string, unknown>;
    },
  ) => {
    admission: AdmissionResult;
    allocation?: ResourceAllocation;
    executed: boolean;
    taskId?: string;
  };
  metrics: () => GovernanceMetrics;
  manifest: () => GovernanceRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createGovernanceManager(options?: {
  managerId?: string;
}): GovernanceManager {
  const managerId =
    options?.managerId?.trim() || createId("e11-gov-mgr");
  let state: GovernanceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): GovernanceManagerSnapshot {
    return {
      managerId,
      status: state,
      layerId: E11_GOVERNANCE_ID,
      version: E11_GOVERNANCE_VERSION,
      resourceCount: listResources().length,
      activeAllocationCount: listAllocations({ status: "ACTIVE" }).length,
      throttlePolicyCount: listThrottlePolicies().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): GovernanceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAllocations();
    clearResources();
    clearThrottlePolicies();
    resetAdmissionCounters();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): GovernanceManagerSnapshot {
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

  function stop(): GovernanceManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    for (const a of listAllocations({ status: "ACTIVE" })) {
      try {
        releaseAllocation(a.id);
      } catch {
        // ignore
      }
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  function admitAndAllocate(request: AdmissionRequest) {
    assertRunning("admitAndAllocate");
    const admission = evaluateAdmission(request);
    if (admission.decision !== "ADMIT") {
      return { admission };
    }
    const allocation = allocateResource({
      resourceId: request.resourceId,
      tenantId: request.tenantId,
      runtimeId: request.runtimeId,
      amount: request.amount,
      priority: request.priority ?? admission.priority,
    });
    return { admission, allocation };
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerResource: (input) => {
      assertRunning("registerResource");
      return registerResource(input);
    },
    getResource,
    listResources,
    allocate: (input) => {
      assertRunning("allocate");
      return allocateResource(input);
    },
    release: (allocationId) => {
      assertRunning("release");
      return releaseAllocation(allocationId);
    },
    getAllocation,
    listAllocations,
    capacity: (resourceId) => {
      assertRunning("capacity");
      return captureCapacity(resourceId);
    },
    capacities: captureAllCapacities,
    createThrottlePolicy: (input) => {
      assertRunning("createThrottlePolicy");
      return createThrottlePolicy(input);
    },
    listThrottlePolicies,
    admit: (request) => {
      assertRunning("admit");
      return evaluateAdmission(request);
    },
    admitAndAllocate,
    admitAndExecute: (execution, input) => {
      assertRunning("admitAndExecute");
      const { admission, allocation } = admitAndAllocate({
        tenantId: input.tenantId,
        resourceId: input.resourceId,
        runtimeId: input.runtimeId,
        amount: input.amount,
        priority: input.priority,
      });
      if (admission.decision !== "ADMIT" || !allocation || allocation.status !== "ACTIVE") {
        return { admission, allocation, executed: false };
      }
      const task = execution.createTask({
        name: input.taskName,
        kind: input.kind ?? "INVOKE",
        runtimeId: input.runtimeId,
        priority:
          input.priority === "CRITICAL"
            ? "CRITICAL"
            : input.priority === "HIGH"
              ? "HIGH"
              : input.priority === "LOW"
                ? "LOW"
                : "NORMAL",
        payload: {
          ...(input.payload ?? {}),
          tenantId: input.tenantId,
          allocationId: allocation.id,
          resourceId: input.resourceId,
        },
      });
      execution.queue(task.id);
      execution.execute(task.id);
      return {
        admission,
        allocation,
        executed: true,
        taskId: task.id,
      };
    },
    metrics: () => captureGovernanceMetrics(),
    manifest: () => ({
      governanceId: E11_GOVERNANCE_ID,
      version: E11_GOVERNANCE_VERSION,
      freezeVersion: E11_GOVERNANCE_FREEZE_VERSION,
      base: E11_GOVERNANCE_BASE,
      resourceCount: listResources().length,
      allocationCount: listAllocations().length,
      throttlePolicyCount: listThrottlePolicies().length,
    }),
  };
}

export function getGovernanceRegistryManifest(): GovernanceRegistryManifest {
  return {
    governanceId: E11_GOVERNANCE_ID,
    version: E11_GOVERNANCE_VERSION,
    freezeVersion: E11_GOVERNANCE_FREEZE_VERSION,
    base: E11_GOVERNANCE_BASE,
    resourceCount: listResources().length,
    allocationCount: listAllocations().length,
    throttlePolicyCount: listThrottlePolicies().length,
  };
}

export { resolveThrottlePolicy };
