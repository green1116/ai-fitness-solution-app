export const BRAND_CATALOG_INTELLIGENCE_VERSION = "v19.1-brand-catalog-intelligence-1" as const;

export type BrandCatalogStatus = "success" | "failed";

export type BrandCatalogStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export interface BrandCatalogStageResult {
  stageId: string;
  label: string;
  status: BrandCatalogStageStatus;
  durationMs: number;
  message: string;
}

export interface BrandCatalogRuntimeResult<TPayload> {
  version: typeof BRAND_CATALOG_INTELLIGENCE_VERSION;
  runtimeId: string;
  domain: string;
  status: BrandCatalogStatus;
  stages: BrandCatalogStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface BrandCatalogIntelligenceEvidence {
  evidenceId: string;
  version: typeof BRAND_CATALOG_INTELLIGENCE_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: BrandCatalogStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}

export interface BrandCatalogIntelligenceReport {
  version: typeof BRAND_CATALOG_INTELLIGENCE_VERSION;
  reportId: string;
  deploymentId: string;
  brandCoverage: number;
  equipmentCoverage: number;
  budgetCoverage: number;
  differentiationReadiness: number;
  summary: string;
  generatedAt: string;
}
