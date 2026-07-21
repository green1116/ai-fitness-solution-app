/**
 * E11-P3 — Tenant Manager
 * Orchestrates org / namespace / quota / policy / router
 * Integrates registry + execution manager + cloud context
 */

import type { ExecutionManager } from "../execution/execution.manager";
import { openContext } from "../runtime/cloud.context";
import type { OpenCloudContextInput } from "../types/cloud.types";
import {
  E11_TENANT_BASE,
  E11_TENANT_FREEZE_VERSION,
  E11_TENANT_ID,
  E11_TENANT_VERSION,
} from "./tenant.constants";
import {
  bindRuntimeToTenant,
  clearTenants,
  getTenant,
  listTenants,
  registerTenant,
  setTenantStatus,
  unbindRuntimeFromTenant,
} from "./tenant.namespace";
import {
  clearOrganizations,
  getOrganization,
  listOrganizations,
  registerOrganization,
  setOrganizationStatus,
} from "./tenant.organization";
import {
  clearIsolationPolicies,
  createIsolationPolicy,
  getIsolationPolicyByTenant,
  listIsolationPolicies,
} from "./tenant.policy";
import {
  clearTenantQuotas,
  createTenantQuota,
  getTenantQuotaByType,
  listTenantQuotas,
  releaseQuota,
} from "./tenant.quota";
import { routeTenantRuntime } from "./tenant.router";
import type {
  CreateIsolationPolicyInput,
  CreateTenantQuotaInput,
  IsolationPolicy,
  Organization,
  RegisterOrganizationInput,
  RegisterTenantInput,
  TenantManagerStatus,
  TenantNamespace,
  TenantQuota,
  TenantRegistryManifest,
  TenantRouteRequest,
  TenantRouteResult,
} from "./tenant.types";

