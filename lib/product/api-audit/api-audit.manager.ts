/**
 * Product API Audit — Manager
 */

import {
  clearApiAuditEvents,
  getApiAuditEvent,
  listApiAuditEvents,
  recordApiAuditEvent,
} from "./event/event.registry";
import type {
  ApiAuditEvent,
  RecordApiAuditEventInput,
} from "./event/event.types";
import {
  clearApiAuditIntegrities,
  getApiAuditIntegrity,
  listApiAuditIntegrities,
  sealApiAuditIntegrity,
} from "./integrity/integrity.registry";
import type {
  ApiAuditIntegrity,
  SealApiAuditIntegrityInput,
} from "./integrity/integrity.types";
import {
  clearApiAuditReleaseManifests,
  createApiAuditReleaseManifest,
  getApiAuditReleaseManifest,
  listApiAuditReleaseManifests,
  type ApiAuditReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_API_AUDIT_BASE,
  PRODUCT_API_AUDIT_FREEZE_VERSION,
  PRODUCT_API_AUDIT_ID,
  PRODUCT_API_AUDIT_VERSION,
} from "./management/management.constants";
import {
  assertApiAuditReadinessReady,
  evaluateApiAuditReadiness,
} from "./management/management.readiness";
import type {
  ApiAuditManagerStatus,
  ApiAuditReadinessResult,
  ApiAuditRegistryManifest,
} from "./management/management.types";
import {
  clearApiAuditQueries,
  getApiAuditQuery,
  listApiAuditQueries,
  runApiAuditQuery,
} from "./query/query.registry";
import type {
  ApiAuditQuery,
  RunApiAuditQueryInput,
} from "./query/query.types";
import {
  appendApiAuditTrail,
  clearApiAuditTrails,
  getApiAuditTrail,
  listApiAuditTrails,
  sealApiAuditTrail,
} from "./trail/trail.registry";
import type {
  AppendApiAuditTrailInput,
  ApiAuditTrail,
  SealApiAuditTrailInput,
} from "./trail/trail.types";

export type ApiAuditManagerSnapshot = {
  managerId: string;
  status: ApiAuditManagerStatus;
  layerId: typeof PRODUCT_API_AUDIT_ID;
  version: typeof PRODUCT_API_AUDIT_VERSION;
  eventCount: number;
  trailCount: number;
  queryCount: number;
  integrityCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ApiAuditManager = {
  initialize: () => ApiAuditManagerSnapshot;
  start: () => ApiAuditManagerSnapshot;
  stop: () => ApiAuditManagerSnapshot;
  status: () => ApiAuditManagerSnapshot;
  recordEvent: (input: RecordApiAuditEventInput) => ApiAuditEvent;
  appendTrail: (input: AppendApiAuditTrailInput) => ApiAuditTrail;
  sealTrail: (input: SealApiAuditTrailInput) => ApiAuditTrail;
  runQuery: (input: RunApiAuditQueryInput) => ApiAuditQuery;
  sealIntegrity: (input: SealApiAuditIntegrityInput) => ApiAuditIntegrity;
  createReleaseManifest: (input: {
    id?: string;
    eventId: string;
  }) => ApiAuditReleaseManifest;
  evaluateReadiness: () => ApiAuditReadinessResult;
  manifest: () => ApiAuditRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getApiAuditRegistryManifest(): ApiAuditRegistryManifest {
  return {
    auditId: PRODUCT_API_AUDIT_ID,
    version: PRODUCT_API_AUDIT_VERSION,
    freezeVersion: PRODUCT_API_AUDIT_FREEZE_VERSION,
    base: PRODUCT_API_AUDIT_BASE,
    eventCount: listApiAuditEvents().length,
    trailCount: listApiAuditTrails().length,
    queryCount: listApiAuditQueries().length,
    integrityCount: listApiAuditIntegrities().length,
    releaseCount: listApiAuditReleaseManifests().length,
  };
}

export function clearApiAuditLayer(): void {
  clearApiAuditReleaseManifests();
  clearApiAuditIntegrities();
  clearApiAuditQueries();
  clearApiAuditTrails();
  clearApiAuditEvents();
}

export function createApiAuditManager(options?: {
  managerId?: string;
}): ApiAuditManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-apiaud-mgr");
  let state: ApiAuditManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ApiAuditManagerSnapshot {
    const reg = getApiAuditRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_API_AUDIT_ID,
      version: PRODUCT_API_AUDIT_VERSION,
      eventCount: reg.eventCount,
      trailCount: reg.trailCount,
      queryCount: reg.queryCount,
      integrityCount: reg.integrityCount,
      releaseCount: reg.releaseCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ApiAuditManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearApiAuditLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ApiAuditManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ApiAuditManagerSnapshot {
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
    recordEvent: (input) => {
      assertRunning("recordEvent");
      return recordApiAuditEvent(input);
    },
    appendTrail: (input) => {
      assertRunning("appendTrail");
      return appendApiAuditTrail(input);
    },
    sealTrail: (input) => {
      assertRunning("sealTrail");
      return sealApiAuditTrail(input);
    },
    runQuery: (input) => {
      assertRunning("runQuery");
      return runApiAuditQuery(input);
    },
    sealIntegrity: (input) => {
      assertRunning("sealIntegrity");
      return sealApiAuditIntegrity(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createApiAuditReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateApiAuditReadiness();
    },
    manifest: getApiAuditRegistryManifest,
  };
}

export {
  assertApiAuditReadinessReady,
  getApiAuditEvent,
  getApiAuditIntegrity,
  getApiAuditQuery,
  getApiAuditReleaseManifest,
  getApiAuditTrail,
  listApiAuditEvents,
  listApiAuditIntegrities,
  listApiAuditQueries,
  listApiAuditReleaseManifests,
  listApiAuditTrails,
};
