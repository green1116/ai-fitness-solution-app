/**
 * E05-P2 — Business Analytics Runtime types
 * Analytics layer above E05 Intelligence Foundation
 */

import {
  E05_ANALYTICS_BASE,
  E05_ANALYTICS_FREEZE_VERSION,
  E05_ANALYTICS_RUNTIME_ID,
  E05_ANALYTICS_VERSION,
  ANALYTICS_INSTANCE_PHASES,
  METRIC_KINDS,
} from "./analytics.constants";

export type AnalyticsInstancePhase =
  (typeof ANALYTICS_INSTANCE_PHASES)[number];
export type MetricKind = (typeof METRIC_KINDS)[number];

export type MetricDefinition = {
  id: string;
  kind: MetricKind;
  name: string;
  description: string;
  field: string;
  optional: boolean;
  readOnly: true;
};

export type MetricValue = {
  metricId: string;
  kind: MetricKind;
  value: number;
  label: string;
  readOnly: true;
};

export type AnalyticsDefinition = {
  id: string;
  name: string;
  description: string;
  /** Bound E05 intelligence module id */
  intelligenceId: string;
  insightId?: string;
  metricIds: string[];
  optional: boolean;
  readOnly: true;
};

export type AnalyticsExecutionResult = {
  success: boolean;
  analyticsId: string;
  intelligenceId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  metrics: MetricValue[];
  insightOutput: Readonly<Record<string, unknown>>;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type AnalyticsRegistryManifest = {
  runtimeId: typeof E05_ANALYTICS_RUNTIME_ID;
  version: typeof E05_ANALYTICS_VERSION;
  freezeVersion: typeof E05_ANALYTICS_FREEZE_VERSION;
  base: typeof E05_ANALYTICS_BASE;
  analyticsCount: number;
  metricCount: number;
  analytics: AnalyticsDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
