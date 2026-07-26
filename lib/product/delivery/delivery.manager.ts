/**
 * Product Delivery — Delivery Engine Manager
 */

import {
  clearDeliveryDispatchContracts,
  getDeliveryDispatchContract,
  listDeliveryDispatchContracts,
  registerDeliveryDispatchContract,
  updateDeliveryDispatchContractStatus,
} from "./dispatch/dispatch.registry";
import type {
  DeliveryDispatchContract,
  RegisterDeliveryDispatchContractInput,
  UpdateDeliveryDispatchContractStatusInput,
} from "./dispatch/dispatch.types";
import {
  clearDeliveryReleaseManifests,
  createDeliveryReleaseManifest,
  getDeliveryReleaseManifest,
  listDeliveryReleaseManifests,
  type DeliveryReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_DELIVERY_ENGINE_BASE,
  PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION,
  PRODUCT_DELIVERY_ENGINE_ID,
  PRODUCT_DELIVERY_ENGINE_VERSION,
} from "./management/management.constants";
import {
  assertDeliveryEngineReadinessReady,
  evaluateDeliveryEngineReadiness,
} from "./management/management.readiness";
import type {
  DeliveryManagerStatus,
  DeliveryReadinessResult,
  DeliveryRegistryManifest,
} from "./management/management.types";
import {
  clearDeliveryPipelines,
  defineDeliveryPipeline,
  getDeliveryPipeline,
  listDeliveryPipelines,
} from "./pipeline/pipeline.registry";
import type {
  DefineDeliveryPipelineInput,
  DeliveryPipeline,
} from "./pipeline/pipeline.types";
import {
  clearDeliveryRequests,
  createDeliveryRequest,
  getDeliveryRequest,
  listDeliveryRequests,
} from "./request/request.registry";
import type {
  CreateDeliveryRequestInput,
  DeliveryRequest,
} from "./request/request.types";
import {
  attachDeliveryRetryPolicy,
  clearDeliveryRetryPolicies,
  getDeliveryRetryPolicy,
  listDeliveryRetryPolicies,
} from "./retry/retry.registry";
import type {
  AttachDeliveryRetryPolicyInput,
  DeliveryRetryPolicy,
} from "./retry/retry.types";
import {
  clearDeliveryStatuses,
  getDeliveryStatus,
  listDeliveryStatuses,
  openDeliveryStatus,
  updateDeliveryStatus,
} from "./status/status.registry";
import type {
  DeliveryStatusRecord,
  OpenDeliveryStatusInput,
  UpdateDeliveryStatusInput,
} from "./status/status.types";

export type DeliveryManagerSnapshot = {
  managerId: string;
  status: DeliveryManagerStatus;
  layerId: typeof PRODUCT_DELIVERY_ENGINE_ID;
  version: typeof PRODUCT_DELIVERY_ENGINE_VERSION;
  requestCount: number;
  pipelineCount: number;
  statusCount: number;
  retryPolicyCount: number;
  dispatchCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type DeliveryManager = {
  initialize: () => DeliveryManagerSnapshot;
  start: () => DeliveryManagerSnapshot;
  stop: () => DeliveryManagerSnapshot;
  status: () => DeliveryManagerSnapshot;
  createRequest: (input: CreateDeliveryRequestInput) => DeliveryRequest;
  definePipeline: (input: DefineDeliveryPipelineInput) => DeliveryPipeline;
  openStatus: (input: OpenDeliveryStatusInput) => DeliveryStatusRecord;
  updateStatus: (input: UpdateDeliveryStatusInput) => DeliveryStatusRecord;
  attachRetryPolicy: (
    input: AttachDeliveryRetryPolicyInput,
  ) => DeliveryRetryPolicy;
  registerDispatchContract: (
    input: RegisterDeliveryDispatchContractInput,
  ) => DeliveryDispatchContract;
  updateDispatchContractStatus: (
    input: UpdateDeliveryDispatchContractStatusInput,
  ) => DeliveryDispatchContract;
  createReleaseManifest: (input: {
    id?: string;
    requestId: string;
  }) => DeliveryReleaseManifest;
  evaluateReadiness: () => DeliveryReadinessResult;
  manifest: () => DeliveryRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getDeliveryRegistryManifest(): DeliveryRegistryManifest {
  return {
    engineId: PRODUCT_DELIVERY_ENGINE_ID,
    version: PRODUCT_DELIVERY_ENGINE_VERSION,
    freezeVersion: PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION,
    base: PRODUCT_DELIVERY_ENGINE_BASE,
    requestCount: listDeliveryRequests().length,
    pipelineCount: listDeliveryPipelines().length,
    statusCount: listDeliveryStatuses().length,
    retryPolicyCount: listDeliveryRetryPolicies().length,
    dispatchCount: listDeliveryDispatchContracts().length,
    releaseCount: listDeliveryReleaseManifests().length,
  };
}

export function clearDeliveryEngineLayer(): void {
  clearDeliveryReleaseManifests();
  clearDeliveryDispatchContracts();
  clearDeliveryRetryPolicies();
  clearDeliveryStatuses();
  clearDeliveryPipelines();
  clearDeliveryRequests();
}

export function createDeliveryManager(options?: {
  managerId?: string;
}): DeliveryManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-dlv-mgr");
  let state: DeliveryManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): DeliveryManagerSnapshot {
    const reg = getDeliveryRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_DELIVERY_ENGINE_ID,
      version: PRODUCT_DELIVERY_ENGINE_VERSION,
      requestCount: reg.requestCount,
      pipelineCount: reg.pipelineCount,
      statusCount: reg.statusCount,
      retryPolicyCount: reg.retryPolicyCount,
      dispatchCount: reg.dispatchCount,
      releaseCount: reg.releaseCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): DeliveryManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearDeliveryEngineLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): DeliveryManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): DeliveryManagerSnapshot {
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
    createRequest: (input) => {
      assertRunning("createRequest");
      return createDeliveryRequest(input);
    },
    definePipeline: (input) => {
      assertRunning("definePipeline");
      return defineDeliveryPipeline(input);
    },
    openStatus: (input) => {
      assertRunning("openStatus");
      return openDeliveryStatus(input);
    },
    updateStatus: (input) => {
      assertRunning("updateStatus");
      return updateDeliveryStatus(input);
    },
    attachRetryPolicy: (input) => {
      assertRunning("attachRetryPolicy");
      return attachDeliveryRetryPolicy(input);
    },
    registerDispatchContract: (input) => {
      assertRunning("registerDispatchContract");
      return registerDeliveryDispatchContract(input);
    },
    updateDispatchContractStatus: (input) => {
      assertRunning("updateDispatchContractStatus");
      return updateDeliveryDispatchContractStatus(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createDeliveryReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateDeliveryEngineReadiness();
    },
    manifest: getDeliveryRegistryManifest,
  };
}

export {
  assertDeliveryEngineReadinessReady,
  getDeliveryDispatchContract,
  getDeliveryPipeline,
  getDeliveryReleaseManifest,
  getDeliveryRequest,
  getDeliveryRetryPolicy,
  getDeliveryStatus,
  listDeliveryDispatchContracts,
  listDeliveryPipelines,
  listDeliveryReleaseManifests,
  listDeliveryRequests,
  listDeliveryRetryPolicies,
  listDeliveryStatuses,
};
