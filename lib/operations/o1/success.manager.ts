/**
 * Operations O1 — Customer Success Foundation Manager
 */

import {
  clearCustomers,
  getCustomer,
  listCustomers,
  registerCustomer,
} from "./customer/customer.registry";
import type {
  RegisterCustomerInput,
  SuccessCustomer,
} from "./customer/customer.types";
import {
  analyzeFeedback,
  clearFeedbackAnalyses,
  getFeedbackAnalysis,
  listFeedbackAnalyses,
} from "./feedback/feedback.analysis";
import {
  clearFeedbackEntries,
  collectFeedback,
  getFeedbackEntry,
  listFeedbackEntries,
} from "./feedback/feedback.collector";
import type {
  AnalyzeFeedbackInput,
  CollectFeedbackInput,
  FeedbackAnalysis,
  FeedbackEntry,
} from "./feedback/feedback.types";
import {
  clearHealthMetrics,
  getHealthMetrics,
  listHealthMetrics,
  recordHealthMetrics,
} from "./health/health.metrics";
import {
  clearHealthScores,
  getHealthScore,
  listHealthScores,
  scoreCustomerHealth,
} from "./health/health.score";
import type {
  HealthMetrics,
  HealthScore,
  RecordHealthMetricsInput,
  ScoreCustomerHealthInput,
} from "./health/health.types";
import {
  assertO1CustomerSuccessReadinessReady,
  evaluateO1CustomerSuccessReadiness,
} from "./renewal/renewal.readiness";
import {
  clearRenewals,
  getRenewal,
  listRenewals,
  registerRenewal,
  updateRenewalStatus,
} from "./renewal/renewal.status";
import type {
  O1ManagerStatus,
  O1ReadinessResult,
  O1RegistryManifest,
  RegisterRenewalInput,
  RenewalRecord,
  UpdateRenewalStatusInput,
} from "./renewal/renewal.types";
import {
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION,
} from "./success/success.constants";
import {
  clearSuccessPlans,
  createSuccessPlan,
  getSuccessPlan,
  listSuccessPlans,
} from "./success/success.plan";
import {
  clearSuccessTracking,
  getSuccessTracking,
  listSuccessTracking,
  trackSuccessProgress,
} from "./success/success.tracking";
import type {
  CreateSuccessPlanInput,
  SuccessPlan,
  SuccessTracking,
  TrackSuccessProgressInput,
} from "./success/success.types";

export type O1CustomerSuccessManagerSnapshot = {
  managerId: string;
  status: O1ManagerStatus;
  layerId: typeof OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID;
  version: typeof OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION;
  customerCount: number;
  planCount: number;
  feedbackCount: number;
  renewalCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type O1CustomerSuccessManager = {
  initialize: () => O1CustomerSuccessManagerSnapshot;
  start: () => O1CustomerSuccessManagerSnapshot;
  stop: () => O1CustomerSuccessManagerSnapshot;
  status: () => O1CustomerSuccessManagerSnapshot;
  registerCustomer: (input: RegisterCustomerInput) => SuccessCustomer;
  recordMetrics: (input: RecordHealthMetricsInput) => HealthMetrics;
  scoreHealth: (input: ScoreCustomerHealthInput) => HealthScore;
  createPlan: (input: CreateSuccessPlanInput) => SuccessPlan;
  trackProgress: (input: TrackSuccessProgressInput) => SuccessTracking;
  collectFeedback: (input: CollectFeedbackInput) => FeedbackEntry;
  analyzeFeedback: (input: AnalyzeFeedbackInput) => FeedbackAnalysis;
  registerRenewal: (input: RegisterRenewalInput) => RenewalRecord;
  updateRenewalStatus: (input: UpdateRenewalStatusInput) => RenewalRecord;
  evaluateReadiness: () => O1ReadinessResult;
  manifest: () => O1RegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getO1RegistryManifest(): O1RegistryManifest {
  return {
    foundationId: OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
    version: OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION,
    freezeVersion: OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION,
    base: OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE,
    customerCount: listCustomers().length,
    metricsCount: listHealthMetrics().length,
    healthScoreCount: listHealthScores().length,
    planCount: listSuccessPlans().length,
    trackingCount: listSuccessTracking().length,
    feedbackCount: listFeedbackEntries().length,
    analysisCount: listFeedbackAnalyses().length,
    renewalCount: listRenewals().length,
  };
}

export function clearO1CustomerSuccessLayer(): void {
  clearRenewals();
  clearFeedbackAnalyses();
  clearFeedbackEntries();
  clearSuccessTracking();
  clearSuccessPlans();
  clearHealthScores();
  clearHealthMetrics();
  clearCustomers();
}

export function createO1CustomerSuccessManager(options?: {
  managerId?: string;
}): O1CustomerSuccessManager {
  const managerId =
    options?.managerId?.trim() || createId("ops-o1-success-mgr");
  let state: O1ManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): O1CustomerSuccessManagerSnapshot {
    const reg = getO1RegistryManifest();
    return {
      managerId,
      status: state,
      layerId: OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
      version: OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION,
      customerCount: reg.customerCount,
      planCount: reg.planCount,
      feedbackCount: reg.feedbackCount,
      renewalCount: reg.renewalCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): O1CustomerSuccessManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearO1CustomerSuccessLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): O1CustomerSuccessManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): O1CustomerSuccessManagerSnapshot {
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
    registerCustomer: (input) => {
      assertRunning("registerCustomer");
      return registerCustomer(input);
    },
    recordMetrics: (input) => {
      assertRunning("recordMetrics");
      return recordHealthMetrics(input);
    },
    scoreHealth: (input) => {
      assertRunning("scoreHealth");
      return scoreCustomerHealth(input);
    },
    createPlan: (input) => {
      assertRunning("createPlan");
      return createSuccessPlan(input);
    },
    trackProgress: (input) => {
      assertRunning("trackProgress");
      return trackSuccessProgress(input);
    },
    collectFeedback: (input) => {
      assertRunning("collectFeedback");
      return collectFeedback(input);
    },
    analyzeFeedback: (input) => {
      assertRunning("analyzeFeedback");
      return analyzeFeedback(input);
    },
    registerRenewal: (input) => {
      assertRunning("registerRenewal");
      return registerRenewal(input);
    },
    updateRenewalStatus: (input) => {
      assertRunning("updateRenewalStatus");
      return updateRenewalStatus(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateO1CustomerSuccessReadiness();
    },
    manifest: getO1RegistryManifest,
  };
}

export {
  assertO1CustomerSuccessReadinessReady,
  getCustomer,
  getFeedbackAnalysis,
  getFeedbackEntry,
  getHealthMetrics,
  getHealthScore,
  getRenewal,
  getSuccessPlan,
  getSuccessTracking,
  listCustomers,
  listFeedbackAnalyses,
  listFeedbackEntries,
  listHealthMetrics,
  listHealthScores,
  listRenewals,
  listSuccessPlans,
  listSuccessTracking,
};
