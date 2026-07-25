/**
 * Product P9 — Customer Success Manager
 */

import {
  PRODUCT_P9_CUSTOMER_SUCCESS_BASE,
  PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION,
  PRODUCT_P9_CUSTOMER_SUCCESS_ID,
  PRODUCT_P9_CUSTOMER_SUCCESS_VERSION,
} from "./customer-health/health.constants";
import {
  assertP9CustomerSuccessReadinessReady,
  evaluateP9CustomerSuccessReadiness,
} from "./customer-health/health.readiness";
import {
  clearCustomerHealth,
  createCustomerHealth,
  getCustomerHealth,
  listCustomerHealth,
  updateCustomerHealth,
} from "./customer-health/health.registry";
import type {
  CreateCustomerHealthInput,
  CustomerHealth,
  P9ManagerStatus,
  P9ReadinessResult,
  P9RegistryManifest,
  UpdateCustomerHealthInput,
} from "./customer-health/health.types";
import {
  clearExpansions,
  createExpansion,
  getExpansion,
  listExpansions,
  updateExpansionStatus,
} from "./expansion/expansion.registry";
import type {
  CreateExpansionInput,
  ExpansionOpportunity,
  UpdateExpansionStatusInput,
} from "./expansion/expansion.types";
import {
  clearFeedback,
  createFeedback,
  getFeedback,
  listFeedback,
} from "./feedback/feedback.registry";
import type {
  CreateFeedbackInput,
  CustomerFeedback,
} from "./feedback/feedback.types";
import {
  clearRenewals,
  createRenewal,
  getRenewal,
  listRenewals,
  updateRenewalStatus,
} from "./renewal/renewal.registry";
import type {
  CreateRenewalInput,
  RenewalOpportunity,
  UpdateRenewalStatusInput,
} from "./renewal/renewal.types";
import {
  clearSatisfaction,
  createSatisfaction,
  getSatisfaction,
  listSatisfaction,
} from "./satisfaction/satisfaction.registry";
import type {
  CreateSatisfactionInput,
  SatisfactionScore,
} from "./satisfaction/satisfaction.types";
import {
  clearSuccessPlans,
  createSuccessPlan,
  getSuccessPlan,
  listSuccessPlans,
  updateSuccessPlanStatus,
} from "./success-plan/plan.registry";
import type {
  CreateSuccessPlanInput,
  SuccessPlan,
  UpdateSuccessPlanStatusInput,
} from "./success-plan/plan.types";
import {
  clearUsage,
  createUsage,
  getUsage,
  listUsage,
} from "./usage/usage.registry";
import type { CreateUsageInput, UsageSnapshot } from "./usage/usage.types";

