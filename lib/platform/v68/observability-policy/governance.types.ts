/**
 * V68 P7 — Observability policy types (read-only)
 */

export const V68_OBSERVABILITY_POLICY_VERSION = "v68-observability-policy-1" as const;

export type MetricKind = "counter" | "gauge" | "histogram" | "summary";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export type TraceSpanKind = "server" | "client" | "internal" | "producer" | "consumer";

export type AlertMappingSourceKind = "metric" | "log" | "trace";

export type ObservabilityPolicySignals = {
  reliabilityPolicyReady?: boolean;
  metricCatalogComplete?: boolean;
  logCatalogComplete?: boolean;
  traceCatalogComplete?: boolean;
  alertMappingComplete?: boolean;
  refsAligned?: boolean;
};

export type MetricCatalogEntry = {
  id: string;
  serviceDefRef: string;
  monitoringRef: string;
  sloRef?: string;
  metricViewRef?: string;
  kind: MetricKind;
  name: string;
  unit: string;
  required: boolean;
  description: string;
};

export type MetricCatalogManifest = {
  version: typeof V68_OBSERVABILITY_POLICY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  metrics: MetricCatalogEntry[];
  summary: string;
};

export type LogCatalogEntry = {
  id: string;
  serviceDefRef: string;
  monitoringRef: string;
  level: LogLevel;
  stream: string;
  retentionDays: number;
  required: boolean;
  description: string;
};

export type LogCatalogManifest = {
  version: typeof V68_OBSERVABILITY_POLICY_VERSION;
  entryCount: number;
  levelCount: number;
  catalogComplete: boolean;
  logs: LogCatalogEntry[];
  summary: string;
};

export type TraceCatalogEntry = {
  id: string;
  serviceDefRef: string;
  monitoringRef: string;
  spanKind: TraceSpanKind;
  samplingRate: number;
  required: boolean;
  description: string;
};

export type TraceCatalogManifest = {
  version: typeof V68_OBSERVABILITY_POLICY_VERSION;
  entryCount: number;
  spanKindCount: number;
  catalogComplete: boolean;
  traces: TraceCatalogEntry[];
  summary: string;
};

export type AlertMappingEntry = {
  id: string;
  serviceDefRef: string;
  sourceKind: AlertMappingSourceKind;
  sourceRef: string;
  failureRef: string;
  alertSeverityRef: string;
  required: boolean;
  description: string;
};

export type AlertMappingManifest = {
  version: typeof V68_OBSERVABILITY_POLICY_VERSION;
  entryCount: number;
  sourceKindCount: number;
  catalogComplete: boolean;
  mappings: AlertMappingEntry[];
  summary: string;
};

export type ObservabilityPolicyReport = {
  version: typeof V68_OBSERVABILITY_POLICY_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  reliabilityPolicyVersion: string;
  reliabilityPolicyReady: boolean;
  metrics: MetricCatalogManifest;
  logs: LogCatalogManifest;
  traces: TraceCatalogManifest;
  alertMappings: AlertMappingManifest;
  policyReady: boolean;
  readinessScore: number;
  summary: string;
};
