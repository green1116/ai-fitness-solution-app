/**
 * Operations O2 — Report types + readiness / manifest
 */

import type {
  O2_MANAGER_STATUSES,
  O2_READINESS_VERDICTS,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION,
  REPORT_KINDS,
} from "../usage/usage.constants";

export type ReportKind = (typeof REPORT_KINDS)[number];
export type O2ReadinessVerdict = (typeof O2_READINESS_VERDICTS)[number];
export type O2ManagerStatus = (typeof O2_MANAGER_STATUSES)[number];

export type UsageIntelligenceReport = {
  id: string;
  kind: ReportKind;
  title: string;
  accountRef: string;
  highlights: string[];
  overallScore: number;
  detail: string;
  generatedAt: string;
};

export type GenerateUsageReportInput = {
  id?: string;
  kind: ReportKind;
  title?: string;
  accountRef: string;
};

export type O2ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type O2ReadinessResult = {
  verdict: O2ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: O2ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type O2RegistryManifest = {
  foundationId: typeof OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID;
  version: typeof OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION;
  freezeVersion: typeof OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION;
  base: typeof OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE;
  streamCount: number;
  trackingCount: number;
  adoptionCount: number;
  featureMetricsCount: number;
  activityEventCount: number;
  activityAnalyticsCount: number;
  valueMetricsCount: number;
  valueScoreCount: number;
  reportCount: number;
};