export type TenantManagerSnapshot = {
  managerId: string;
  status: TenantManagerStatus;
  layerId: typeof E11_TENANT_ID;
  version: typeof E11_TENANT_VERSION;
  organizationCount: number;
  tenantCount: number;
  quotaCount: number;
  policyCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type TenantManager = {
  initialize: () => TenantManagerSnapshot;
  start: () => TenantManagerSnapshot;
  stop: () => TenantManagerSnapshot;
  status: () => TenantManagerSnapshot;
  registerOrganization: (input: RegisterOrganizationInput) => Organization;
  getOrganization: typeof getOrganization;
  listOrganizations: typeof listOrganizations;
  setOrganizationStatus: typeof setOrganizationStatus;
  registerTenant: (input: RegisterTenantInput) => TenantNamespace;
  getTenant: typeof getTenant;
  listTenants: typeof listTenants;
  setTenantStatus: typeof setTenantStatus;
  bindRuntime: (tenantId: string, runtimeId: string) => TenantNamespace;
  unbindRuntime: (tenantId: string, runtimeId: string) => TenantNamespace;
  createQuota: (input: CreateTenantQuotaInput) => TenantQuota;
  getQuotaByType: typeof getTenantQuotaByType;
  listQuotas: typeof listTenantQuotas;
  createPolicy: (input: CreateIsolationPolicyInput) => IsolationPolicy;
  getPolicyByTenant: typeof getIsolationPolicyByTenant;
  listPolicies: typeof listIsolationPolicies;
  route: (
    request: TenantRouteRequest,
    options?: { reserve?: boolean },
  ) => TenantRouteResult;
  openTenantContext: (
    tenantId: string,
    input: Omit<OpenCloudContextInput, "runtimeId"> & { runtimeId: string },
  ) => ReturnType<typeof openContext>;
  routeAndExecute: (
    execution: ExecutionManager,
    input: {
      tenantId: string;
      runtimeId: string;
      organizationId?: string;
      taskName: string;
      kind?: "JOB" | "INVOKE" | "BATCH" | "PROBE";
      payload?: Record<string, unknown>;
    },
  ) => {
    route: TenantRouteResult;
    executed: boolean;
    taskId?: string;
  };
  releaseQuota: typeof releaseQuota;
  manifest: () => TenantRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createTenantManager(options?: {
  managerId?: string;
}): TenantManager {
  const managerId =
    options?.managerId?.trim() || createId("e11-tenant-mgr");
  let state: TenantManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): TenantManagerSnapshot {
    return {
      managerId,
      status: state,
      layerId: E11_TENANT_ID,
      version: E11_TENANT_VERSION,
      organizationCount: listOrganizations().length,
      tenantCount: listTenants().length,
      quotaCount: listTenantQuotas().length,
      policyCount: listIsolationPolicies().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): TenantManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearIsolationPolicies();
    clearTenantQuotas();
    clearTenants();
    clearOrganizations();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): TenantManagerSnapshot {
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

  function stop(): TenantManagerSnapshot {
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
    registerOrganization: (input) => {
      assertRunning("registerOrganization");
      return registerOrganization(input);
    },
    getOrganization,
    listOrganizations,
    setOrganizationStatus: (id, status) => {
      assertRunning("setOrganizationStatus");
      return setOrganizationStatus(id, status);
    },
    registerTenant: (input) => {
      assertRunning("registerTenant");
      return registerTenant(input);
    },
    getTenant,
    listTenants,
    setTenantStatus: (id, status) => {
      assertRunning("setTenantStatus");
      return setTenantStatus(id, status);
    },
    bindRuntime: (tenantId, runtimeId) => {
      assertRunning("bindRuntime");
      return bindRuntimeToTenant(tenantId, runtimeId);
    },
    unbindRuntime: (tenantId, runtimeId) => {
      assertRunning("unbindRuntime");
      return unbindRuntimeFromTenant(tenantId, runtimeId);
    },
    createQuota: (input) => {
      assertRunning("createQuota");
      return createTenantQuota(input);
    },
    getQuotaByType: getTenantQuotaByType,
    listQuotas: listTenantQuotas,
    createPolicy: (input) => {
      assertRunning("createPolicy");
      return createIsolationPolicy(input);
    },
    getPolicyByTenant: getIsolationPolicyByTenant,
    listPolicies: listIsolationPolicies,
    route: (request, options) => {
      assertRunning("route");
      return routeTenantRuntime(request, options);
    },
    openTenantContext: (tenantId, input) => {
      assertRunning("openTenantContext");
      const tenant = getTenant(tenantId);
      if (!tenant) throw new Error(`tenant not found: ${tenantId}`);
      const route = routeTenantRuntime(
        {
          tenantId,
          runtimeId: input.runtimeId,
          quotaType: "CONTEXT",
          amount: 1,
        },
        { reserve: true },
      );
      if (route.decision !== "ALLOW") {
        throw new Error(`tenant context denied: ${route.reason}`);
      }
      return openContext({
        ...input,
        attributes: {
          ...(input.attributes ?? {}),
          tenantId: tenant.id,
          organizationId: tenant.organizationId,
          namespaceKey: tenant.namespaceKey,
        },
      });
    },
    routeAndExecute: (execution, input) => {
      assertRunning("routeAndExecute");
      const route = routeTenantRuntime(
        {
          tenantId: input.tenantId,
          runtimeId: input.runtimeId,
          organizationId: input.organizationId,
          quotaType: "TASK",
          amount: 1,
        },
        { reserve: true },
      );
      if (route.decision !== "ALLOW") {
        return { route, executed: false };
      }
      const task = execution.createTask({
        name: input.taskName,
        kind: input.kind ?? "INVOKE",
        runtimeId: input.runtimeId,
        payload: {
          ...(input.payload ?? {}),
          tenantId: input.tenantId,
        },
      });
      execution.queue(task.id);
      execution.execute(task.id);
      return { route, executed: true, taskId: task.id };
    },
    releaseQuota,
    manifest: () => ({
      tenantId: E11_TENANT_ID,
      version: E11_TENANT_VERSION,
      freezeVersion: E11_TENANT_FREEZE_VERSION,
      base: E11_TENANT_BASE,
      organizationCount: listOrganizations().length,
      tenantCount: listTenants().length,
      quotaCount: listTenantQuotas().length,
      policyCount: listIsolationPolicies().length,
    }),
  };
}

export function getTenantRegistryManifest(): TenantRegistryManifest {
  return {
    tenantId: E11_TENANT_ID,
    version: E11_TENANT_VERSION,
    freezeVersion: E11_TENANT_FREEZE_VERSION,
    base: E11_TENANT_BASE,
    organizationCount: listOrganizations().length,
    tenantCount: listTenants().length,
    quotaCount: listTenantQuotas().length,
    policyCount: listIsolationPolicies().length,
  };
}
