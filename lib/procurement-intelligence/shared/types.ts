import type { PI_P1_PHASE, PI_P1_TAG } from "./constants";

export * from "./commercial-types";

export type SupplierAvailabilityStatus =
  | "in-stock"
  | "limited"
  | "backorder"
  | "unavailable";

export type SupplierPricingSourceType =
  | "catalog"
  | "real-catalog"
  | "tender"
  | "estimate";

export type ProcurementLevel =
  | "preferred"
  | "acceptable"
  | "fallback"
  | "defer";

export interface SupplierRecord {
  id: string;
  name: string;
  brandIds: string[];
  capabilityTags: string[];
  region?: string;
  availabilityStatus: SupplierAvailabilityStatus;
  reliabilityScore: number;
  source: string;
}

export interface SupplierCapabilityRecord {
  supplierId: string;
  capabilityTag: string;
  strengthScore: number;
  evidenceIds: string[];
}

export interface SupplierAvailabilityRecord {
  supplierId: string;
  productId?: string;
  availabilityStatus: SupplierAvailabilityStatus;
  etaDays?: number;
  confidence: number;
}

export interface SupplierPricingRecord {
  supplierId: string;
  productId?: string;
  priceLow: number;
  priceHigh: number;
  currency: string;
  confidence: number;
  sourceType: SupplierPricingSourceType;
}

export interface ProcurementMatchRecord {
  requirementId: string;
  decisionId: string;
  supplierId: string;
  productId: string;
  matchScore: number;
  procurementFitScore: number;
  deliveryFitScore: number;
  priceFitScore: number;
  availabilityFitScore: number;
  evidenceFitScore: number;
}

export interface ProcurementRecommendation {
  requirementId: string;
  decisionId: string;
  optimalSupplierId: string;
  optimalProductId: string;
  candidateSupplierIds: string[];
  candidateProductIds: string[];
  procurementLevel: ProcurementLevel;
  recommendationReason: string[];
  riskReason: string[];
  costSummary: string;
  leadTimeSummary: string;
  availabilitySummary: string;
}

export interface ProcurementIntelligencePhase1FreezeMeta {
  tag: typeof PI_P1_TAG;
  version: typeof PI_P1_TAG;
  phase: typeof PI_P1_PHASE;
  valid: boolean;
}
