/**
 * Product Admin — Admin Foundation Manager
 */

import {
  PRODUCT_ADMIN_FOUNDATION_BASE,
  PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ADMIN_FOUNDATION_ID,
  PRODUCT_ADMIN_FOUNDATION_VERSION,
} from "./foundation/foundation.constants";
import {
  assertAdminFoundationReadinessReady,
  evaluateAdminFoundationReadiness,
} from "./foundation/foundation.readiness";
import type {
  AdminManagerStatus,
  AdminReadinessResult,
  AdminRegistryManifest,
} from "./foundation/foundation.types";
import {
  clearAdminOperators,
  getAdminOperator,
  listAdminOperators,
  registerAdminOperator,
  updateAdminOperatorStatus,
} from "./operator/operator.registry";
import type {
  AdminOperator,
  RegisterAdminOperatorInput,
  UpdateAdminOperatorStatusInput,
} from "./operator/operator.types";
import {
  clearAdminPolicies,
  enforceAdminPolicy,
  getAdminPolicy,
  listAdminPolicies,
  registerAdminPolicy,
} from "./policy/policy.registry";
import type {
  AdminPolicy,
  EnforceAdminPolicyInput,
  RegisterAdminPolicyInput,
} from "./policy/policy.types";
import {
  clearAdminSettings,
  getAdminSetting,
  listAdminSettings,
  registerAdminSetting,
} from "./setting/setting.registry";
import type {
  AdminSetting,
  RegisterAdminSettingInput,
} from "./setting/setting.types";
import {
  clearAdminTenants,
  getAdminTenant,
  listAdminTenants,
  registerAdminTenant,
  updateAdminTenantStatus,
} from "./tenant/tenant.registry";
import type {
  AdminTenant,
  RegisterAdminTenantInput,
  UpdateAdminTenantStatusInput,
} from "./tenant/tenant.types";

export type AdminManagerSnapshot = {
  managerId: string;
  status: AdminManagerStatus;
  layerId: typeof PRODUCT_ADMIN_FOUNDATION_ID;
  version: typeof PRODUCT_ADMIN_FOUNDATION_VERSION;
  tenantCount: number;
  settingCount: number;
  operatorCount: number;
  policyCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AdminManager = {
  initialize: () => AdminManagerSnapshot;
  start: () => AdminManagerSnapshot;
  stop: () => AdminManagerSnapshot;
  status: () => AdminManagerSnapshot;
  registerTenant: (input: RegisterAdminTenantInput) => AdminTenant;
  updateTenantStatus: (input: UpdateAdminTenantStatusInput) => AdminTenant;
  registerSetting: (input: RegisterAdminSettingInput) => AdminSetting;
  registerOperator: (input: RegisterAdminOperatorInput) => AdminOperator;
  updateOperatorStatus: (
    input: UpdateAdminOperatorStatusInput,
  ) => AdminOperator;
  registerPolicy: (input: RegisterAdminPolicyInput) => AdminPolicy;
  enforcePolicy: (input: EnforceAdminPolicyInput) => AdminPolicy;
  evaluateReadiness: () => AdminReadinessResult;
  manifest: () => AdminRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getAdminRegistryManifest(): AdminRegistryManifest {
  return {
    foundationId: PRODUCT_ADMIN_FOUNDATION_ID,
    version: PRODUCT_ADMIN_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_ADMIN_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_ADMIN_FOUNDATION_BASE,
    tenantCount: listAdminTenants().length,
    settingCount: listAdminSettings().length,
    operatorCount: listAdminOperators().length,
    policyCount: listAdminPolicies().length,
  };
}

export function clearAdminFoundationLayer(): void {
  clearAdminPolicies();
  clearAdminOperators();
  clearAdminSettings();
  clearAdminTenants();
}

export function createAdminManager(options?: {
  managerId?: string;
}): AdminManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-adm-mgr");
  let state: AdminManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AdminManagerSnapshot {
    const reg = getAdminRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_ADMIN_FOUNDATION_ID,
      version: PRODUCT_ADMIN_FOUNDATION_VERSION,
      tenantCount: reg.tenantCount,
      settingCount: reg.settingCount,
      operatorCount: reg.operatorCount,
      policyCount: reg.policyCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): AdminManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAdminFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AdminManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): AdminManagerSnapshot {
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
    registerTenant: (input) => {
      assertRunning("registerTenant");
      return registerAdminTenant(input);
    },
    updateTenantStatus: (input) => {
      assertRunning("updateTenantStatus");
      return updateAdminTenantStatus(input);
    },
    registerSetting: (input) => {
      assertRunning("registerSetting");
      return registerAdminSetting(input);
    },
    registerOperator: (input) => {
      assertRunning("registerOperator");
      return registerAdminOperator(input);
    },
    updateOperatorStatus: (input) => {
      assertRunning("updateOperatorStatus");
      return updateAdminOperatorStatus(input);
    },
    registerPolicy: (input) => {
      assertRunning("registerPolicy");
      return registerAdminPolicy(input);
    },
    enforcePolicy: (input) => {
      assertRunning("enforcePolicy");
      return enforceAdminPolicy(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateAdminFoundationReadiness();
    },
    manifest: getAdminRegistryManifest,
  };
}

export {
  assertAdminFoundationReadinessReady,
  getAdminOperator,
  getAdminPolicy,
  getAdminSetting,
  getAdminTenant,
  listAdminOperators,
  listAdminPolicies,
  listAdminSettings,
  listAdminTenants,
};
