/**
 * Product P12 — Monitoring types
 */

import type { MONITORING_SEVERITIES } from "../launch/launch.constants";

export type MonitoringSeverity = (typeof MONITORING_SEVERITIES)[number];
export type MonitoringMetadata = Record<string, unknown>;

export type LaunchMonitoringSignal = {
  id: string;
  launchId: string;
  metric: string;
  severity: MonitoringSeverity;
  value: number;
  message: string;
  detail: string;
  metadata: MonitoringMetadata;
  observedAt: string;
};

export type RecordMonitoringInput = {
  id?: string;
  launchId: string;
  metric: string;
  severity: MonitoringSeverity;
  value: number;
  message?: string;
  metadata?: MonitoringMetadata;
};
