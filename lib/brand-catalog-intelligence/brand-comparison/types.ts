import type { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";

export const BRAND_COMPARISON_RUNTIME_VERSION = "v19.1-brand-comparison-1" as const;

export interface BrandComparisonPair {
  comparisonId: string;
  brandA: string;
  brandB: string;
  positioningDifference: string;
  costDifference: string;
  maintenanceDifference: string;
  recommendationDifference: string;
  comparisonScore: number;
}

export interface BrandComparisonSnapshot {
  snapshotId: string;
  comparisons: BrandComparisonPair[];
  comparisonReadiness: number;
}

export interface BrandComparisonRuntimePayload {
  version: typeof BRAND_COMPARISON_RUNTIME_VERSION;
  brandCatalogVersion: typeof BRAND_CATALOG_INTELLIGENCE_VERSION;
  snapshot: BrandComparisonSnapshot;
  comparisonReadiness: number;
  summary: string;
}
