import type { PricingQuote, ProductCatalogEntry, SlaAssignment } from "@/lib/commercial-products/shared/types";
import type { ProductSku, ProjectComplexity, SlaTier } from "@/lib/commercial-products/shared/constants";

export interface QuoteRequest {
  sku: ProductSku;
  projectName: string;
  areaSqm: number;
  headcount: number;
  budgetCny: number;
  complexity?: ProjectComplexity;
  slaTier?: SlaTier;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export interface QuoteSnapshot {
  quoteId: string;
  sku: ProductSku;
  price: number;
  priceBand: { min: number; max: number };
  sla: string;
  eligible: boolean;
  reasons: string[];
  inputs: QuoteRequest;
  createdAt: string;
}

export interface QuoteResponse {
  ok: true;
  snapshot: QuoteSnapshot;
  pricing: PricingQuote;
  sla: SlaAssignment;
  catalogEntry: Pick<ProductCatalogEntry, "sku" | "name" | "deliverables" | "slaTier">;
}

export interface CommercialQuoteValidation {
  valid: boolean;
  skuExists: boolean;
  eligibilityReady: boolean;
  pricingReady: boolean;
  slaReady: boolean;
  snapshotReady: boolean;
  summary: string;
}

export type CommercialProductsAccessMode = "commercial-products-access";

export interface QuoteRuntimeMeta {
  runtimeId: string;
  version: string;
  mode: CommercialProductsAccessMode;
}

export interface SalesPortalProductCard {
  sku: ProductSku;
  name: string;
  description: string;
  priceMinCny: number;
  priceMaxCny: number;
  deliverableCount: number;
  defaultSla: SlaTier;
}

export interface SalesPortalRegistry {
  registryId: string;
  records: SalesPortalProductCard[];
  count: number;
  mode: CommercialProductsAccessMode;
}

export interface SalesPortalView {
  portalId: string;
  version: string;
  products: SalesPortalProductCard[];
  quoteApiPath: string;
  downloadApiPath: string;
  mode: CommercialProductsAccessMode;
}

export interface SalesPortalValidation {
  valid: boolean;
  productCount: number;
  quoteApiRegistered: boolean;
  productCardsReady: boolean;
  summary: string;
}
