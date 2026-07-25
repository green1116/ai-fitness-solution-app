/**
 * Product Customer Insight — Customer Insight Manager
 */

import {
  PRODUCT_CUSTOMER_INSIGHT_BASE,
  PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION,
  PRODUCT_CUSTOMER_INSIGHT_ID,
  PRODUCT_CUSTOMER_INSIGHT_VERSION,
} from "./insight/insight.constants";
import {
  assertCustomerInsightReadinessReady,
  evaluateCustomerInsightReadiness,
} from "./insight/insight.readiness";
import type {
  CustomerInsightManagerStatus,
  CustomerInsightReadinessResult,
  CustomerInsightRegistryManifest,
} from "./insight/insight.types";
import {
  clearRecommendations,
  getRecommendation,
  issueRecommendation,
  listRecommendations,
} from "./recommendation/recommendation.registry";
import type {
  CustomerInsightRecommendation,
  IssueRecommendationInput,
} from "./recommendation/recommendation.types";
import {
  clearScores,
  computeScore,
  getScore,
  listScores,
} from "./score/score.registry";
import type {
  ComputeScoreInput,
  CustomerInsightScore,
} from "./score/score.types";
import {
  assignInsightSegment,
  clearInsightSegments,
  getInsightSegment,
  listInsightSegments,
} from "./segment/segment.registry";
import type {
  AssignInsightSegmentInput,
  CustomerInsightSegment,
} from "./segment/segment.types";
import {
  clearSignals,
  detectSignal,
  getSignal,
  listSignals,
} from "./signal/signal.registry";
import type {
  CustomerInsightSignal,
  DetectSignalInput,
} from "./signal/signal.types";

export type CustomerInsightManagerSnapshot = {
  managerId: string;
  status: CustomerInsightManagerStatus;
  layerId: typeof PRODUCT_CUSTOMER_INSIGHT_ID;
  version: typeof PRODUCT_CUSTOMER_INSIGHT_VERSION;
  signalCount: number;
  scoreCount: number;
  segmentCount: number;
  recommendationCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CustomerInsightManager = {
  initialize: () => CustomerInsightManagerSnapshot;
  start: () => CustomerInsightManagerSnapshot;
  stop: () => CustomerInsightManagerSnapshot;
  status: () => CustomerInsightManagerSnapshot;
  detectSignal: (input: DetectSignalInput) => CustomerInsightSignal;
  computeScore: (input: ComputeScoreInput) => CustomerInsightScore;
  assignInsightSegment: (
    input: AssignInsightSegmentInput,
  ) => CustomerInsightSegment;
  issueRecommendation: (
    input: IssueRecommendationInput,
  ) => CustomerInsightRecommendation;
  evaluateReadiness: () => CustomerInsightReadinessResult;
  manifest: () => CustomerInsightRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getCustomerInsightRegistryManifest(): CustomerInsightRegistryManifest {
  return {
    insightId: PRODUCT_CUSTOMER_INSIGHT_ID,
    version: PRODUCT_CUSTOMER_INSIGHT_VERSION,
    freezeVersion: PRODUCT_CUSTOMER_INSIGHT_FREEZE_VERSION,
    base: PRODUCT_CUSTOMER_INSIGHT_BASE,
    signalCount: listSignals().length,
    scoreCount: listScores().length,
    segmentCount: listInsightSegments().length,
    recommendationCount: listRecommendations().length,
  };
}

export function clearCustomerInsightLayer(): void {
  clearRecommendations();
  clearInsightSegments();
  clearScores();
  clearSignals();
}

export function createCustomerInsightManager(options?: {
  managerId?: string;
}): CustomerInsightManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-cins-mgr");
  let state: CustomerInsightManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): CustomerInsightManagerSnapshot {
    const reg = getCustomerInsightRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_CUSTOMER_INSIGHT_ID,
      version: PRODUCT_CUSTOMER_INSIGHT_VERSION,
      signalCount: reg.signalCount,
      scoreCount: reg.scoreCount,
      segmentCount: reg.segmentCount,
      recommendationCount: reg.recommendationCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): CustomerInsightManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearCustomerInsightLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): CustomerInsightManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): CustomerInsightManagerSnapshot {
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
    detectSignal: (input) => {
      assertRunning("detectSignal");
      return detectSignal(input);
    },
    computeScore: (input) => {
      assertRunning("computeScore");
      return computeScore(input);
    },
    assignInsightSegment: (input) => {
      assertRunning("assignInsightSegment");
      return assignInsightSegment(input);
    },
    issueRecommendation: (input) => {
      assertRunning("issueRecommendation");
      return issueRecommendation(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateCustomerInsightReadiness();
    },
    manifest: getCustomerInsightRegistryManifest,
  };
}

export {
  assertCustomerInsightReadinessReady,
  getInsightSegment,
  getRecommendation,
  getScore,
  getSignal,
  listInsightSegments,
  listRecommendations,
  listScores,
  listSignals,
};