export type P9CustomerSuccessManagerSnapshot = {
  managerId: string;
  status: P9ManagerStatus;
  layerId: typeof PRODUCT_P9_CUSTOMER_SUCCESS_ID;
  version: typeof PRODUCT_P9_CUSTOMER_SUCCESS_VERSION;
  healthCount: number;
  usageCount: number;
  feedbackCount: number;
  planCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type P9CustomerSuccessManager = {
  initialize: () => P9CustomerSuccessManagerSnapshot;
  start: () => P9CustomerSuccessManagerSnapshot;
  stop: () => P9CustomerSuccessManagerSnapshot;
  status: () => P9CustomerSuccessManagerSnapshot;
  createCustomerHealth: (
    input: CreateCustomerHealthInput,
  ) => CustomerHealth;
  updateCustomerHealth: (
    input: UpdateCustomerHealthInput,
  ) => CustomerHealth;
  createUsage: (input: CreateUsageInput) => UsageSnapshot;
  createFeedback: (input: CreateFeedbackInput) => CustomerFeedback;
  createSatisfaction: (input: CreateSatisfactionInput) => SatisfactionScore;
  createSuccessPlan: (input: CreateSuccessPlanInput) => SuccessPlan;
  updateSuccessPlanStatus: (
    input: UpdateSuccessPlanStatusInput,
  ) => SuccessPlan;
  createRenewal: (input: CreateRenewalInput) => RenewalOpportunity;
  updateRenewalStatus: (
    input: UpdateRenewalStatusInput,
  ) => RenewalOpportunity;
  createExpansion: (input: CreateExpansionInput) => ExpansionOpportunity;
  updateExpansionStatus: (
    input: UpdateExpansionStatusInput,
  ) => ExpansionOpportunity;
  evaluateReadiness: () => P9ReadinessResult;
  manifest: () => P9RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getP9RegistryManifest(): P9RegistryManifest {
  return {
    foundationId: PRODUCT_P9_CUSTOMER_SUCCESS_ID,
    version: PRODUCT_P9_CUSTOMER_SUCCESS_VERSION,
    freezeVersion: PRODUCT_P9_CUSTOMER_SUCCESS_FREEZE_VERSION,
    base: PRODUCT_P9_CUSTOMER_SUCCESS_BASE,
    healthCount: listCustomerHealth().length,
    usageCount: listUsage().length,
    feedbackCount: listFeedback().length,
    satisfactionCount: listSatisfaction().length,
    successPlanCount: listSuccessPlans().length,
    renewalCount: listRenewals().length,
    expansionCount: listExpansions().length,
  };
}

export function clearP9CustomerSuccessLayer(): void {
  clearExpansions();
  clearRenewals();
  clearSuccessPlans();
  clearSatisfaction();
  clearFeedback();
  clearUsage();
  clearCustomerHealth();
}

export function createP9CustomerSuccessManager(options?: {
  managerId?: string;
}): P9CustomerSuccessManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-p9-cs-mgr");
  let state: P9ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): P9CustomerSuccessManagerSnapshot {
    const reg = getP9RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_P9_CUSTOMER_SUCCESS_ID,
      version: PRODUCT_P9_CUSTOMER_SUCCESS_VERSION,
      healthCount: reg.healthCount,
      usageCount: reg.usageCount,
      feedbackCount: reg.feedbackCount,
      planCount: reg.successPlanCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): P9CustomerSuccessManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearP9CustomerSuccessLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): P9CustomerSuccessManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): P9CustomerSuccessManagerSnapshot {
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
    createCustomerHealth: (input) => {
      assertRunning("createCustomerHealth");
      return createCustomerHealth(input);
    },
    updateCustomerHealth: (input) => {
      assertRunning("updateCustomerHealth");
      return updateCustomerHealth(input);
    },
    createUsage: (input) => {
      assertRunning("createUsage");
      return createUsage(input);
    },
    createFeedback: (input) => {
      assertRunning("createFeedback");
      return createFeedback(input);
    },
    createSatisfaction: (input) => {
      assertRunning("createSatisfaction");
      return createSatisfaction(input);
    },
    createSuccessPlan: (input) => {
      assertRunning("createSuccessPlan");
      return createSuccessPlan(input);
    },
    updateSuccessPlanStatus: (input) => {
      assertRunning("updateSuccessPlanStatus");
      return updateSuccessPlanStatus(input);
    },
    createRenewal: (input) => {
      assertRunning("createRenewal");
      return createRenewal(input);
    },
    updateRenewalStatus: (input) => {
      assertRunning("updateRenewalStatus");
      return updateRenewalStatus(input);
    },
    createExpansion: (input) => {
      assertRunning("createExpansion");
      return createExpansion(input);
    },
    updateExpansionStatus: (input) => {
      assertRunning("updateExpansionStatus");
      return updateExpansionStatus(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateP9CustomerSuccessReadiness();
    },
    manifest: getP9RegistryManifest,
  };
}

export {
  assertP9CustomerSuccessReadinessReady,
  getCustomerHealth,
  getExpansion,
  getFeedback,
  getRenewal,
  getSatisfaction,
  getSuccessPlan,
  getUsage,
  listCustomerHealth,
  listExpansions,
  listFeedback,
  listRenewals,
  listSatisfaction,
  listSuccessPlans,
  listUsage,
};
