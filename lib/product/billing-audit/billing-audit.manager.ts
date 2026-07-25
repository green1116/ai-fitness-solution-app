/**
 * Product Billing Audit — Billing Traceability Manager
 */

import {
  clearBillingAuditEvents,
  getBillingAuditEvent,
  listBillingAuditEvents,
  recordBillingAuditEvent,
} from "./event/event.registry";
import type {
  BillingAuditEvent,
  RecordBillingAuditEventInput,
} from "./event/event.types";
import {
  clearBillingSeals,
  getBillingSeal,
  listBillingSeals,
  sealBillingTrail,
  verifyBillingSeal,
} from "./integrity/integrity.registry";
import type {
  BillingAuditSeal,
  SealBillingTrailInput,
  VerifyBillingSealInput,
} from "./integrity/integrity.types";
import {
  clearBillingAuditQueries,
  getBillingAuditQuery,
  listBillingAuditQueries,
  queryBillingAudit,
} from "./query/query.registry";
import type {
  BillingAuditQuery,
  QueryBillingAuditInput,
} from "./query/query.types";
import {
  PRODUCT_BILLING_AUDIT_BASE,
  PRODUCT_BILLING_AUDIT_FREEZE_VERSION,
  PRODUCT_BILLING_AUDIT_ID,
  PRODUCT_BILLING_AUDIT_VERSION,
} from "./traceability/traceability.constants";
import {
  assertBillingAuditReadinessReady,
  evaluateBillingAuditReadiness,
} from "./traceability/traceability.readiness";
import type {
  BillingAuditManagerStatus,
  BillingAuditReadinessResult,
  BillingAuditRegistryManifest,
} from "./traceability/traceability.types";
import {
  appendBillingTrail,
  clearBillingTrails,
  getBillingTrail,
  listBillingTrails,
  markBillingTrailStatus,
} from "./trail/trail.registry";
import type {
  AppendBillingTrailInput,
  BillingAuditTrail,
  MarkBillingTrailStatusInput,
} from "./trail/trail.types";

export type BillingAuditManagerSnapshot = {
  managerId: string;
  status: BillingAuditManagerStatus;
  layerId: typeof PRODUCT_BILLING_AUDIT_ID;
  version: typeof PRODUCT_BILLING_AUDIT_VERSION;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type BillingAuditManager = {
  initialize: () => BillingAuditManagerSnapshot;
  start: () => BillingAuditManagerSnapshot;
  stop: () => BillingAuditManagerSnapshot;
  status: () => BillingAuditManagerSnapshot;
  recordBillingAuditEvent: (
    input: RecordBillingAuditEventInput,
  ) => BillingAuditEvent;
  appendBillingTrail: (input: AppendBillingTrailInput) => BillingAuditTrail;
  markBillingTrailStatus: (
    input: MarkBillingTrailStatusInput,
  ) => BillingAuditTrail;
  sealBillingTrail: (input: SealBillingTrailInput) => BillingAuditSeal;
  verifyBillingSeal: (input: VerifyBillingSealInput) => BillingAuditSeal;
  queryBillingAudit: (input: QueryBillingAuditInput) => BillingAuditQuery;
  evaluateReadiness: () => BillingAuditReadinessResult;
  manifest: () => BillingAuditRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getBillingAuditRegistryManifest(): BillingAuditRegistryManifest {
  return {
    foundationId: PRODUCT_BILLING_AUDIT_ID,
    version: PRODUCT_BILLING_AUDIT_VERSION,
    freezeVersion: PRODUCT_BILLING_AUDIT_FREEZE_VERSION,
    base: PRODUCT_BILLING_AUDIT_BASE,
    eventCount: listBillingAuditEvents().length,
    trailCount: listBillingTrails().length,
    sealCount: listBillingSeals().length,
    queryCount: listBillingAuditQueries().length,
  };
}

export function clearBillingAuditLayer(): void {
  clearBillingAuditQueries();
  clearBillingSeals();
  clearBillingTrails();
  clearBillingAuditEvents();
}

export function createBillingAuditManager(options?: {
  managerId?: string;
}): BillingAuditManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-bau-mgr");
  let state: BillingAuditManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): BillingAuditManagerSnapshot {
    const reg = getBillingAuditRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_BILLING_AUDIT_ID,
      version: PRODUCT_BILLING_AUDIT_VERSION,
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

  function initialize(): BillingAuditManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearBillingAuditLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): BillingAuditManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): BillingAuditManagerSnapshot {
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
    recordBillingAuditEvent: (input) => {
      assertRunning("recordBillingAuditEvent");
      return recordBillingAuditEvent(input);
    },
    appendBillingTrail: (input) => {
      assertRunning("appendBillingTrail");
      return appendBillingTrail(input);
    },
    markBillingTrailStatus: (input) => {
      assertRunning("markBillingTrailStatus");
      return markBillingTrailStatus(input);
    },
    sealBillingTrail: (input) => {
      assertRunning("sealBillingTrail");
      return sealBillingTrail(input);
    },
    verifyBillingSeal: (input) => {
      assertRunning("verifyBillingSeal");
      return verifyBillingSeal(input);
    },
    queryBillingAudit: (input) => {
      assertRunning("queryBillingAudit");
      return queryBillingAudit(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateBillingAuditReadiness();
    },
    manifest: getBillingAuditRegistryManifest,
  };
}

export {
  assertBillingAuditReadinessReady,
  getBillingAuditEvent,
  getBillingAuditQuery,
  getBillingSeal,
  getBillingTrail,
  listBillingAuditEvents,
  listBillingAuditQueries,
  listBillingSeals,
  listBillingTrails,
};
