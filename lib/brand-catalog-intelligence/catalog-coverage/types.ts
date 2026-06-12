import type { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";

export const CATALOG_COVERAGE_RUNTIME_VERSION = "v19.1-catalog-coverage-1" as const;

export interface CatalogCoverageSnapshot {
  snapshotId: string;
  brandCoverage: number;
  categoryCoverage: number;
  equipmentCoverage: number;
  catalogCompletenessScore: number;
  brandCount: number;
  categoryCount: number;
  equipmentCount: number;
}

export interface CatalogCoverageRuntimePayload {
  version: typeof CATALOG_COVERAGE_RUNTIME_VERSION;
  brandCatalogVersion: typeof BRAND_CATALOG_INTELLIGENCE_VERSION;
  snapshot: CatalogCoverageSnapshot;
  catalogCompletenessScore: number;
  summary: string;
}
