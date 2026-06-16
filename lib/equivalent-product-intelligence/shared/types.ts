import type { EPI_PHASE, EPI_VERSION } from "./constants";
import type { ProductSpecValidation } from "../product-foundation/product-spec-types";

export interface EquivalentProductEngineCompatibility {
  brandIntelligenceLayer: string;
  evidenceIntelligenceLayer: string;
  requirementIntelligenceLayer: string;
  tenderKnowledgeGraphLayer: string;
  productCatalogLayer: string;
  realCatalogFoundationLayer: string;
}

export interface EquivalentProductIntelligencePhase1Validation {
  valid: boolean;
  productSpec: ProductSpecValidation;
  compatibility?: {
    requirementFoundation: boolean;
  };
}

export interface EquivalentProductIntelligencePhase1FreezeMeta {
  tag: typeof EPI_VERSION;
  version: typeof EPI_VERSION;
  phase: typeof EPI_PHASE;
  valid: boolean;
}
