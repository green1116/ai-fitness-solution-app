import { EPI_CANONICAL_ID, type EquivalentProductIntelligenceMode } from "../shared/constants";

export type ProductRecordSource = "catalog" | "real-catalog";

export interface ProductRecord {
  id: string;
  skuId: string;
  brandId?: string;
  name: string;
  category: string;
  source: ProductRecordSource;
  specifications: string[];
  mode: EquivalentProductIntelligenceMode;
}

export type SpecificationRecordSource = "requirement" | "equipment-intelligence";

export interface SpecificationRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  source: SpecificationRecordSource;
  mode: EquivalentProductIntelligenceMode;
}

export interface RequirementSpecificationEdge {
  edgeId: string;
  requirementId: string;
  specificationId: string;
  confidence: number;
  mode: EquivalentProductIntelligenceMode;
}

export interface ProductRegistry {
  registryId: string;
  products: ProductRecord[];
  mode: EquivalentProductIntelligenceMode;
}

export interface SpecificationRegistry {
  registryId: string;
  specifications: SpecificationRecord[];
  mode: EquivalentProductIntelligenceMode;
}

export interface ProductSpecContext {
  contextId: string;
  products: ProductRecord[];
  specifications: SpecificationRecord[];
  edges: RequirementSpecificationEdge[];
  contextReady: boolean;
  mode: EquivalentProductIntelligenceMode;
}

export interface ProductSpecValidation {
  valid: boolean;
  productCount: number;
  specificationCount: number;
  edgeCount: number;
  linkedProductCount: number;
  summary: string;
}
