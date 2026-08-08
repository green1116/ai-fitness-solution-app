/**
 * V80 Pilot P19 — Integration & production hardening schema
 */

export const PRODUCTION_HARDENING_VERSION = "v80-pilot-p19-harden-1";

export type HardeningCheckStatus = "pass" | "fail" | "warn" | "skip";

export type HardeningCheckCategory =
  | "e2e_integration"
  | "api_contract"
  | "ui_navigation"
  | "determinism"
  | "regression_catalog"
  | "audit_consistency"
  | "export_download"
  | "route_coverage"
  | "workflow_recovery"
  | "readiness";

export type HardeningCheckResult = {
  id: string;
  category: HardeningCheckCategory;
  title: string;
  status: HardeningCheckStatus;
  message: string;
  details?: Record<string, unknown>;
};

export type RegressionSuiteEntry = {
  pilot: string;
  script: string;
  present: boolean;
};

export type ProductionReadinessBand = "ready" | "conditional" | "blocked";

export type ProductionHardeningReport = {
  version: typeof PRODUCTION_HARDENING_VERSION;
  organizationId: string;
  generatedAt: string;
  contentHash: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
    passRate: number;
  };
  band: ProductionReadinessBand;
  checks: HardeningCheckResult[];
  regressionCatalog: RegressionSuiteEntry[];
  coverage: {
    apiRoutesExpected: number;
    apiRoutesFound: number;
    uiPagesExpected: number;
    uiPagesFound: number;
    navLinksExpected: number;
    navLinksFound: number;
    verifyScriptsExpected: number;
    verifyScriptsFound: number;
  };
  narrative: {
    headline: string;
    blockers: string[];
    nextActions: string[];
  };
};
