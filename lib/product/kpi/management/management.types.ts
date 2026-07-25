/**
 * Product KPI — readiness / manifest types
 */

import type {
  KPI_MANAGER_STATUSES,
  KPI_READINESS_VERDICTS,
  PRODUCT_KPI_MANAGEMENT_BASE,
  PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_KPI_MANAGEMENT_ID,
  PRODUCT_KPI_MANAGEMENT_VERSION,
} from "./management.constants";

export type KpiReadinessVerdict = (typeof KPI_READINESS_VERDICTS)[number];
export type KpiManagerStatus = (typeof KPI_MANAGER_STATUSES)[number];

export type KpiReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type KpiReadinessResult = {
  verdict: KpiReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: KpiReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type KpiRegistryManifest = {
  managementId: typeof PRODUCT_KPI_MANAGEMENT_ID;
  version: typeof PRODUCT_KPI_MANAGEMENT_VERSION;
  freezeVersion: typeof PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION;
  base: typeof PRODUCT_KPI_MANAGEMENT_BASE;
  definitionCount: number;
  targetCount: number;
  measurementCount: number;
  scorecardCount: number;
};
