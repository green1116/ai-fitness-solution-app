export const REAL_CATALOG_FOUNDATION_VERSION = "v20-real-catalog-foundation-1" as const;

export type CatalogDataMode = "real-catalog";

export type RealBrandTier = "premium" | "commercial" | "mid-market" | "value" | "domestic";

export type RealEquipmentCategory =
  | "cardio"
  | "strength"
  | "functional"
  | "group-training"
  | "recovery"
  | "smart-connected";

export type ProcurementAvailability = "in-stock" | "made-to-order" | "import-lead-time";

export interface RealBrandEntry {
  brandId: string;
  brandName: string;
  manufacturer: string;
  originCountry: string;
  headquarters: string;
  brandTier: RealBrandTier;
  marketPosition: string;
  chinaDistributor: string;
  officialWebsite: string;
  targetSegments: string[];
  competitiveAdvantages: string[];
  mode: CatalogDataMode;
}

export interface RealEquipmentEntry {
  sku: string;
  modelId: string;
  modelName: string;
  brandId: string;
  brandName: string;
  category: RealEquipmentCategory;
  subCategory: string;
  dimensionsCm: { length: number; width: number; height: number };
  weightKg: number;
  powerRequirement: string;
  maxUserWeightKg: number;
  connectivity: string[];
  warrantyYears: number;
  leadTimeDays: number;
  procurementAvailability: ProcurementAvailability;
  datasheetRef: string;
  mode: CatalogDataMode;
}

export interface RealPricingEntry {
  pricingId: string;
  sku: string;
  modelName: string;
  brandName: string;
  currency: "CNY";
  listPrice: number;
  dealerPrice: number;
  projectPriceMin: number;
  projectPriceMax: number;
  priceValidFrom: string;
  priceSource: "manufacturer-list" | "authorized-dealer" | "industry-benchmark";
  mode: CatalogDataMode;
}

export interface RealMaintenanceEntry {
  maintenanceId: string;
  sku: string;
  modelName: string;
  brandName: string;
  serviceIntervalDays: number;
  annualMaintenanceCost: number;
  preventiveMaintenanceCost: number;
  emergencyRepairCost: number;
  sparePartsAvailability: "same-day" | "next-day" | "3-5-days" | "1-2-weeks";
  slaResponseHours: number;
  certifiedTechnicianRequired: boolean;
  mode: CatalogDataMode;
}

export interface RealReplacementEntry {
  replacementId: string;
  sku: string;
  modelName: string;
  brandName: string;
  expectedLifespanYears: number;
  replacementCycleYears: number;
  residualValuePercent: number;
  replacementCostEstimate: number;
  upgradePath: string;
  endOfLifeDisposal: string;
  mode: CatalogDataMode;
}

export interface RealCatalogFoundationEvidence {
  evidenceId: string;
  version: typeof REAL_CATALOG_FOUNDATION_VERSION;
  catalogs: string[];
  brandCount: number;
  equipmentCount: number;
  pricingCoverage: number;
  maintenanceCoverage: number;
  replacementCoverage: number;
  catalogIntegrityScore: number;
  generatedAt: string;
  summary: string;
}

export interface RealCatalogFoundationReport {
  version: typeof REAL_CATALOG_FOUNDATION_VERSION;
  reportId: string;
  brandCount: number;
  equipmentCount: number;
  pricingEntryCount: number;
  maintenanceEntryCount: number;
  replacementEntryCount: number;
  catalogIntegrityScore: number;
  purchasabilityScore: number;
  brands: Array<{ brandName: string; brandTier: RealBrandTier; equipmentCount: number }>;
  summary: string;
  generatedAt: string;
}
