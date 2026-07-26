/**
 * Product Notification Audit — Manager
 */

import {
  clearNotificationAuditEvents,
  getNotificationAuditEvent,
  listNotificationAuditEvents,
  recordNotificationAuditEvent,
} from "./event/event.registry";
import type {
  NotificationAuditEvent,
  RecordNotificationAuditEventInput,
} from "./event/event.types";
import {
  clearNotificationAuditIntegrities,
  getNotificationAuditIntegrity,
  listNotificationAuditIntegrities,
  sealNotificationAuditIntegrity,
} from "./integrity/integrity.registry";
import type {
  NotificationAuditIntegrity,
  SealNotificationAuditIntegrityInput,
} from "./integrity/integrity.types";
import {
  clearNotificationAuditReleaseManifests,
  createNotificationAuditReleaseManifest,
  getNotificationAuditReleaseManifest,
  listNotificationAuditReleaseManifests,
  type NotificationAuditReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_NOTIFICATION_AUDIT_BASE,
  PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_AUDIT_ID,
  PRODUCT_NOTIFICATION_AUDIT_VERSION,
} from "./management/management.constants";
import {
  assertNotificationAuditReadinessReady,
  evaluateNotificationAuditReadiness,
} from "./management/management.readiness";
import type {
  NotificationAuditManagerStatus,
  NotificationAuditReadinessResult,
  NotificationAuditRegistryManifest,
} from "./management/management.types";
import {
  clearNotificationAuditQueries,
  getNotificationAuditQuery,
  listNotificationAuditQueries,
  runNotificationAuditQuery,
} from "./query/query.registry";
import type {
  NotificationAuditQuery,
  RunNotificationAuditQueryInput,
} from "./query/query.types";
import {
  appendNotificationAuditTrail,
  clearNotificationAuditTrails,
  getNotificationAuditTrail,
  listNotificationAuditTrails,
  sealNotificationAuditTrail,
} from "./trail/trail.registry";
import type {
  AppendNotificationAuditTrailInput,
  NotificationAuditTrail,
  SealNotificationAuditTrailInput,
} from "./trail/trail.types";

export type NotificationAuditManagerSnapshot = {
  managerId: string;
  status: NotificationAuditManagerStatus;
  layerId: typeof PRODUCT_NOTIFICATION_AUDIT_ID;
  version: typeof PRODUCT_NOTIFICATION_AUDIT_VERSION;
  eventCount: number;
  trailCount: number;
  integrityCount: number;
  queryCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type NotificationAuditManager = {
  initialize: () => NotificationAuditManagerSnapshot;
  start: () => NotificationAuditManagerSnapshot;
  stop: () => NotificationAuditManagerSnapshot;
  status: () => NotificationAuditManagerSnapshot;
  recordEvent: (
    input: RecordNotificationAuditEventInput,
  ) => NotificationAuditEvent;
  appendTrail: (
    input: AppendNotificationAuditTrailInput,
  ) => NotificationAuditTrail;
  sealTrail: (
    input: SealNotificationAuditTrailInput,
  ) => NotificationAuditTrail;
  sealIntegrity: (
    input: SealNotificationAuditIntegrityInput,
  ) => NotificationAuditIntegrity;
  runQuery: (input: RunNotificationAuditQueryInput) => NotificationAuditQuery;
  createReleaseManifest: (input: {
    id?: string;
    eventId: string;
  }) => NotificationAuditReleaseManifest;
  evaluateReadiness: () => NotificationAuditReadinessResult;
  manifest: () => NotificationAuditRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getNotificationAuditRegistryManifest(): NotificationAuditRegistryManifest {
  return {
    auditId: PRODUCT_NOTIFICATION_AUDIT_ID,
    version: PRODUCT_NOTIFICATION_AUDIT_VERSION,
    freezeVersion: PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION,
    base: PRODUCT_NOTIFICATION_AUDIT_BASE,
    eventCount: listNotificationAuditEvents().length,
    trailCount: listNotificationAuditTrails().length,
    integrityCount: listNotificationAuditIntegrities().length,
    queryCount: listNotificationAuditQueries().length,
    releaseCount: listNotificationAuditReleaseManifests().length,
  };
}

export function clearNotificationAuditLayer(): void {
  clearNotificationAuditReleaseManifests();
  clearNotificationAuditQueries();
  clearNotificationAuditIntegrities();
  clearNotificationAuditTrails();
  clearNotificationAuditEvents();
}

export function createNotificationAuditManager(options?: {
  managerId?: string;
}): NotificationAuditManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-naud-mgr");
  let state: NotificationAuditManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): NotificationAuditManagerSnapshot {
    const reg = getNotificationAuditRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_NOTIFICATION_AUDIT_ID,
      version: PRODUCT_NOTIFICATION_AUDIT_VERSION,
      eventCount: reg.eventCount,
      trailCount: reg.trailCount,
      integrityCount: reg.integrityCount,
      queryCount: reg.queryCount,
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

  function initialize(): NotificationAuditManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearNotificationAuditLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): NotificationAuditManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): NotificationAuditManagerSnapshot {
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
      return recordNotificationAuditEvent(input);
    },
    appendTrail: (input) => {
      assertRunning("appendTrail");
      return appendNotificationAuditTrail(input);
    },
    sealTrail: (input) => {
      assertRunning("sealTrail");
      return sealNotificationAuditTrail(input);
    },
    sealIntegrity: (input) => {
      assertRunning("sealIntegrity");
      return sealNotificationAuditIntegrity(input);
    },
    runQuery: (input) => {
      assertRunning("runQuery");
      return runNotificationAuditQuery(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createNotificationAuditReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateNotificationAuditReadiness();
    },
    manifest: getNotificationAuditRegistryManifest,
  };
}

export {
  assertNotificationAuditReadinessReady,
  getNotificationAuditEvent,
  getNotificationAuditIntegrity,
  getNotificationAuditQuery,
  getNotificationAuditReleaseManifest,
  getNotificationAuditTrail,
  listNotificationAuditEvents,
  listNotificationAuditIntegrities,
  listNotificationAuditQueries,
  listNotificationAuditReleaseManifests,
  listNotificationAuditTrails,
};
