/**
 * Product Tenant — Tenant Administration Manager
 */

import {
  PRODUCT_TENANT_ADMINISTRATION_BASE,
  PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_TENANT_ADMINISTRATION_ID,
  PRODUCT_TENANT_ADMINISTRATION_VERSION,
} from "./administration/administration.constants";
import {
  assertTenantAdministrationReadinessReady,
  evaluateTenantAdministrationReadiness,
} from "./administration/administration.readiness";
import type {
  TenantManagerStatus,
  TenantReadinessResult,
  TenantRegistryManifest,
} from "./administration/administration.types";
import {
  clearTenantIsolations,
  configureTenantIsolation,
  getTenantIsolation,
  listTenantIsolations,
} from "./isolation/isolation.registry";
import type {
  ConfigureTenantIsolationInput,
  TenantIsolation,
} from "./isolation/isolation.types";
import {
  clearTenantLifecycles,
  createTenantLifecycle,
  getTenantLifecycle,
  listTenantLifecycles,
  transitionTenantLifecycle,
} from "./lifecycle/lifecycle.registry";
import type {
  CreateTenantLifecycleInput,
  TenantLifecycle,
  TransitionTenantLifecycleInput,
} from "./lifecycle/lifecycle.types";
import {
  clearTenantQuotas,
  getTenantQuota,
  listTenantQuotas,
  setTenantQuota,
} from "./quota/quota.registry";
import type {
  SetTenantQuotaInput,
  TenantQuota,
} from "./quota/quota.types";
import {
  clearTenantRecords,
  getTenantRecord,
  listTenantRecords,
  registerTenantRecord,
  updateTenantRecordStatus,
} from "./record/record.registry";
import type {
  RegisterTenantRecordInput,
  TenantRecord,
  UpdateTenantRecordStatusInput,
} from "./record/record.types";

export type TenantManagerSnapshot = {
  managerId: string;
  status: TenantManagerStatus;
  layerId: typeof PRODUCT_TENANT_ADMINISTRATION_ID;
  version: typeof PRODUCT_TENANT_ADMINISTRATION_VERSION;
  recordCount: number;
  quotaCount: number;
  isolationCount: number;
  lifecycleCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type TenantManager = {
  initialize: () => TenantManagerSnapshot;
  start: () => TenantManagerSnapshot;
  stop: () => TenantManagerSnapshot;
  status: () => TenantManagerSnapshot;
  registerRecord: (input: RegisterTenantRecordInput) => TenantRecord;
  updateRecordStatus: (
    input: UpdateTenantRecordStatusInput,
  ) => TenantRecord;
  setQuota: (input: SetTenantQuotaInput) => TenantQuota;
  configureIsolation: (
    input: ConfigureTenantIsolationInput,
  ) => TenantIsolation;
  createLifecycle: (input: CreateTenantLifecycleInput) => TenantLifecycle;
  transitionLifecycle: (
    input: TransitionTenantLifecycleInput,
  ) => TenantLifecycle;
  evaluateReadiness: () => TenantReadinessResult;
  manifest: () => TenantRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getTenantRegistryManifest(): TenantRegistryManifest {
  return {
    administrationId: PRODUCT_TENANT_ADMINISTRATION_ID,
    version: PRODUCT_TENANT_ADMINISTRATION_VERSION,
    freezeVersion: PRODUCT_TENANT_ADMINISTRATION_FREEZE_VERSION,
    base: PRODUCT_TENANT_ADMINISTRATION_BASE,
    recordCount: listTenantRecords().length,
    quotaCount: listTenantQuotas().length,
    isolationCount: listTenantIsolations().length,
    lifecycleCount: listTenantLifecycles().length,
  };
}

export function clearTenantAdministrationLayer(): void {
  clearTenantLifecycles();
  clearTenantIsolations();
  clearTenantQuotas();
  clearTenantRecords();
}

export function createTenantManager(options?: {
  managerId?: string;
}): TenantManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-tnt-mgr");
  let state: TenantManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): TenantManagerSnapshot {
    const reg = getTenantRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_TENANT_ADMINISTRATION_ID,
      version: PRODUCT_TENANT_ADMINISTRATION_VERSION,
      recordCount: reg.recordCount,
      quotaCount: reg.quotaCount,
      isolationCount: reg.isolationCount,
      lifecycleCount: reg.lifecycleCount,
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
    clearTenantAdministrationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): TenantManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
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
    registerRecord: (input) => {
      assertRunning("registerRecord");
      return registerTenantRecord(input);
    },
    updateRecordStatus: (input) => {
      assertRunning("updateRecordStatus");
      return updateTenantRecordStatus(input);
    },
    setQuota: (input) => {
      assertRunning("setQuota");
      return setTenantQuota(input);
    },
    configureIsolation: (input) => {
      assertRunning("configureIsolation");
      return configureTenantIsolation(input);
    },
    createLifecycle: (input) => {
      assertRunning("createLifecycle");
      return createTenantLifecycle(input);
    },
    transitionLifecycle: (input) => {
      assertRunning("transitionLifecycle");
      return transitionTenantLifecycle(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateTenantAdministrationReadiness();
    },
    manifest: getTenantRegistryManifest,
  };
}

export {
  assertTenantAdministrationReadinessReady,
  getTenantIsolation,
  getTenantLifecycle,
  getTenantQuota,
  getTenantRecord,
  listTenantIsolations,
  listTenantLifecycles,
  listTenantQuotas,
  listTenantRecords,
};
