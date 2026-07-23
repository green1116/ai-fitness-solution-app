/**
 * Commercialization P6 — Report types + shared readiness / manifest
 */

import type {
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION,
  REPORT_KINDS,
  REVENUE_MANAGER_STATUSES,
  REVENUE_READINESS_VERDICTS,
} from "../kpi/kpi.constants";

export type ReportKind = (typeof REPORT_KINDS)[number];
export type RevenueReadinessVerdict =
  (typeof REVENUE_READINESS_VERDICTS)[number];
export type RevenueManagerStatus =
  (typeof REVENUE_MANAGER_STATUSES)[number];

export type RevenueReport = {
  id: string;
  kind: ReportKind;
  title: string;
  sections: string[];
  highlights: string[];
  overallScore: number;
  detail: string;
  generatedAt: string;
};

export type GenerateReportInput = {
  id?: string;
  kind: ReportKind;
  title?: string;
  accountRef?: string;
};

export type RevenueReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type RevenueReadinessResult = {
  verdict: RevenueReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: RevenueReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type RevenueRegistryManifest = {
  foundationId: typeof COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID;
  version: typeof COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION;
  freezeVersion: typeof COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION;
  base: typeof COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE;
  streamCount: number;
  metricsCount: number;
  analyticsCount: number;
  calculationCount: number;
  kpiCount: number;
  valueCount: number;
  healthCount: number;
  scoreCount: number;
  reportCount: number;
};
