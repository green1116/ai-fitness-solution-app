import { findEvidenceByBrand } from "@/lib/evidence-intelligence-network";
import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { buildBidStrategyContext } from "@/lib/tender-knowledge-graph";
import { buildEquivalentGraphContext } from "../equivalent-graph/equivalent-graph-context";
import { buildProductSpecContext } from "../product-foundation/product-spec-context";
import { findProductById } from "../product-foundation/product-registry";
import type { ProductRecord } from "../product-foundation/product-spec-types";
import { CANONICAL_EQUIVALENT_TENDER_ID, EPI_CANONICAL_ID } from "../shared/constants";
import type { SubstitutionContext } from "./substitution-types";

export function resolveProductWithSpecifications(productId: string): ProductRecord | undefined {
  return (
    buildProductSpecContext().products.find((product) => product.id === productId) ??
    findProductById(productId)
  );
}

let cachedContext: SubstitutionContext | undefined;

export function buildSubstitutionContext(): SubstitutionContext {
  if (cachedContext) return cachedContext;

  const productSpecContext = buildProductSpecContext();
  const equivalentContext = buildEquivalentGraphContext();
  const requirements = buildRequirementRegistryRecords();
  const evidenceBrandIds = new Set(
    productSpecContext.products
      .map((product) => product.brandId)
      .filter((brandId): brandId is string => Boolean(brandId)),
  );

  let evidenceBrandCount = 0;
  for (const brandId of evidenceBrandIds) {
    const evidence = findEvidenceByBrand(brandId);
    if (evidence.length > 0) evidenceBrandCount += 1;
  }

  const tenderContext = buildBidStrategyContext(CANONICAL_EQUIVALENT_TENDER_ID);

  cachedContext = {
    contextId: "epi-substitution-context-v42-p3",
    productCount: productSpecContext.products.length,
    specificationCount: productSpecContext.specifications.length,
    equivalentEdgeCount: equivalentContext.equivalentEdges.length,
    requirementCount: requirements.length,
    evidenceBrandCount,
    tenderContextReady: tenderContext.contextReady,
    contextReady:
      productSpecContext.contextReady &&
      equivalentContext.contextReady &&
      equivalentContext.equivalentEdges.length > 0,
    mode: EPI_CANONICAL_ID,
  };

  return cachedContext;
}
