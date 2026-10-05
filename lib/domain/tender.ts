export type BudgetLevel = "low" | "mid" | "high" | "custom";
export type DeliveryMode = "standard" | "enterprise" | "tender";
export type PriceBand = "low" | "mid" | "high";
export type SiteType =
  | "office"
  | "factory"
  | "park"
  | "school"
  | "hospital"
  | "mixed";

export interface ProjectInput {
  name: string;
  clientName?: string;
  industry?: string;
  siteType: SiteType;
  areaM2?: number;
  targetUsers?: number;
  city?: string;
  budgetLevel: BudgetLevel;
  deliveryMode: DeliveryMode;
  notes?: string;
}

export interface ProjectRecord {
  id: string;
  input: ProjectInput;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  name: string;
  purpose: string;
  areaRatio?: number;
  capacity?: number;
  notes?: string;
}

export interface Phase {
  title: string;
  durationDays?: number;
  tasks: string[];
  deliverables: string[];
}

export interface SolutionRecord {
  id: string;
  projectId: string;
  summary: string;
  background: string;
  requirements: string[];
  objectives: string[];
  zoning: Zone[];
  implementationPlan: Phase[];
  operationsPlan: string[];
  riskControl: string[];
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
}

export type PriceFactSourceType = "supplier_quote" | "procurement_contract";

export const PRICE_FACT_SOURCE_LABEL: Record<PriceFactSourceType, string> = {
  supplier_quote: "供应商报价",
  procurement_contract: "采购合同",
};

export type PriceFactTaxStatus = "tax_included" | "tax_excluded";

export const PRICE_FACT_TAX_STATUS_LABEL: Record<PriceFactTaxStatus, string> = {
  tax_included: "含税",
  tax_excluded: "不含税",
};

/** Explicitly supplied, validated unit price for a resolved product. Never derived from catalog data. */
export interface ProductPriceFact {
  unitPrice: number;
  currency: "CNY";
  sourceType: PriceFactSourceType;
  sourceReference: string;
  /** YYYY-MM-DD */
  quotedAt: string;
  /** Procurement metadata only: never affects VERIFIED status, unit price or totals. */
  supplier?: string;
  taxStatus?: PriceFactTaxStatus;
  /** YYYY-MM-DD, >= quotedAt; an expired date keeps the price VERIFIED. */
  validUntil?: string;
}

export type BudgetPriceBasis = "VERIFIED" | "ESTIMATE";

export interface ProductPlaceholder {
  id: string;
  projectId: string;
  category: string;
  subCategory?: string;
  specTags: string[];
  quantity: number;
  priceBand: PriceBand;
  recommendationReason: string;
  replaceable: boolean;
  skuId?: string;
  skuName?: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  priceFact?: ProductPriceFact;
  /** Set only for customer-specified / procurement products; absent with brand/model = reference candidate. */
  productSource?: "customer-specified" | "procurement-product";
  /** Plan PDF facts from a Quote source; absent = suggested quantity / unit price not verified. */
  quantityConfirmed?: boolean;
  priceVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  category: string;
  /** Equipment / subcategory display name when available. */
  name?: string;
  specLevel: string;
  quantity: number;
  unitPriceMin: number;
  unitPriceMax: number;
  subtotalMin: number;
  subtotalMax: number;
  remark?: string;
  sourceType: "placeholder" | "sku";
  priceBasis?: BudgetPriceBasis;
  /** Present only when priceBasis is VERIFIED. */
  priceFact?: ProductPriceFact;
}

export interface BudgetRecord {
  id: string;
  projectId: string;
  currency: "CNY";
  totalEstimateMin: number;
  totalEstimateMax: number;
  items: BudgetItem[];
  assumptions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TenderPackage {
  project: ProjectRecord;
  solution: SolutionRecord;
  placeholders: ProductPlaceholder[];
  budget: BudgetRecord;
}
