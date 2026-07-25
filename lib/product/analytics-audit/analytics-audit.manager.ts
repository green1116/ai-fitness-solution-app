/**
 * Product Analytics Audit — Analytics Traceability Manager
 */

import {
  clearAnalyticsAuditEvents,
  getAnalyticsAuditEvent,
  listAnalyticsAuditEvents,
  recordAnalyticsAuditEvent,
} from "./event/event.registry";
import type {
  AnalyticsAuditEvent,
  RecordAnalyticsAuditEventInput,
} from "./event/event.types";
import {
  clearAnalyticsSeals,
  getAnalyticsSeal,
  listAnalyticsSeals,
  sealAnalyticsTrail,
  verifyAnalyticsSeal,
} from "./integrity/integrity.registry";
import type {
  AnalyticsAuditSeal,
  SealAnalyticsTrailInput,
  VerifyAnalyticsSealInput,
} from "./integrity/integrity.types";
import {
  clearAnalyticsAuditQueries,
  getAnalyticsAuditQuery,
  listAnalyticsAuditQueries,
  queryAnalyticsAudit,
} from "./query/query.registry";
import type {
  AnalyticsAuditQuery,
  QueryAnalyticsAuditInput,
} from "./query/query.types";
import {
  PRODUCT_ANALYTICS_AUDIT_BASE,
  PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION,
  PRODUCT_ANALYTICS_AUDIT_ID,
  PRODUCT_ANALYTICS_AUDIT_VERSION,
} from "./traceability/traceability.constants";
import {
  assertAnalyticsAuditReadinessReady,
  evaluateAnalyticsAuditReadiness,
} from "./traceability/traceability.readiness";
import type {
  AnalyticsAuditManagerStatus,
  AnalyticsAuditReadinessResult,
  AnalyticsAuditRegistryManifest,
} from "./traceability/traceability.types";
import {
  appendAnalyticsTrail,
  clearAnalyticsTrails,
  getAnalyticsTrail,
  listAnalyticsTrails,
  markAnalyticsTrailStatus,
} from "./trail/trail.registry";
import type {
  AnalyticsAuditTrail,
  AppendAnalyticsTrailInput,
  MarkAnalyticsTrailStatusInput,
} from "./trail/trail.types";

export type AnalyticsAuditManagerSnapshot = {
  managerId: string;
  status: AnalyticsAuditManagerStatus;
  layerId: typeof PRODUCT_ANALYTICS_AUDIT_ID;
  version: typeof PRODUCT_ANALYTICS_AUDIT_VERSION;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AnalyticsAuditManager = {
  initialize: () => AnalyticsAuditManagerSnapshot;
  start: () => AnalyticsAuditManagerSnapshot;
  stop: () => AnalyticsAuditManagerSnapshot;
  status: () => AnalyticsAuditManagerSnapshot;
  recordAnalyticsAuditEvent: (
    input: RecordAnalyticsAuditEventInput,
  ) => AnalyticsAuditEvent;
  appendAnalyticsTrail: (
    input: AppendAnalyticsTrailInput,
  ) => AnalyticsAuditTrail;
  markAnalyticsTrailStatus: (
    input: MarkAnalyticsTrailStatusInput,
  ) => AnalyticsAuditTrail;
  sealAnalyticsTrail: (
    input: SealAnalyticsTrailInput,
  ) => AnalyticsAuditSeal;
  verifyAnalyticsSeal: (
    input: VerifyAnalyticsSealInput,
  ) => AnalyticsAuditSeal;
  queryAnalyticsAudit: (
    input: QueryAnalyticsAuditInput,
  ) => AnalyticsAuditQuery;
  evaluateReadiness: () => AnalyticsAuditReadinessResult;
  manifest: () => AnalyticsAuditRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getAnalyticsAuditRegistryManifest(): AnalyticsAuditRegistryManifest {
  return {
    foundationId: PRODUCT_ANALYTICS_AUDIT_ID,
    version: PRODUCT_ANALYTICS_AUDIT_VERSION,
    freezeVersion: PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION,
    base: PRODUCT_ANALYTICS_AUDIT_BASE,
    eventCount: listAnalyticsAuditEvents().length,
    trailCount: listAnalyticsTrails().length,
    sealCount: listAnalyticsSeals().length,
    queryCount: listAnalyticsAuditQueries().length,
  };
}

export function clearAnalyticsAuditLayer(): void {
  clearAnalyticsAuditQueries();
  clearAnalyticsSeals();
  clearAnalyticsTrails();
  clearAnalyticsAuditEvents();
}

export function createAnalyticsAuditManager(options?: {
  managerId?: string;
}): AnalyticsAuditManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-aau-mgr");
  let state: AnalyticsAuditManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AnalyticsAuditManagerSnapshot {
    const reg = getAnalyticsAuditRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_ANALYTICS_AUDIT_ID,
      version: PRODUCT_ANALYTICS_AUDIT_VERSION,
      eventCount: reg.eventCount,
      trailCount: reg.trailCount,
      sealCount: reg.sealCount,
      queryCount: reg.queryCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): AnalyticsAuditManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAnalyticsAuditLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AnalyticsAuditManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): AnalyticsAuditManagerSnapshot {
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
    recordAnalyticsAuditEvent: (input) => {
      assertRunning("recordAnalyticsAuditEvent");
      return recordAnalyticsAuditEvent(input);
    },
    appendAnalyticsTrail: (input) => {
      assertRunning("appendAnalyticsTrail");
      return appendAnalyticsTrail(input);
    },
    markAnalyticsTrailStatus: (input) => {
      assertRunning("markAnalyticsTrailStatus");
      return markAnalyticsTrailStatus(input);
    },
    sealAnalyticsTrail: (input) => {
      assertRunning("sealAnalyticsTrail");
      return sealAnalyticsTrail(input);
    },
    verifyAnalyticsSeal: (input) => {
      assertRunning("verifyAnalyticsSeal");
      return verifyAnalyticsSeal(input);
    },
    queryAnalyticsAudit: (input) => {
      assertRunning("queryAnalyticsAudit");
      return queryAnalyticsAudit(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateAnalyticsAuditReadiness();
    },
    manifest: getAnalyticsAuditRegistryManifest,
  };
}

export {
  assertAnalyticsAuditReadinessReady,
  getAnalyticsAuditEvent,
  getAnalyticsAuditQuery,
  getAnalyticsSeal,
  getAnalyticsTrail,
  listAnalyticsAuditEvents,
  listAnalyticsAuditQueries,
  listAnalyticsSeals,
  listAnalyticsTrails,
};
