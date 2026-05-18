/**
 * V2.3 SKU Intelligence Engine — 类型定义
 */

export type SkuCategory =
  | "treadmill"
  | "elliptical"
  | "bike"
  | "strength"
  | "rack"
  | "free_weight"
  | "functional"
  | "recovery";

export type ProductTier = "low" | "mid" | "high";

export type SkuSpecs = {
  maxSpeedKmH?: number;
  incline?: number;
  maxLoadKg?: number;
  power?: string;
  dimensions?: string;
};

/** V2.4 machine-readable 参数（投标符合性引擎） */
export type SkuParameters = {
  speed?: number;
  incline?: number;
  loadCapacity?: number;
  motorPower?: number;
  warrantyYears?: number;
  leadTimeDays?: number;
};

export type ProductSKU = {
  id: string;
  brand: string;
  model: string;
  category: SkuCategory;
  productTier: ProductTier;
  specs: SkuSpecs;
  parameters: SkuParameters;
  certifications?: string[];
  serviceSupport?: string[];
  warrantyYears?: number;
  leadTimeDays?: number;
  priceBand?: { min?: number; max?: number };
  tenderTags?: string[];
  evidenceFiles?: string[];
};

export type SkuComplianceStatus = "covered" | "partial" | "missing" | "risky";

export type SKURequirementMapping = {
  requirementId: string;
  skuId: string;
  compliance: SkuComplianceStatus;
  matchedFields: string[];
  missingFields?: string[];
  riskNotes?: string[];
};

export type SkuMatchResult = {
  matched: boolean;
  requirementId: string;
  sku?: ProductSKU;
  compliance: SkuComplianceStatus;
  matchedFields: string[];
  missingFields?: string[];
  riskNotes?: string[];
  alternatives?: ProductSKU[];
};

export type SkuScoringInsight = {
  technicalScoreBoost: boolean;
  commercialRisk: "low" | "medium" | "high";
  notes?: string[];
};

export type SKUIntelligenceResult = {
  mappings: SKURequirementMapping[];
  recommendedSkus: ProductSKU[];
  alternativeSkus: ProductSKU[];
  complianceSummary: {
    covered: number;
    partial: number;
    missing: number;
    risky: number;
  };
  scoring: SkuScoringInsight;
  matchResults: SkuMatchResult[];
};

export type SkuMatchContext = {
  budgetTier?: ProductTier;
};
