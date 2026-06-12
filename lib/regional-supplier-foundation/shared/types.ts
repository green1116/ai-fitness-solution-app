export const REGIONAL_SUPPLIER_FOUNDATION_VERSION = "v21-regional-supplier-foundation-3" as const;

export type SupplierDataMode = "supplier-network";

export type SupplierStatus = "active" | "inactive" | "pending";

export type AuthorizationLevel = "national" | "regional" | "provincial" | "authorized-dealer";

export type DealerStatus = "active" | "inactive";

export type ServiceLevel = "premium" | "standard" | "basic";

export type CoverageLevel = "tier-1" | "tier-2" | "tier-3";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock" | "made-to-order";

export type ServiceProviderStatus = "active" | "inactive";

export interface SupplierEntry {
  id: string;
  brand: string;
  supplierName: string;
  region: string;
  authorizationLevel: AuthorizationLevel;
  contact: string;
  status: SupplierStatus;
  mode: SupplierDataMode;
}

export interface DealerEntry {
  id: string;
  dealerName: string;
  city: string;
  coverageArea: string;
  warehouseCapability: boolean;
  serviceLevel: ServiceLevel;
  status: DealerStatus;
  mode: SupplierDataMode;
}

export interface CoverageEntry {
  id: string;
  city: string;
  coverageLevel: CoverageLevel;
  responseTime: string;
  installationLeadTime: string;
  maintenanceSla: string;
  mode: SupplierDataMode;
}

export interface InventoryEntry {
  id: string;
  sku: string;
  stockStatus: StockStatus;
  availableQuantity: number;
  safetyStock: number;
  replenishmentLeadTime: string;
  warehouseLocation: string;
  lastUpdated: string;
  mode: SupplierDataMode;
}

export interface ServiceEntry {
  id: string;
  city: string;
  serviceProvider: string;
  responseTime: string;
  onsiteTime: string;
  sla: string;
  engineerCount: number;
  sparePartsAvailable: boolean;
  status: ServiceProviderStatus;
  mode: SupplierDataMode;
}

export interface SupplierFoundationPhase1Report {
  version: typeof REGIONAL_SUPPLIER_FOUNDATION_VERSION;
  reportId: string;
  supplierCount: number;
  dealerCount: number;
  coverageCount: number;
  summary: string;
  generatedAt: string;
}

export interface InventoryCoverageSummary {
  totalSkus: number;
  inStockCount: number;
  lowStockCount: number;
  madeToOrderCount: number;
  warehouseLocations: string[];
  coverageRate: number;
}

export interface ServiceCoverageSummary {
  totalProviders: number;
  activeProviders: number;
  citiesCovered: string[];
  avgEngineerCount: number;
  sparePartsCoverageRate: number;
}

export interface SupplierNetworkBundle {
  bundleId: string;
  brand: string;
  city: string;
  sku: string;
  supplier: SupplierEntry[];
  dealer: DealerEntry[];
  coverage: CoverageEntry | undefined;
  inventory: InventoryEntry[];
  service: ServiceEntry[];
  bundleReadiness: number;
}

export interface SupplierNetworkEvidence {
  evidenceId: string;
  version: typeof REGIONAL_SUPPLIER_FOUNDATION_VERSION;
  supplierCount: number;
  dealerCount: number;
  coverageCount: number;
  inventoryCount: number;
  serviceCount: number;
  bundleValidationPassed: boolean;
  generatedAt: string;
  summary: string;
}

export interface SupplierNetworkReport {
  version: typeof REGIONAL_SUPPLIER_FOUNDATION_VERSION;
  reportId: string;
  supplierCount: number;
  dealerCount: number;
  coverageCount: number;
  inventoryCount: number;
  serviceCount: number;
  bundleValidation: {
    valid: boolean;
    brandExists: boolean;
    cityExists: boolean;
    skuExists: boolean;
    inventoryMatched: boolean;
    serviceMatched: boolean;
  };
  exampleBundle: SupplierNetworkBundle | null;
  summary: string;
  generatedAt: string;
}

export interface SupplierFoundationPhase2Report {
  version: typeof REGIONAL_SUPPLIER_FOUNDATION_VERSION;
  reportId: string;
  supplierCount: number;
  dealerCount: number;
  coverageCount: number;
  inventoryCount: number;
  serviceCount: number;
  inventoryCoverage: InventoryCoverageSummary;
  serviceCoverage: ServiceCoverageSummary;
  validation: {
    phase1Valid: boolean;
    inventoryValid: boolean;
    serviceValid: boolean;
    overallValid: boolean;
  };
  summary: string;
  generatedAt: string;
}
