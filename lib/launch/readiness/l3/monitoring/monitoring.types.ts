/**
 * Launch L3 — Monitoring types
 */

import type {
  ALERT_SEVERITIES,
  METRIC_KINDS,
} from "../runtime/runtime.constants";

export type MetricKind = (typeof METRIC_KINDS)[number];
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];
export type MonitoringMetadata = Record<string, unknown>;

export type MonitoringMetric = {
  id: string;
  runtimeId: string;
  name: string;
  kind: MetricKind;
  value: number;
  unit: string;
  detail: string;
  metadata: MonitoringMetadata;
  recordedAt: string;
};

export type RecordMetricInput = {
  id?: string;
  runtimeId: string;
  name: string;
  kind: MetricKind;
  value: number;
  unit?: string;
  metadata?: MonitoringMetadata;
};

export type MonitoringAlert = {
  id: string;
  metricId: string;
  severity: AlertSeverity;
  message: string;
  detail: string;
  raisedAt: string;
};

export type RaiseAlertInput = {
  id?: string;
  metricId: string;
  severity: AlertSeverity;
  message: string;
};
