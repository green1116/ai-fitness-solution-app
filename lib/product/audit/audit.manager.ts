/**
 * Product Audit — Security Traceability Manager
 */

import {
  clearAuditEvents,
  getAuditEvent,
  listAuditEvents,
  recordAuditEvent,
} from "./event/event.registry";
import type {
  AuditEvent,
  RecordAuditEventInput,
} from "./event/event.types";
import {
  clearSeals,
  getSeal,
  listSeals,
  sealTrail,
  verifySeal,
} from "./integrity/integrity.registry";
import type {
  AuditSeal,
  SealTrailInput,
  VerifySealInput,
} from "./integrity/integrity.types";
import {
  clearAuditQueries,
  getAuditQuery,
  listAuditQueries,
  queryAuditTrail,
} from "./query/query.registry";
import type {
  AuditQuery,
  QueryAuditTrailInput,
} from "./query/query.types";
import {
  PRODUCT_AUDIT_TRACEABILITY_BASE,
  PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION,
  PRODUCT_AUDIT_TRACEABILITY_ID,
  PRODUCT_AUDIT_TRACEABILITY_VERSION,
} from "./security/security.constants";
import {
  assertAuditTraceabilityReadinessReady,
  evaluateAuditTraceabilityReadiness,
} from "./security/security.readiness";
import type {
  AuditManagerStatus,
  AuditReadinessResult,
  AuditRegistryManifest,
} from "./security/security.types";
import {
  appendTrail,
  clearTrails,
  getTrail,
  listTrails,
  markTrailStatus,
} from "./trail/trail.registry";
import type {
  AppendTrailInput,
  AuditTrailEntry,
  MarkTrailStatusInput,
} from "./trail/trail.types";

export type AuditManagerSnapshot = {
  managerId: string;
  status: AuditManagerStatus;
  layerId: typeof PRODUCT_AUDIT_TRACEABILITY_ID;
  version: typeof PRODUCT_AUDIT_TRACEABILITY_VERSION;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AuditManager = {
  initialize: () => AuditManagerSnapshot;
  start: () => AuditManagerSnapshot;
  stop: () => AuditManagerSnapshot;
  status: () => AuditManagerSnapshot;
  recordAuditEvent: (input: RecordAuditEventInput) => AuditEvent;
  appendTrail: (input: AppendTrailInput) => AuditTrailEntry;
  markTrailStatus: (input: MarkTrailStatusInput) => AuditTrailEntry;
  sealTrail: (input: SealTrailInput) => AuditSeal;
  verifySeal: (input: VerifySealInput) => AuditSeal;
  queryAuditTrail: (input: QueryAuditTrailInput) => AuditQuery;
  evaluateReadiness: () => AuditReadinessResult;
  manifest: () => AuditRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getAuditRegistryManifest(): AuditRegistryManifest {
  return {
    foundationId: PRODUCT_AUDIT_TRACEABILITY_ID,
    version: PRODUCT_AUDIT_TRACEABILITY_VERSION,
    freezeVersion: PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION,
    base: PRODUCT_AUDIT_TRACEABILITY_BASE,
    eventCount: listAuditEvents().length,
    trailCount: listTrails().length,
    sealCount: listSeals().length,
    queryCount: listAuditQueries().length,
  };
}

export function clearAuditTraceabilityLayer(): void {
  clearAuditQueries();
  clearSeals();
  clearTrails();
  clearAuditEvents();
}

export function createAuditManager(options?: {
  managerId?: string;
}): AuditManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-aud-mgr");
  let state: AuditManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AuditManagerSnapshot {
    const reg = getAuditRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_AUDIT_TRACEABILITY_ID,
      version: PRODUCT_AUDIT_TRACEABILITY_VERSION,
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

  function initialize(): AuditManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAuditTraceabilityLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AuditManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): AuditManagerSnapshot {
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
    recordAuditEvent: (input) => {
      assertRunning("recordAuditEvent");
      return recordAuditEvent(input);
    },
    appendTrail: (input) => {
      assertRunning("appendTrail");
      return appendTrail(input);
    },
    markTrailStatus: (input) => {
      assertRunning("markTrailStatus");
      return markTrailStatus(input);
    },
    sealTrail: (input) => {
      assertRunning("sealTrail");
      return sealTrail(input);
    },
    verifySeal: (input) => {
      assertRunning("verifySeal");
      return verifySeal(input);
    },
    queryAuditTrail: (input) => {
      assertRunning("queryAuditTrail");
      return queryAuditTrail(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateAuditTraceabilityReadiness();
    },
    manifest: getAuditRegistryManifest,
  };
}

export {
  assertAuditTraceabilityReadinessReady,
  getAuditEvent,
  getAuditQuery,
  getSeal,
  getTrail,
  listAuditEvents,
  listAuditQueries,
  listSeals,
  listTrails,
};
