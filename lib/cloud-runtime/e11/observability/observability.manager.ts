/**
 * E11-P5 — Observability Manager
 * Orchestrates events / telemetry / audit / health / anomaly / metrics
 * Integrates lifecycle, execution trace, governance metrics, tenant context
 */

import { getContext } from "../runtime/cloud.context";
import { getTenant } from "../tenant/tenant.namespace";
import {
  E11_OBSERVABILITY_BASE,
  E11_OBSERVABILITY_FREEZE_VERSION,
  E11_OBSERVABILITY_ID,
  E11_OBSERVABILITY_VERSION,
} from "./observability.constants";
import {
  clearAnomalies,
  detectAnomalies,
  listAnomalies,
} from "./observability.anomaly";
import {
  clearAudits,
  listAudits,
  recordAudit,
} from "./observability.audit";
import {
  clearEvents,
  emitEvent,
  listEvents,
} from "./observability.event";
import {
  aggregateObservabilityHealth,
  getRuntimeHealthDetail,
} from "./observability.health";
import { captureObservabilityMetrics } from "./observability.metrics";
import {
  clearTelemetry,
  collectExecutionTraceTelemetry,
  collectGovernanceTelemetry,
  listTelemetry,
  recordTelemetry,
} from "./observability.telemetry";
import type {
  AggregatedHealthReport,
  AnomalyReport,
  AuditEntry,
  EmitObservabilityEventInput,
  ObservabilityEvent,
  ObservabilityManagerStatus,
  ObservabilityMetrics,
  ObservabilityRegistryManifest,
  RecordAuditInput,
  RecordTelemetryInput,
  TelemetrySignal,
} from "./observability.types";

export type ObservabilityManagerSnapshot = {
  managerId: string;
  status: ObservabilityManagerStatus;
  layerId: typeof E11_OBSERVABILITY_ID;
  version: typeof E11_OBSERVABILITY_VERSION;
  eventCount: number;
  telemetryCount: number;
  auditCount: number;
  anomalyCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ObservabilityManager = {
  initialize: () => ObservabilityManagerSnapshot;
  start: () => ObservabilityManagerSnapshot;
  stop: () => ObservabilityManagerSnapshot;
  status: () => ObservabilityManagerSnapshot;
  emit: (input: EmitObservabilityEventInput) => ObservabilityEvent;
  listEvents: typeof listEvents;
  recordTelemetry: (input: RecordTelemetryInput) => TelemetrySignal;
  listTelemetry: typeof listTelemetry;
  collectExecutionTraces: () => TelemetrySignal[];
  collectGovernance: () => TelemetrySignal[];
  recordAudit: (input: RecordAuditInput) => AuditEntry;
  listAudits: typeof listAudits;
  health: () => AggregatedHealthReport;
  runtimeHealth: typeof getRuntimeHealthDetail;
  detectAnomalies: typeof detectAnomalies;
  listAnomalies: typeof listAnomalies;
  metrics: () => ObservabilityMetrics;
  /** Tag event with tenant context attributes when contextId provided. */
  emitFromContext: (
    contextId: string,
    input: Omit<
      EmitObservabilityEventInput,
      "tenantId" | "organizationId" | "correlationId"
    > & {
      correlationId?: string;
    },
  ) => ObservabilityEvent;
  manifest: () => ObservabilityRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createObservabilityManager(options?: {
  managerId?: string;
}): ObservabilityManager {
  const managerId =
    options?.managerId?.trim() || createId("e11-obs-mgr");
  let state: ObservabilityManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): ObservabilityManagerSnapshot {
    return {
      managerId,
      status: state,
      layerId: E11_OBSERVABILITY_ID,
      version: E11_OBSERVABILITY_VERSION,
      eventCount: listEvents().length,
      telemetryCount: listTelemetry().length,
      auditCount: listAudits().length,
      anomalyCount: listAnomalies().length,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): ObservabilityManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearAnomalies();
    clearAudits();
    clearTelemetry();
    clearEvents();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): ObservabilityManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): ObservabilityManagerSnapshot {
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
    emit: (input) => {
      assertRunning("emit");
      return emitEvent(input);
    },
    listEvents,
    recordTelemetry: (input) => {
      assertRunning("recordTelemetry");
      return recordTelemetry(input);
    },
    listTelemetry,
    collectExecutionTraces: () => {
      assertRunning("collectExecutionTraces");
      return collectExecutionTraceTelemetry();
    },
    collectGovernance: () => {
      assertRunning("collectGovernance");
      return collectGovernanceTelemetry();
    },
    recordAudit: (input) => {
      assertRunning("recordAudit");
      return recordAudit(input);
    },
    listAudits,
    health: () => {
      assertRunning("health");
      return aggregateObservabilityHealth();
    },
    runtimeHealth: getRuntimeHealthDetail,
    detectAnomalies: (opts) => {
      assertRunning("detectAnomalies");
      return detectAnomalies(opts);
    },
    listAnomalies,
    metrics: () => {
      assertRunning("metrics");
      return captureObservabilityMetrics();
    },
    emitFromContext: (contextId, input) => {
      assertRunning("emitFromContext");
      const ctx = getContext(contextId);
      if (!ctx) throw new Error(`context not found: ${contextId}`);
      const tenantId =
        typeof ctx.attributes.tenantId === "string"
          ? ctx.attributes.tenantId
          : undefined;
      const organizationId =
        typeof ctx.attributes.organizationId === "string"
          ? ctx.attributes.organizationId
          : tenantId
            ? getTenant(tenantId)?.organizationId
            : undefined;
      return emitEvent({
        ...input,
        runtimeId: input.runtimeId ?? ctx.runtimeId,
        tenantId,
        organizationId,
        correlationId: input.correlationId ?? ctx.correlationId,
        payload: {
          ...(input.payload ?? {}),
          contextId: ctx.contextId,
          namespaceKey: ctx.attributes.namespaceKey,
        },
      });
    },
    manifest: () => ({
      observabilityId: E11_OBSERVABILITY_ID,
      version: E11_OBSERVABILITY_VERSION,
      freezeVersion: E11_OBSERVABILITY_FREEZE_VERSION,
      base: E11_OBSERVABILITY_BASE,
      eventCount: listEvents().length,
      telemetryCount: listTelemetry().length,
      auditCount: listAudits().length,
      anomalyCount: listAnomalies().length,
    }),
  };
}

export function getObservabilityRegistryManifest(): ObservabilityRegistryManifest {
  return {
    observabilityId: E11_OBSERVABILITY_ID,
    version: E11_OBSERVABILITY_VERSION,
    freezeVersion: E11_OBSERVABILITY_FREEZE_VERSION,
    base: E11_OBSERVABILITY_BASE,
    eventCount: listEvents().length,
    telemetryCount: listTelemetry().length,
    auditCount: listAudits().length,
    anomalyCount: listAnomalies().length,
  };
}
