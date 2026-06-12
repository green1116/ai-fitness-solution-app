import type { BIDDER_INTELLIGENCE_VERSION, ReadinessStubMode } from "../shared/types";

export const BRAND_LIBRARY_RUNTIME_VERSION = "v19.0-brand-library-1" as const;

export const PRICE_TIERS = ["economy", "standard", "premium", "enterprise"] as const;
export type PriceTier = (typeof PRICE_TIERS)[number];

export const TARGET_SEGMENTS = ["government", "enterprise", "campus", "hotel", "community"] as const;
export type TargetSegment = (typeof TARGET_SEGMENTS)[number];

export interface BrandProfile {
  brandId: string;
  brandName: string;
  manufacturer: string;
  originCountry: string;
  category: string;
  mode: ReadinessStubMode;
}

export interface BrandEntry {
  brand: BrandProfile;
  priceTier: PriceTier;
  strengths: string[];
  weaknesses: string[];
  targetSegments: TargetSegment[];
  brandScore: number;
}

export interface BrandLibrarySnapshot {
  libraryId: string;
  brands: BrandEntry[];
  tierCoverage: Record<PriceTier, number>;
  segmentCoverage: Record<TargetSegment, number>;
  brandReadiness: number;
}

export interface BrandLibraryRuntimePayload {
  version: typeof BRAND_LIBRARY_RUNTIME_VERSION;
  bidderIntelligenceVersion: typeof BIDDER_INTELLIGENCE_VERSION;
  snapshot: BrandLibrarySnapshot;
  brandReadiness: number;
  summary: string;
}
