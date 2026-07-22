/**
 * Post-Launch P2 — Customer Success Operations Manager
 */

import { getCommercialControlRegistryManifest } from "../../product/e12/commercial/commercial.manager";
import { getTenantProductRegistryManifest } from "../../product/e12/tenant/tenant.manager";
import { getSupportRegistryManifest } from "../../launch/support/support.manager";
import { getOperationsRegistryManifest } from "../production/production.manager";
import {
  clearAdoptionRecords,
  getAdoptionRecord,
  getLatestAdoption,
  listAdoptionRecords,
  recordAdoption,
} from "./success.adoption";
import {
  OPERATIONS_CUSTOMER_SUCCESS_BASE,
  OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  OPERATIONS_CUSTOMER_SUCCESS_ID,
  OPERATIONS_CUSTOMER_SUCCESS_VERSION,
} from "./success.constants";
import {
  clearCustomerHealthProfiles,
  createCustomerHealthProfile,
  getCustomerHealthProfile,
  listCustomerHealthProfiles,
  reassessCustomerHealth,
} from "./success.health";
import {
  clearLifecycleOperations,
  getLifecycleOperation,
  listLifecycleOperations,
  runLifecycleOperation,
} from "./success.lifecycle";
import { computeEngagementMetrics } from "./success.metrics";
import {
  assertCustomerSuccessReadinessReady,
  evaluateCustomerSuccessReadiness,
} from "./success.readiness";
import {
  clearSuccessWorkflows,
  getSuccessWorkflow,
  listSuccessWorkflows,
  startSuccessWorkflow,
} from "./success.workflow";
import type {
  AdoptionRecord,
  CreateCustomerHealthProfileInput,
  CustomerHealthProfile,
  CustomerSuccessManagerStatus,
  CustomerSuccessReadinessResult,
  CustomerSuccessRegistryManifest,
  EngagementMetrics,
  LifecycleOperation,
  RecordAdoptionInput,
  RunLifecycleOperationInput,
  StartSuccessWorkflowInput,
  SuccessWorkflow,
} from "./success.types";

export type CustomerSuccessManagerSnapshot = {
  managerId: string;
  status: CustomerSuccessManagerStatus;
  layerId: typeof OPERATIONS_CUSTOMER_SUCCESS_ID;
  version: typeof OPERATIONS_CUSTOMER_SUCCESS_VERSION;
  healthProfileCount: number;
  adoptionCount: number;
  workflowCount: number;
  lifecycleOperationCount: number;
  productionOperationCount: number;
  supportProfileCount: number;
  tenantCount: number;
  commercialCustomerCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CustomerSuccessOperationsManager = {
  initialize: () => CustomerSuccessManagerSnapshot;
  start: () => CustomerSuccessManagerSnapshot;
  stop: () => CustomerSuccessManagerSnapshot;
  status: () => CustomerSuccessManagerSnapshot;
  createHealthProfile: (
    input: CreateCustomerHealthProfileInput,
  ) => CustomerHealthProfile;
  reassessHealth: typeof reassessCustomerHealth;
  getHealthProfile: typeof getCustomerHealthProfile;
  listHealthProfiles: typeof listCustomerHealthProfiles;
  recordAdoption: (input: RecordAdoptionInput) => AdoptionRecord;
  getAdoption: typeof getAdoptionRecord;
  getLatestAdoption: typeof getLatestAdoption;
  listAdoptions: typeof listAdoptionRecords;
  startWorkflow: (input: StartSuccessWorkflowInput) => SuccessWorkflow;
  getWorkflow: typeof getSuccessWorkflow;
  listWorkflows: typeof listSuccessWorkflows;
  runLifecycle: (input: RunLifecycleOperationInput) => LifecycleOperation;
  getLifecycle: typeof getLifecycleOperation;
  listLifecycles: typeof listLifecycleOperations;
  computeMetrics: (customerHealthProfileId: string) => EngagementMetrics;
  evaluateReadiness: (
    customerHealthProfileId: string,
  ) => CustomerSuccessReadinessResult;
  manifest: () => CustomerSuccessRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getCustomerSuccessRegistryManifest(): CustomerSuccessRegistryManifest {
  return {
    customerSuccessId: OPERATIONS_CUSTOMER_SUCCESS_ID,
    version: OPERATIONS_CUSTOMER_SUCCESS_VERSION,
    freezeVersion: OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION,
    base: OPERATIONS_CUSTOMER_SUCCESS_BASE,
    healthProfileCount: listCustomerHealthProfiles().length,
    adoptionCount: listAdoptionRecords().length,
    workflowCount: listSuccessWorkflows().length,
    lifecycleOperationCount: listLifecycleOperations().length,
  };
}

export function clearCustomerSuccessLayer(): void {
  clearSuccessWorkflows();
  clearLifecycleOperations();
  clearAdoptionRecords();
  clearCustomerHealthProfiles();
}

export function createCustomerSuccessOperationsManager(options?: {
  managerId?: string;
}): CustomerSuccessOperationsManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-p2-cs-mgr");
  let state: CustomerSuccessManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): CustomerSuccessManagerSnapshot {
    const opsReg = getOperationsRegistryManifest();
    const supportReg = getSupportRegistryManifest();
    const tenantReg = getTenantProductRegistryManifest();
    const commercialReg = getCommercialControlRegistryManifest();
    const reg = getCustomerSuccessRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_CUSTOMER_SUCCESS_ID,
      version: OPERATIONS_CUSTOMER_SUCCESS_VERSION,
      healthProfileCount: reg.healthProfileCount,
      adoptionCount: reg.adoptionCount,
      workflowCount: reg.workflowCount,
      lifecycleOperationCount: reg.lifecycleOperationCount,
      productionOperationCount: opsReg.operationCount,
      supportProfileCount: supportReg.profileCount,
      tenantCount: tenantReg.tenantCount,
      commercialCustomerCount: commercialReg.customerCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): CustomerSuccessManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearCustomerSuccessLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): CustomerSuccessManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): CustomerSuccessManagerSnapshot {
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
    createHealthProfile: (input) => {
      assertRunning("createHealthProfile");
      return createCustomerHealthProfile(input);
    },
    reassessHealth: (id, patch) => {
      assertRunning("reassessHealth");
      return reassessCustomerHealth(id, patch);
    },
    getHealthProfile: getCustomerHealthProfile,
    listHealthProfiles: listCustomerHealthProfiles,
    recordAdoption: (input) => {
      assertRunning("recordAdoption");
      return recordAdoption(input);
    },
    getAdoption: getAdoptionRecord,
    getLatestAdoption,
    listAdoptions: listAdoptionRecords,
    startWorkflow: (input) => {
      assertRunning("startWorkflow");
      return startSuccessWorkflow(input);
    },
    getWorkflow: getSuccessWorkflow,
    listWorkflows: listSuccessWorkflows,
    runLifecycle: (input) => {
      assertRunning("runLifecycle");
      return runLifecycleOperation(input);
    },
    getLifecycle: getLifecycleOperation,
    listLifecycles: listLifecycleOperations,
    computeMetrics: (customerHealthProfileId) => {
      assertRunning("computeMetrics");
      return computeEngagementMetrics(customerHealthProfileId);
    },
    evaluateReadiness: (customerHealthProfileId) => {
      assertRunning("evaluateReadiness");
      return evaluateCustomerSuccessReadiness(customerHealthProfileId);
    },
    manifest: getCustomerSuccessRegistryManifest,
  };
}

export { assertCustomerSuccessReadinessReady };
