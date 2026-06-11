import type { BRAND_CATALOG_INTELLIGENCE_VERSION, ReadinessStubMode } from "../shared/types";

export const BRAND_INTELLIGENCE_RUNTIME_VERSION = "v19.1-brand-intelligence-1" as const;

export const BRAND_POSITIONING_TIERS = ["premium", "commercial", "value"] as const;
export type BrandPositioningTier = (typeof BRAND_POSITIONING_TIERS)[number];

export interface BrandIntelligenceProfile {
  brandId: string;
  brandName: string;
  brandTier: BrandPositioningTier;
  marketPosition: string;
  typicalCustomer: string;
  competitiveAdvantages: string[];
  competitiveDisadvantages: string[];
  maintenanceCharacteristics: string[];
  lifecycleCharacteristics: string[];
  intelligenceScore: number;
  mode: ReadinessStubMode;
}

export interface BrandIntelligenceSnapshot {
  snapshotId: string;
  profiles: BrandIntelligenceProfile[];
  tierDistribution: Record<BrandPositioningTier, number>;
  intelligenceReadiness: number;
}

export interface BrandIntelligenceRuntimePayload {
  version: typeof BRAND_INTELLIGENCE_RUNTIME_VERSION;
  brandCatalogVersion: typeof BRAND_CATALOG_INTELLIGENCE_VERSION;
  snapshot: BrandIntelligenceSnapshot;
  intelligenceReadiness: number;
  summary: string;
}
