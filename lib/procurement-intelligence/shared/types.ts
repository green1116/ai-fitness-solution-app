import type { RealCatalogBundle } from "@/lib/real-catalog-foundation/bridge/catalog-bridge";
import type { SupplierNetworkBundle } from "@/lib/regional-supplier-foundation/shared/types";

export const PROCUREMENT_INTELLIGENCE_VERSION = "v22-procurement-intelligence-3" as const;

export type ProcurementDataMode = "procurement-intelligence";

export type ProcurementStatus = "active" | "inactive" | "draft";

export type PricingChannel = "manufacturer" | "authorized-dealer" | "project" | "bulk";

export type ProjectType = "commercial-gym" | "hotel" | "campus" | "community" | "enterprise";

export type ProjectSize = "small" | "medium" | "large" | "enterprise";

export type DiscountType = "percentage" | "fixed" | "tiered";

export type DiscountAppliesTo = "channel" | "project" | "bulk" | "all";

export type LeadTimeSource = "warehouse" | "manufacturer" | "regional-depot" | "made-to-order";

export type AvailabilityLevel = "in-stock" | "low-stock" | "made-to-order" | "unavailable";

export type LeadTimePriority = "standard" | "expedited" | "critical";

export interface ChannelPricingEntry {
  id: string;
  brand: string;
  sku: string;
  channel: PricingChannel;
  listPrice: number;
  dealerPrice: number;
  projectPrice: number;
  bulkPrice: number;
  currency: string;
  region: string;
  status: ProcurementStatus;
  mode: ProcurementDataMode;
}

export interface ProjectPricingEntry {
  id: string;
  brand: string;
  sku: string;
  projectType: ProjectType;
  projectSize: ProjectSize;
  basePrice: number;
  discountRate: number;
  finalPrice: number;
  currency: string;
  status: ProcurementStatus;
  mode: ProcurementDataMode;
}

export interface DiscountRuleEntry {
  id: string;
  ruleName: string;
  brand: string;
  sku: string;
  quantityThreshold: number;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: DiscountAppliesTo;
  status: ProcurementStatus;
  mode: ProcurementDataMode;
}

export interface LeadTimeIntelligenceEntry {
  id: string;
  brand: string;
  sku: string;
  region: string;
  source: LeadTimeSource;
  leadTimeDays: number;
  availability: AvailabilityLevel;
  priority: LeadTimePriority;
  status: ProcurementStatus;
  mode: ProcurementDataMode;
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
