/**
 * Product CRM Audit — CRM Traceability Manager
 */

import {
  clearCrmAuditEvents,
  getCrmAuditEvent,
  listCrmAuditEvents,
  recordCrmAuditEvent,
} from "./event/event.registry";
import type {
  CrmAuditEvent,
  RecordCrmAuditEventInput,
} from "./event/event.types";
import {
  clearCrmSeals,
  getCrmSeal,
  listCrmSeals,
  sealCrmTrail,
  verifyCrmSeal,
} from "./integrity/integrity.registry";
import type {
  CrmAuditSeal,
  SealCrmTrailInput,
  VerifyCrmSealInput,
} from "./integrity/integrity.types";
import {
  clearCrmAuditQueries,
  getCrmAuditQuery,
  listCrmAuditQueries,
  queryCrmAudit,
} from "./query/query.registry";
import type {
  CrmAuditQuery,
  QueryCrmAuditInput,
} from "./query/query.types";
import {
  PRODUCT_CRM_AUDIT_BASE,
  PRODUCT_CRM_AUDIT_FREEZE_VERSION,
  PRODUCT_CRM_AUDIT_ID,
  PRODUCT_CRM_AUDIT_VERSION,
} from "./traceability/traceability.constants";
import {
  assertCrmAuditReadinessReady,
  evaluateCrmAuditReadiness,
} from "./traceability/traceability.readiness";
import type {
  CrmAuditManagerStatus,
  CrmAuditReadinessResult,
  CrmAuditRegistryManifest,
} from "./traceability/traceability.types";
import {
  appendCrmTrail,
  clearCrmTrails,
  getCrmTrail,
  listCrmTrails,
  markCrmTrailStatus,
} from "./trail/trail.registry";
import type {
  AppendCrmTrailInput,
  CrmAuditTrail,
  MarkCrmTrailStatusInput,
} from "./trail/trail.types";

export type CrmAuditManagerSnapshot = {
  managerId: string;
  status: CrmAuditManagerStatus;
  layerId: typeof PRODUCT_CRM_AUDIT_ID;
  version: typeof PRODUCT_CRM_AUDIT_VERSION;
  eventCount: number;
  trailCount: number;
  sealCount: number;
  queryCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CrmAuditManager = {
  initialize: () => CrmAuditManagerSnapshot;
  start: () => CrmAuditManagerSnapshot;
  stop: () => CrmAuditManagerSnapshot;
  status: () => CrmAuditManagerSnapshot;
  recordCrmAuditEvent: (input: RecordCrmAuditEventInput) => CrmAuditEvent;
  appendCrmTrail: (input: AppendCrmTrailInput) => CrmAuditTrail;
  markCrmTrailStatus: (input: MarkCrmTrailStatusInput) => CrmAuditTrail;
  sealCrmTrail: (input: SealCrmTrailInput) => CrmAuditSeal;
  verifyCrmSeal: (input: VerifyCrmSealInput) => CrmAuditSeal;
  queryCrmAudit: (input: QueryCrmAuditInput) => CrmAuditQuery;
  evaluateReadiness: () => CrmAuditReadinessResult;
  manifest: () => CrmAuditRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getCrmAuditRegistryManifest(): CrmAuditRegistryManifest {
  return {
    foundationId: PRODUCT_CRM_AUDIT_ID,
    version: PRODUCT_CRM_AUDIT_VERSION,
    freezeVersion: PRODUCT_CRM_AUDIT_FREEZE_VERSION,
    base: PRODUCT_CRM_AUDIT_BASE,
    eventCount: listCrmAuditEvents().length,
    trailCount: listCrmTrails().length,
    sealCount: listCrmSeals().length,
    queryCount: listCrmAuditQueries().length,
  };
}

export function clearCrmAuditLayer(): void {
  clearCrmAuditQueries();
  clearCrmSeals();
  clearCrmTrails();
  clearCrmAuditEvents();
}

export function createCrmAuditManager(options?: {
  managerId?: string;
}): CrmAuditManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-crau-mgr");
  let state: CrmAuditManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): CrmAuditManagerSnapshot {
    const reg = getCrmAuditRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_CRM_AUDIT_ID,
      version: PRODUCT_CRM_AUDIT_VERSION,
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

  function initialize(): CrmAuditManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearCrmAuditLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): CrmAuditManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): CrmAuditManagerSnapshot {
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
    recordCrmAuditEvent: (input) => {
      assertRunning("recordCrmAuditEvent");
      return recordCrmAuditEvent(input);
    },
    appendCrmTrail: (input) => {
      assertRunning("appendCrmTrail");
      return appendCrmTrail(input);
    },
    markCrmTrailStatus: (input) => {
      assertRunning("markCrmTrailStatus");
      return markCrmTrailStatus(input);
    },
    sealCrmTrail: (input) => {
      assertRunning("sealCrmTrail");
      return sealCrmTrail(input);
    },
    verifyCrmSeal: (input) => {
      assertRunning("verifyCrmSeal");
      return verifyCrmSeal(input);
    },
    queryCrmAudit: (input) => {
      assertRunning("queryCrmAudit");
      return queryCrmAudit(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateCrmAuditReadiness();
    },
    manifest: getCrmAuditRegistryManifest,
  };
}

export {
  assertCrmAuditReadinessReady,
  getCrmAuditEvent,
  getCrmAuditQuery,
  getCrmSeal,
  getCrmTrail,
  listCrmAuditEvents,
  listCrmAuditQueries,
  listCrmSeals,
  listCrmTrails,
};
