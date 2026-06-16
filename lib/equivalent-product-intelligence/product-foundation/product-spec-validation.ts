import {
  EPI_MIN_EDGE_COUNT,
  EPI_MIN_PRODUCT_COUNT,
  EPI_MIN_PRODUCT_SPEC_LINK_RATIO,
  EPI_MIN_SPECIFICATION_COUNT,
  EPI_P1_TAG,
  EPI_PHASE,
  EPI_VERSION,
} from "../shared/constants";
import type {
  EquivalentProductIntelligencePhase1FreezeMeta,
  EquivalentProductIntelligencePhase1Validation,
} from "../shared/types";
import { buildProductSpecContext } from "./product-spec-context";
import { buildProductRegistry } from "./product-registry";
import { buildRequirementSpecificationEdges } from "./requirement-spec-edge";
import { buildSpecificationRegistry } from "./specification-registry";
import type { ProductSpecValidation } from "./product-spec-types";

let cachedPhase1Validation: EquivalentProductIntelligencePhase1Validation | undefined;

export function validateProductSpecRegistry(): ProductSpecValidation {
  const products = buildProductRegistry().products;
  const specifications = buildSpecificationRegistry().specifications;
  const edges = buildRequirementSpecificationEdges();
  const context = buildProductSpecContext();
  const linkedProductCount = context.products.filter(
    (product) => product.specifications.length > 0,
  ).length;
  const linkRatio = products.length === 0 ? 0 : linkedProductCount / products.length;

  const valid =
    products.length >= EPI_MIN_PRODUCT_COUNT &&
    specifications.length >= EPI_MIN_SPECIFICATION_COUNT &&
    edges.length >= EPI_MIN_EDGE_COUNT &&
    linkRatio >= EPI_MIN_PRODUCT_SPEC_LINK_RATIO;

  return {
    valid,
    productCount: products.length,
    specificationCount: specifications.length,
    edgeCount: edges.length,
    linkedProductCount,
    summary: `product-spec products=${products.length} specs=${specifications.length} edges=${edges.length} linked=${linkedProductCount} valid=${valid}`,
  };
}

export function validateEquivalentProductIntelligencePhase1(): EquivalentProductIntelligencePhase1Validation {
  if (cachedPhase1Validation) return cachedPhase1Validation;

  const productSpec = validateProductSpecRegistry();
  const result: EquivalentProductIntelligencePhase1Validation = {
    valid: productSpec.valid,
    productSpec,
  };

  cachedPhase1Validation = result;
  return result;
}

export function getEquivalentProductIntelligencePhase1FreezeMeta(): EquivalentProductIntelligencePhase1FreezeMeta {
  const validation = validateEquivalentProductIntelligencePhase1();

  return {
    tag: EPI_P1_TAG,
    version: EPI_VERSION,
    phase: EPI_PHASE,
    valid: validation.valid,
  };
}
