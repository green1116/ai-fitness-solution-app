/**
 * Product Dashboard — readiness / manifest types
 */

import type {
  DASHBOARD_MANAGER_STATUSES,
  DASHBOARD_READINESS_VERDICTS,
  PRODUCT_DASHBOARD_FRAMEWORK_BASE,
  PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_DASHBOARD_FRAMEWORK_ID,
  PRODUCT_DASHBOARD_FRAMEWORK_VERSION,
} from "./framework.constants";

export type DashboardReadinessVerdict =
  (typeof DASHBOARD_READINESS_VERDICTS)[number];
export type DashboardManagerStatus =
  (typeof DASHBOARD_MANAGER_STATUSES)[number];

export type DashboardReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type DashboardReadinessResult = {
  verdict: DashboardReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: DashboardReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type DashboardRegistryManifest = {
  frameworkId: typeof PRODUCT_DASHBOARD_FRAMEWORK_ID;
  version: typeof PRODUCT_DASHBOARD_FRAMEWORK_VERSION;
  freezeVersion: typeof PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION;
  base: typeof PRODUCT_DASHBOARD_FRAMEWORK_BASE;
  boardCount: number;
  widgetCount: number;
  layoutCount: number;
  snapshotCount: number;
};
