import type { RealCatalogBundle } from "@/lib/real-catalog-foundation/bridge/catalog-bridge";
import type { SupplierNetworkBundle } from "@/lib/regional-supplier-foundation/shared/types";

export const PROCUREMENT_INTELLIGENCE_VERSION = "v22-procurement-intelligence" as const;

export type ProcurementIntelligenceCommercialMode = "procurement-intelligence";

export type ProjectType =
  | "commercial-gym"
  | "hotel"
  | "enterprise"
  | "campus"
  | "community";

export interface ChannelPricingEntry {
  id: string;
  brand: string;
  sku: string;
  channel: string;
  listPrice: number;
  dealerPrice: number;
  projectPrice: number;
  bulkPrice: number;
  currency: string;
  region: string;
  status: "active" | "inactive";
  mode: ProcurementIntelligenceCommercialMode;
}

export interface ProjectPricingEntry {
  id: string;
  brand: string;
  sku: string;
  projectType: ProjectType;
  projectSize: string;
  basePrice: number;
  discountRate: number;
  finalPrice: number;
  currency: string;
  status: "active" | "inactive";
  mode: ProcurementIntelligenceCommercialMode;
}

export interface DiscountRuleEntry {
  id: string;
  ruleName: string;
  brand: string;
  sku: string;
  quantityThreshold: number;
  discountType: "percentage" | "fixed" | "tiered";
  discountValue: number;
  appliesTo: "bulk" | "project" | "all";
  status: "active" | "inactive";
  mode: ProcurementIntelligenceCommercialMode;
}

export interface LeadTimeIntelligenceEntry {
  id: string;
  brand: string;
  sku: string;
  region: string;
  source: string;
  leadTimeDays: number;
  availability: string;
  priority: string;
  status: "active" | "inactive";
  mode: ProcurementIntelligenceCommercialMode;
}

export interface ProcurementBundle {
  bundleId: string;
  sku: string;
  region: string;
  projectType: ProjectType;
  quantity: number;
  channelPricing: ChannelPricingEntry;
  projectPricing: ProjectPricingEntry | undefined;
  discountRule: DiscountRuleEntry | undefined;
  leadTime: LeadTimeIntelligenceEntry | undefined;
  finalPrice: number;
  savings: number;
  bundleReadiness: number;
}

export interface CommercialBundle {
  bundleId: string;
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
  region: string;
  catalog: RealCatalogBundle | null;
  supplierNetwork: SupplierNetworkBundle;
  procurement: ProcurementBundle;
  finalPrice: number;
  savings: number;
  leadTime: LeadTimeIntelligenceEntry | undefined;
  readinessScore: number;
}

export interface ProcurementIntelligencePhase1Report {
  version: typeof PROCUREMENT_INTELLIGENCE_VERSION;
  reportId: string;
  channelPricingCount: number;
  projectPricingCount: number;
  discountRuleCount: number;
  leadTimeCount: number;
  validation: {
    valid: boolean;
    channelPricingValid: boolean;
    projectPricingValid: boolean;
    discountRulesValid: boolean;
    leadTimeValid: boolean;
  };
  summary: string;
  generatedAt: string;
}

export interface ProcurementReport {
  version: typeof PROCUREMENT_INTELLIGENCE_VERSION;
  reportId: string;
  channelPricingCount: number;
  projectPricingCount: number;
  discountRuleCount: number;
  leadTimeCount: number;
  bundleValidation: {
    valid: boolean;
    skuExists: boolean;
    pricingExists: boolean;
    leadTimeExists: boolean;
    discountCalculable: boolean;
  };
  exampleBundle: ProcurementBundle | null;
  summary: string;
  generatedAt: string;
}

export interface CommercialBundleReport {
  version: typeof PROCUREMENT_INTELLIGENCE_VERSION;
  reportId: string;
  bundleValidation: {
    valid: boolean;
    catalogExists: boolean;
    supplierExists: boolean;
    inventoryExists: boolean;
    serviceExists: boolean;
    pricingExists: boolean;
  };
  exampleBundle: CommercialBundle | null;
  readinessScore: number;
  summary: string;
  generatedAt: string;
}
