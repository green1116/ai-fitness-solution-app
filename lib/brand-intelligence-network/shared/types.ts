export const BRAND_INTELLIGENCE_NETWORK_VERSION = "v38-brand-intelligence-network-1" as const;
export const BRAND_INTELLIGENCE_NETWORK_TAG = "v38-brand-intelligence-network-foundation" as const;
export const BRAND_INTELLIGENCE_NETWORK_P1_TAG = "v38-brand-intelligence-network-p1" as const;
export const BRAND_INTELLIGENCE_NETWORK_P2_TAG = "v38-brand-intelligence-network-p2" as const;
export const BRAND_INTELLIGENCE_NETWORK_P3_TAG = "v38-brand-intelligence-network-p3" as const;

export type BrandIntelligenceMode = "brand-intelligence-network";

export type BrandTier = "premium" | "commercial" | "mid-market" | "value" | "domestic";

export type BrandStatus =
  | "draft"
  | "active"
  | "verified"
  | "authorized"
  | "matched"
  | "restricted"
  | "archived";

export type ManufacturerStatus = "active" | "inactive" | "verified" | "archived";

export type ManufacturerAuthorizationStatus = "authorized" | "pending" | "restricted" | "revoked";

export type AuthorizationLevel =
  | "national"
  | "regional"
  | "provincial"
  | "authorized-dealer";

export type AuthorizationLinkStatus = "active" | "pending" | "expired" | "revoked";

export type LinkStatus = "active" | "pending" | "discontinued" | "archived";

export type BrandEvidenceKind =
  | "certificate"
  | "datasheet"
  | "test-report"
  | "authorization"
  | "case-study"
  | "project-reference";

export type BrandEvidenceSourceLayer =
  | "v20-real-catalog"
  | "v26-brand-portal"
  | "v38-brand-intelligence-network"
  | "v39-evidence-intelligence";

export type IndustrySector =
  | "sports-flooring"
  | "running-track"
  | "artificial-turf"
  | "gym-equipment"
  | "sports-hall"
  | "fitness-center";

export interface BrandScore {
  scoreId: string;
  brandId: string;
  positioningScore: number;
  complianceScore: number;
  catalogCoverageScore: number;
  supplierCoverageScore: number;
  evidenceCoverageScore: number;
  totalBrandScore: number;
  mode: BrandIntelligenceMode;
}

export interface BrandEngineCompatibility {
  realCatalogFoundation: string;
  brandPortalLayer: string;
  productCatalogLayer: string;
  supplierNetworkLayer: string;
  evidenceIntelligenceLayer: string;
}

export interface BrandRecord {
  brandId: string;
  brandName: string;
  brandTier: BrandTier;
  brandStatus: BrandStatus;
  organizationId?: string;
  manufacturerId: string;
  industrySectors: IndustrySector[];
  aliasNames: string[];
  score: BrandScore;
  supplierLinkIds: string[];
  skuLinkIds: string[];
  authorizationLinkIds: string[];
  evidenceLinkIds: string[];
  metadata: Record<string, string>;
  compatibility: BrandEngineCompatibility;
  mode: BrandIntelligenceMode;
}

export interface ManufacturerRecord {
  manufacturerId: string;
  manufacturerName: string;
  region: string;
  status: ManufacturerStatus;
  brandIds: string[];
  authorizationStatus: ManufacturerAuthorizationStatus;
  metadata: Record<string, string>;
  mode: BrandIntelligenceMode;
}

export interface BrandAliasRecord {
  aliasId: string;
  brandId: string;
  aliasName: string;
  normalizedAlias: string;
  mode: BrandIntelligenceMode;
}

export interface BrandRegistry {
  registryId: string;
  brands: BrandRecord[];
  brandCount: number;
  tierBreakdown: Record<BrandTier, number>;
  statusBreakdown: Record<BrandStatus, number>;
  sectorBreakdown: Record<IndustrySector, number>;
  registryReady: boolean;
  mode: BrandIntelligenceMode;
}

export interface ManufacturerRegistry {
  registryId: string;
  manufacturers: ManufacturerRecord[];
  manufacturerCount: number;
  registryReady: boolean;
  mode: BrandIntelligenceMode;
}

export interface BrandContext {
  contextId: string;
  brands: BrandRecord[];
  manufacturers: ManufacturerRecord[];
  aliases: BrandAliasRecord[];
  brandCount: number;
  manufacturerCount: number;
  averageScore: number;
  contextReady: boolean;
  mode: BrandIntelligenceMode;
}

