/**
 * E05-P3 — KPI Intelligence Engine types
 * KPI interpretation layer above analytics
 */

import {
  E05_KPI_BASE,
  E05_KPI_ENGINE_ID,
  E05_KPI_FREEZE_VERSION,
  E05_KPI_VERSION,
  KPI_KINDS,
  KPI_STATUSES,
} from "./kpi.constants";

export type KpiKind = (typeof KPI_KINDS)[number];
export type KpiStatus = (typeof KPI_STATUSES)[number];

export type KpiThresholds = {
  green: number;
  amber: number;
  /** When true, lower values are better (e.g. risk index) */
  lowerIsBetter?: boolean;
  readOnly: true;
};

export type KpiDefinition = {
  id: string;
  name: string;
  description: string;
  kind: KpiKind;
  /** Bound E05 analytics id */
  analyticsId: string;
  metricId: string;
  thresholds: KpiThresholds;
  target?: number;
  optional: boolean;
  readOnly: true;
};

export type KpiEvaluation = {
  kpiId: string;
  metricId: string;
  value: number;
  status: KpiStatus;
  target?: number;
  delta?: number;
  interpretation: string;
  readOnly: true;
};

export type KpiExecutionResult = {
  success: boolean;
  kpiId: string;
  analyticsId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  evaluation: KpiEvaluation;
  analyticsOutput: Readonly<Record<string, unknown>>;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type KpiRegistryManifest = {
  engineId: typeof E05_KPI_ENGINE_ID;
  version: typeof E05_KPI_VERSION;
  freezeVersion: typeof E05_KPI_FREEZE_VERSION;
  base: typeof E05_KPI_BASE;
  kpiCount: number;
  kpis: KpiDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
