/**
 * Product Report — readiness / manifest types
 */

import type {
  PRODUCT_REPORT_ENGINE_BASE,
  PRODUCT_REPORT_ENGINE_FREEZE_VERSION,
  PRODUCT_REPORT_ENGINE_ID,
  PRODUCT_REPORT_ENGINE_VERSION,
  REPORT_MANAGER_STATUSES,
  REPORT_READINESS_VERDICTS,
} from "./engine.constants";

export type ReportReadinessVerdict =
  (typeof REPORT_READINESS_VERDICTS)[number];
export type ReportManagerStatus = (typeof REPORT_MANAGER_STATUSES)[number];

export type ReportReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReportReadinessResult = {
  verdict: ReportReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ReportReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ReportRegistryManifest = {
  engineId: typeof PRODUCT_REPORT_ENGINE_ID;
  version: typeof PRODUCT_REPORT_ENGINE_VERSION;
  freezeVersion: typeof PRODUCT_REPORT_ENGINE_FREEZE_VERSION;
  base: typeof PRODUCT_REPORT_ENGINE_BASE;
  templateCount: number;
  jobCount: number;
  renderCount: number;
  deliveryCount: number;
};
