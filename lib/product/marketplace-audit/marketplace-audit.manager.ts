/**
 * Product Marketplace Audit — Manager
 */

import {
  clearMarketplaceAuditEvents,
  getMarketplaceAuditEvent,
  listMarketplaceAuditEvents,
  recordMarketplaceAuditEvent,
} from "./event/event.registry";
import type {
  MarketplaceAuditEvent,
  RecordMarketplaceAuditEventInput,
} from "./event/event.types";
import {
  clearMarketplaceAuditIntegrities,
  getMarketplaceAuditIntegrity,
  listMarketplaceAuditIntegrities,
  sealMarketplaceAuditIntegrity,
} from "./integrity/integrity.registry";
import type {
  MarketplaceAuditIntegrity,
  SealMarketplaceAuditIntegrityInput,
} from "./integrity/integrity.types";
import {
  clearMarketplaceAuditReleaseManifests,
  createMarketplaceAuditReleaseManifest,
  getMarketplaceAuditReleaseManifest,
  listMarketplaceAuditReleaseManifests,
  type MarketplaceAuditReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_MARKETPLACE_AUDIT_BASE,
  PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_AUDIT_ID,
  PRODUCT_MARKETPLACE_AUDIT_VERSION,
} from "./management/management.constants";
import {
  assertMarketplaceAuditReadinessReady,
  evaluateMarketplaceAuditReadiness,
} from "./management/management.readiness";
import type {
  MarketplaceAuditManagerStatus,
  MarketplaceAuditReadinessResult,
  MarketplaceAuditRegistryManifest,
} from "./management/management.types";
import {
  clearMarketplaceAuditQueries,
  getMarketplaceAuditQuery,
  listMarketplaceAuditQueries,
  runMarketplaceAuditQuery,
} from "./query/query.registry";
import type {
  MarketplaceAuditQuery,
  RunMarketplaceAuditQueryInput,
} from "./query/query.types";
import {
  appendMarketplaceAuditTrail,
  clearMarketplaceAuditTrails,
  getMarketplaceAuditTrail,
  listMarketplaceAuditTrails,
  sealMarketplaceAuditTrail,
} from "./trail/trail.registry";
import type {
  AppendMarketplaceAuditTrailInput,
  MarketplaceAuditTrail,
  SealMarketplaceAuditTrailInput,
} from "./trail/trail.types";

export type MarketplaceAuditManagerSnapshot = {
  managerId: string;
  status: MarketplaceAuditManagerStatus;
  layerId: typeof PRODUCT_MARKETPLACE_AUDIT_ID;
  version: typeof PRODUCT_MARKETPLACE_AUDIT_VERSION;
  eventCount: number;
  trailCount: number;
  queryCount: number;
  integrityCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type MarketplaceAuditManager = {
  initialize: () => MarketplaceAuditManagerSnapshot;
  start: () => MarketplaceAuditManagerSnapshot;
  stop: () => MarketplaceAuditManagerSnapshot;
  status: () => MarketplaceAuditManagerSnapshot;
  recordEvent: (input: RecordMarketplaceAuditEventInput) => MarketplaceAuditEvent;
  appendTrail: (input: AppendMarketplaceAuditTrailInput) => MarketplaceAuditTrail;
  sealTrail: (input: SealMarketplaceAuditTrailInput) => MarketplaceAuditTrail;
  runQuery: (input: RunMarketplaceAuditQueryInput) => MarketplaceAuditQuery;
  sealIntegrity: (
    input: SealMarketplaceAuditIntegrityInput,
  ) => MarketplaceAuditIntegrity;
  createReleaseManifest: (input: {
    id?: string;
    eventId: string;
  }) => MarketplaceAuditReleaseManifest;
  evaluateReadiness: () => MarketplaceAuditReadinessResult;
  manifest: () => MarketplaceAuditRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getMarketplaceAuditRegistryManifest(): MarketplaceAuditRegistryManifest {
  return {
    auditId: PRODUCT_MARKETPLACE_AUDIT_ID,
    version: PRODUCT_MARKETPLACE_AUDIT_VERSION,
    freezeVersion: PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION,
    base: PRODUCT_MARKETPLACE_AUDIT_BASE,
    eventCount: listMarketplaceAuditEvents().length,
    trailCount: listMarketplaceAuditTrails().length,
    queryCount: listMarketplaceAuditQueries().length,
    integrityCount: listMarketplaceAuditIntegrities().length,
    releaseCount: listMarketplaceAuditReleaseManifests().length,
  };
}

export function clearMarketplaceAuditLayer(): void {
  clearMarketplaceAuditReleaseManifests();
  clearMarketplaceAuditIntegrities();
  clearMarketplaceAuditQueries();
  clearMarketplaceAuditTrails();
  clearMarketplaceAuditEvents();
}

export function createMarketplaceAuditManager(options?: {
  managerId?: string;
}): MarketplaceAuditManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-mpaud-mgr");
  let state: MarketplaceAuditManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): MarketplaceAuditManagerSnapshot {
    const reg = getMarketplaceAuditRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_MARKETPLACE_AUDIT_ID,
      version: PRODUCT_MARKETPLACE_AUDIT_VERSION,
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

  function initialize(): MarketplaceAuditManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearMarketplaceAuditLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): MarketplaceAuditManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): MarketplaceAuditManagerSnapshot {
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
      return recordMarketplaceAuditEvent(input);
    },
    appendTrail: (input) => {
      assertRunning("appendTrail");
      return appendMarketplaceAuditTrail(input);
    },
    sealTrail: (input) => {
      assertRunning("sealTrail");
      return sealMarketplaceAuditTrail(input);
    },
    runQuery: (input) => {
      assertRunning("runQuery");
      return runMarketplaceAuditQuery(input);
    },
    sealIntegrity: (input) => {
      assertRunning("sealIntegrity");
      return sealMarketplaceAuditIntegrity(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createMarketplaceAuditReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateMarketplaceAuditReadiness();
    },
    manifest: getMarketplaceAuditRegistryManifest,
  };
}

export {
  assertMarketplaceAuditReadinessReady,
  getMarketplaceAuditEvent,
  getMarketplaceAuditIntegrity,
  getMarketplaceAuditQuery,
  getMarketplaceAuditReleaseManifest,
  getMarketplaceAuditTrail,
  listMarketplaceAuditEvents,
  listMarketplaceAuditIntegrities,
  listMarketplaceAuditQueries,
  listMarketplaceAuditReleaseManifests,
  listMarketplaceAuditTrails,
};