export interface BrandLink {
  linkId: string;
  brandId: string;
  targetType: "manufacturer" | "supplier" | "sku" | "authorization" | "catalog";
  targetId: string;
  linkStatus: LinkStatus;
  mode: BrandIntelligenceMode;
}

export interface SupplierLink {
  linkId: string;
  brandId: string;
  supplierId: string;
  organizationId?: string;
  region: string;
  linkStatus: LinkStatus;
  mode: BrandIntelligenceMode;
}

export interface SkuLink {
  linkId: string;
  brandId: string;
  sku: string;
  productId?: string;
  catalogType?: string;
  industrySector?: IndustrySector;
  equivalentSkuIds?: string[];
  linkStatus: LinkStatus;
  mode: BrandIntelligenceMode;
}

export interface AuthorizationLink {
  linkId: string;
  brandId: string;
  supplierId: string;
  authorizationLevel: AuthorizationLevel;
  authorizationStatus: AuthorizationLinkStatus;
  region: string;
  mode: BrandIntelligenceMode;
}

export interface BrandEvidenceLink {
  linkId: string;
  brandId: string;
  manufacturerId?: string;
  sku?: string;
  evidenceRef: string;
  evidenceKind: BrandEvidenceKind;
  sourceLayer: BrandEvidenceSourceLayer;
  documentRef?: string;
  validUntil?: string;
  linkStatus: LinkStatus;
  evidenceId?: string;
  requirementAnchorId?: string;
  mode: BrandIntelligenceMode;
}

export interface TenderBrandStub {
  stubId: string;
  brandId: string;
  tenderId: string;
  proposalId?: string;
  catalogId?: string;
  matchScore: number;
  stubReady: boolean;
  mode: BrandIntelligenceMode;
}

export interface BrandNetworkContext {
  contextId: string;
  brands: BrandRecord[];
  supplierLinks: SupplierLink[];
  skuLinks: SkuLink[];
  authorizationLinks: AuthorizationLink[];
  brandLinks: BrandLink[];
  linkCount: number;
  networkReady: boolean;
  mode: BrandIntelligenceMode;
}

export interface BrandQuery {
  brandTier?: BrandTier;
  brandStatus?: BrandStatus;
  industrySector?: IndustrySector;
  region?: string;
  minBrandScore?: number;
  limit?: number;
}

export interface BrandQueryResult {
  queryId: string;
  query: BrandQuery;
  brands: BrandRecord[];
  hitCount: number;
  brandReady: boolean;
}

export interface BrandMatchResult {
  matchId: string;
  brandId: string;
  targetType: "supplier" | "sku" | "catalog" | "proposal" | "tender";
  targetId: string;
  matchScore: number;
  matchedLinkIds: string[];
  matchReady: boolean;
  mode: BrandIntelligenceMode;
}

export interface BrandDecisionContext {
  contextId: string;
  tenderId?: string;
  proposalId?: string;
  catalogId?: string;
  candidateBrands: BrandRecord[];
  rankedMatches: BrandMatchResult[];
  evidenceReadiness: number;
  decisionReady: boolean;
  mode: BrandIntelligenceMode;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface BrandIntelligenceNetworkValidation {
  valid: boolean;
  brandRegistry: RegistryValidation;
  manufacturerRegistry: RegistryValidation;
  aliasRegistry: RegistryValidation;
  supplierLinkRegistry: RegistryValidation;
  skuLinkRegistry: RegistryValidation;
  authorizationLinkRegistry: RegistryValidation;
  evidenceLinkRegistry: RegistryValidation;
  tenderStubRegistry: RegistryValidation;
  brandContext: RegistryValidation;
  brandNetworkContext: RegistryValidation;
  brandQuery: RegistryValidation;
  brandMatcher: RegistryValidation;
  brandDecision: RegistryValidation;
  engineCompatibility: RegistryValidation;
}

export const CANONICAL_BRAND_BUYER_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_BRAND_QUERY: BrandQuery = {
  brandTier: "premium",
  limit: 5,
} as const;

export const TOP_BRAND_SCORE_THRESHOLD = 78 as const;

export const BRAND_TIERS: BrandTier[] = [
  "premium",
  "commercial",
  "mid-market",
  "value",
  "domestic",
];

export const BRAND_STATUSES: BrandStatus[] = [
  "draft",
  "active",
  "verified",
  "authorized",
  "matched",
  "restricted",
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

export const BRAND_EVIDENCE_KINDS: BrandEvidenceKind[] = [
  "certificate",
  "datasheet",
  "test-report",
  "authorization",
  "case-study",
  "project-reference",
];
