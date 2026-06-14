export const PRODUCT_CATALOG_VERSION = "v36-product-catalog-1" as const;
export const PRODUCT_CATALOG_TAG = "v36-product-catalog-foundation" as const;

export type ProductCatalogMode = "product-catalog";

export type CatalogType =
  | "equipment"
  | "flooring"
  | "track"
  | "turf"
  | "construction"
  | "service";

export type CatalogStatus =
  | "draft"
  | "published"
  | "active"
  | "matched"
  | "quoted"
  | "approved"
  | "discontinued"
  | "archived";

export type IndustrySector =
  | "sports-flooring"
  | "running-track"
  | "artificial-turf"
  | "gym-equipment"
  | "sports-hall"
  | "fitness-center";

export interface CatalogScore {
  scoreId: string;
  catalogId: string;
  coverageScore: number;
  pricingScore: number;
  availabilityScore: number;
  complianceScore: number;
  matchingScore: number;
  totalCatalogScore: number;
  mode: ProductCatalogMode;
}

export interface CatalogCategory {
  categoryId: string;
  catalogType: CatalogType;
  industrySector: IndustrySector;
  title: string;
  summary: string;
  productCount: number;
  categoryReady: boolean;
  mode: ProductCatalogMode;
}

export interface CatalogProduct {
  productId: string;
  sku: string;
  catalogType: CatalogType;
  industrySector: IndustrySector;
  productName: string;
  brandName: string;
  unitPrice: number;
  currency: "CNY";
  leadTimeDays: number;
  availability: "in-stock" | "made-to-order" | "import-lead-time";
  productReady: boolean;
  mode: ProductCatalogMode;
}

export interface CatalogBundle {
  bundleId: string;
  catalogId: string;
  proposalId: string;
  productIds: string[];
  productCount: number;
  bundleReady: boolean;
  mode: ProductCatalogMode;
}

export interface CatalogEngineCompatibility {
  realCatalogFoundation: string;
  tenderProposalLayer: string;
  marketplaceLayer: string;
}

export interface ProductCatalog {
  catalogId: string;
  proposalId: string;
  tenderId: string;
  buyerOrganizationId: string;
  catalogType: CatalogType;
  industrySector: IndustrySector;
  title: string;
  summary: string;
  catalogStatus: CatalogStatus;
  score: CatalogScore;
  categoryId: string;
  productIds: string[];
  bundleId: string;
  generatedAt: string;
  metadata: Record<string, string>;
  compatibility: CatalogEngineCompatibility;
  mode: ProductCatalogMode;
}

export interface CatalogContext {
  contextId: string;
  catalogs: ProductCatalog[];
  catalogCount: number;
  typeBreakdown: Record<CatalogType, number>;
  statusBreakdown: Record<CatalogStatus, number>;
  sectorBreakdown: Record<IndustrySector, number>;
  averageScore: number;
  contextReady: boolean;
  mode: ProductCatalogMode;
}

export interface CatalogRegistry {
  registryId: string;
  catalogs: ProductCatalog[];
  catalogCount: number;
  typeBreakdown: Record<CatalogType, number>;
  statusBreakdown: Record<CatalogStatus, number>;
  sectorBreakdown: Record<IndustrySector, number>;
  registryReady: boolean;
  mode: ProductCatalogMode;
}

export interface CatalogQuery {
  buyerOrganizationId?: string;
  catalogType?: CatalogType;
  catalogStatus?: CatalogStatus;
  industrySector?: IndustrySector;
  minCatalogScore?: number;
  limit?: number;
}

export interface CatalogQueryResult {
  queryId: string;
  query: CatalogQuery;
  catalogs: ProductCatalog[];
  hitCount: number;
  catalogReady: boolean;
}

export interface CatalogMatchResult {
  matchId: string;
  catalogId: string;
  proposalId: string;
  tenderId: string;
  matchScore: number;
  matchedProductIds: string[];
  matchReady: boolean;
  mode: ProductCatalogMode;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface ProductCatalogValidation {
  valid: boolean;
  catalogRegistry: RegistryValidation;
  catalogContext: RegistryValidation;
  catalogCategory: RegistryValidation;
  catalogProduct: RegistryValidation;
  catalogBundle: RegistryValidation;
  catalogMatcher: RegistryValidation;
  catalogScoring: RegistryValidation;
  catalogQuery: RegistryValidation;
  engineCompatibility: RegistryValidation;
}

export const CANONICAL_PRODUCT_CATALOG_BUYER_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_CATALOG_QUERY: CatalogQuery = {
  buyerOrganizationId: CANONICAL_PRODUCT_CATALOG_BUYER_ID,
  catalogType: "equipment",
  limit: 5,
} as const;

export const TOP_CATALOG_SCORE_THRESHOLD = 78 as const;

export const ACTIVE_CATALOG_STATUSES: CatalogStatus[] = [
  "published",
  "active",
  "matched",
  "quoted",
  "approved",
];

export const MATCHED_CATALOG_STATUSES: CatalogStatus[] = ["matched", "quoted", "approved"];

export const CATALOG_TYPES: CatalogType[] = [
  "equipment",
  "flooring",
  "track",
  "turf",
  "construction",
  "service",
];

export const CATALOG_STATUSES: CatalogStatus[] = [
  "draft",
  "published",
  "active",
  "matched",
  "quoted",
  "approved",
  "discontinued",
  "archived",
];

export const INDUSTRY_SECTORS: IndustrySector[] = [
  "sports-flooring",
  "running-track",
  "artificial-turf",
  "gym-equipment",
  "sports-hall",
  "fitness-center",
];
