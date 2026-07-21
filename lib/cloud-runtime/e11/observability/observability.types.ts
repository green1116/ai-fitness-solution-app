/**
 * E11-P5 — Cloud Runtime Observability types
 */

import type { CloudHealthLevel, CloudMetadata } from "../types/cloud.types";
import {
  ANOMALY_KINDS,
  AUDIT_ACTIONS,
  E11_OBSERVABILITY_BASE,
  E11_OBSERVABILITY_FREEZE_VERSION,
  E11_OBSERVABILITY_ID,
  E11_OBSERVABILITY_VERSION,
  OBSERVABILITY_EVENT_KINDS,
  OBSERVABILITY_EVENT_SEVERITIES,
  OBSERVABILITY_MANAGER_STATUSES,
  TELEMETRY_SIGNAL_TYPES,
} from "./observability.constants";

export type ObservabilityEventKind =
  (typeof OBSERVABILITY_EVENT_KINDS)[number];
export type ObservabilityEventSeverity =
  (typeof OBSERVABILITY_EVENT_SEVERITIES)[number];
export type TelemetrySignalType = (typeof TELEMETRY_SIGNAL_TYPES)[number];
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type AnomalyKind = (typeof ANOMALY_KINDS)[number];
export type ObservabilityManagerStatus =
  (typeof OBSERVABILITY_MANAGER_STATUSES)[number];

export type { CloudMetadata, CloudHealthLevel };

/** Observability event model. */
export type ObservabilityEvent = {
  id: string;
  kind: ObservabilityEventKind;
  severity: ObservabilityEventSeverity;
  message: string;
  runtimeId?: string;
  tenantId?: string;
  organizationId?: string;
  correlationId?: string;
  source: string;
  payload: CloudMetadata;
  occurredAt: string;
};

export type EmitObservabilityEventInput = {
  id?: string;
  kind: ObservabilityEventKind;
  severity?: ObservabilityEventSeverity;
  message: string;
  runtimeId?: string;
  tenantId?: string;
  organizationId?: string;
  correlationId?: string;
  source: string;
  payload?: CloudMetadata;
};

/** Telemetry signal. */
export type TelemetrySignal = {
  id: string;
  name: string;
  type: TelemetrySignalType;
  value: number;
  unit?: string;
  runtimeId?: string;
  tenantId?: string;
  labels: CloudMetadata;
  recordedAt: string;
};

export type RecordTelemetryInput = {
  id?: string;
  name: string;
  type: TelemetrySignalType;
  value: number;
  unit?: string;
  runtimeId?: string;
  tenantId?: string;
  labels?: CloudMetadata;
};

/** Audit trail entry. */
export type AuditEntry = {
  id: string;
  action: AuditAction;
  actor: string;
  target: string;
  tenantId?: string;
  runtimeId?: string;
  detail: CloudMetadata;
  recordedAt: string;
};

export type RecordAuditInput = {
  id?: string;
  action: AuditAction;
  actor: string;
  target: string;
  tenantId?: string;
  runtimeId?: string;
  detail?: CloudMetadata;
};

/** Aggregated health view. */
export type AggregatedHealthReport = {
  level: CloudHealthLevel;
  ok: boolean;
  runtimeCount: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  governanceUtilization: number;
  reports: Array<{
    runtimeId: string;
    level: CloudHealthLevel;
    ok: boolean;
  }>;
  checkedAt: string;
};

/** Anomaly detection result. */
export type AnomalyReport = {
  id: string;
  kind: AnomalyKind;
  severity: ObservabilityEventSeverity;
  message: string;
  score: number;
  runtimeId?: string;
  tenantId?: string;
  evidence: CloudMetadata;
  detectedAt: string;
};

/** Observability metrics snapshot. */
export type ObservabilityMetrics = {
  eventCount: number;
  telemetryCount: number;
  auditCount: number;
  anomalyCount: number;
  errorEventCount: number;
  healthOk: boolean;
  healthLevel: CloudHealthLevel;
  governanceUtilization: number;
  executionTraceCount: number;
  byEventKind: Record<ObservabilityEventKind, number>;
  snappedAt: string;
};

export type ObservabilityRegistryManifest = {
  observabilityId: typeof E11_OBSERVABILITY_ID;
  version: typeof E11_OBSERVABILITY_VERSION;
  freezeVersion: typeof E11_OBSERVABILITY_FREEZE_VERSION;
  base: typeof E11_OBSERVABILITY_BASE;
  eventCount: number;
  telemetryCount: number;
  auditCount: number;
  anomalyCount: number;
};
