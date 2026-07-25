/**
 * Product Admin Audit — Admin Traceability Manager
 */

import {
  clearAdminAuditEvents,
  getAdminAuditEvent,
  listAdminAuditEvents,
  recordAdminAuditEvent,
} from "./event/event.registry";
import type {
  AdminAuditEvent,
  RecordAdminAuditEventInput,
} from "./event/event.types";
import {
  clearAdminSeals,
  getAdminSeal,
  listAdminSeals,
  sealAdminTrail,
  verifyAdminSeal,
} from "./integrity/integrity.registry";
import type {
  AdminAuditSeal,
  SealAdminTrailInput,
  VerifyAdminSealInput,
} from "./integrity/integrity.types";
import {
  clearAdminAuditQueries,
  getAdminAuditQuery,
  listAdminAuditQueries,
  queryAdminAudit,
} from "./query/query.registry";
import type {
  AdminAuditQuery,
  QueryAdminAuditInput,
} from "./query/query.types";
import {
  PRODUCT_ADMIN_AUDIT_BASE,
  PRODUCT_ADMIN_AUDIT_FREEZE_VERSION,
  PRODUCT_ADMIN_AUDIT_ID,
  PRODUCT_ADMIN_AUDIT_VERSION,
} from "./traceability/traceability.constants";
import {
  assertAdminAuditReadinessReady,
  evaluateAdminAuditReadiness,
} from "./traceability/traceability.readiness";
import type {
  AdminAuditManagerStatus,
  AdminAuditReadinessResult,
  AdminAuditRegistryManifest,
} from "./traceability/traceability.types";
import {
  appendAdminTrail,
  clearAdminTrails,
  getAdminTrail,
  listAdminTrails,
  markAdminTrailStatus,
} from "./trail/trail.registry";
import type {
  AdminAuditTrail,
  AppendAdminTrailInput,
  MarkAdminTrailStatusInput,
} from "./trail/trail.types";

export type AdminAuditManagerSnapshot = {
  managerId: string;
  status: AdminAuditManagerStatus;
  layerId: typeof PRODUCT_ADMIN_AUDIT_ID;
  version: typeof PRODUCT_ADMIN_AUDIT_VERSION;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type AdminAuditManager = {
  initialize: () => AdminAuditManagerSnapshot;
  start: () => AdminAuditManagerSnapshot;
  stop: () => AdminAuditManagerSnapshot;
  status: () => AdminAuditManagerSnapshot;
  recordAdminAuditEvent: (
    input: RecordAdminAuditEventInput,
  ) => AdminAuditEvent;
  appendAdminTrail: (input: AppendAdminTrailInput) => AdminAuditTrail;
  markAdminTrailStatus: (
    input: MarkAdminTrailStatusInput,
  ) => AdminAuditTrail;
  sealAdminTrail: (input: SealAdminTrailInput) => AdminAuditSeal;
  verifyAdminSeal: (input: VerifyAdminSealInput) => AdminAuditSeal;
  queryAdminAudit: (input: QueryAdminAuditInput) => AdminAuditQuery;
  evaluateReadiness: () => AdminAuditReadinessResult;
  manifest: () => AdminAuditRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getAdminAuditRegistryManifest(): AdminAuditRegistryManifest {
  return {
    foundationId: PRODUCT_ADMIN_AUDIT_ID,
    version: PRODUCT_ADMIN_AUDIT_VERSION,
    freezeVersion: PRODUCT_ADMIN_AUDIT_FREEZE_VERSION,
    base: PRODUCT_ADMIN_AUDIT_BASE,
    eventCount: listAdminAuditEvents().length,
    trailCount: listAdminTrails().length,
    sealCount: listAdminSeals().length,
    queryCount: listAdminAuditQueries().length,
  };
}

export function clearAdminAuditLayer(): void {
  clearAdminAuditQueries();
  clearAdminSeals();
  clearAdminTrails();
  clearAdminAuditEvents();
}

export function createAdminAuditManager(options?: {
  managerId?: string;
}): AdminAuditManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-ada-mgr");
  let state: AdminAuditManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): AdminAuditManagerSnapshot {
    const reg = getAdminAuditRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_ADMIN_AUDIT_ID,
      version: PRODUCT_ADMIN_AUDIT_VERSION,
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

  function initialize(): AdminAuditManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAdminAuditLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): AdminAuditManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): AdminAuditManagerSnapshot {
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
    recordAdminAuditEvent: (input) => {
      assertRunning("recordAdminAuditEvent");
      return recordAdminAuditEvent(input);
    },
    appendAdminTrail: (input) => {
      assertRunning("appendAdminTrail");
      return appendAdminTrail(input);
    },
    markAdminTrailStatus: (input) => {
      assertRunning("markAdminTrailStatus");
      return markAdminTrailStatus(input);
    },
    sealAdminTrail: (input) => {
      assertRunning("sealAdminTrail");
      return sealAdminTrail(input);
    },
    verifyAdminSeal: (input) => {
      assertRunning("verifyAdminSeal");
      return verifyAdminSeal(input);
    },
    queryAdminAudit: (input) => {
      assertRunning("queryAdminAudit");
      return queryAdminAudit(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateAdminAuditReadiness();
    },
    manifest: getAdminAuditRegistryManifest,
  };
}

export {
  assertAdminAuditReadinessReady,
  getAdminAuditEvent,
  getAdminAuditQuery,
  getAdminSeal,
  getAdminTrail,
  listAdminAuditEvents,
  listAdminAuditQueries,
  listAdminSeals,
  listAdminTrails,
};
