import { REAL_CATALOG_FOUNDATION_VERSION } from "@/lib/real-catalog-foundation";
import { validateRealCatalogFoundation } from "@/lib/real-catalog-foundation";
import { validateTenderProposalFoundation } from "@/lib/tender-proposal";
import { TENDER_PROPOSAL_VERSION } from "@/lib/tender-proposal";
import { buildCatalogBundle } from "./catalog-bundle";
import {
  buildConstructionCategory,
  buildEquipmentCategory,
  buildFlooringCategory,
  buildServiceCategory,
  buildTrackCategory,
  buildTurfCategory,
} from "./catalog-category";
import { buildCatalogContext, validateCatalogContext } from "./catalog-context";
import {
  buildConstructionCatalog,
  buildEquipmentCatalog,
  buildFlooringCatalog,
  buildServiceCatalog,
  buildTrackCatalog,
  buildTurfCatalog,
} from "./catalog-builder";
import {
  buildCatalogEngineCompatibility,
  MARKETPLACE_LAYER_LABEL,
} from "./catalog-engine-compat";
import { matchCatalogToProposal } from "./catalog-matcher";
import { buildCatalogProduct, getAllCatalogProducts } from "./catalog-product";
import { validateCatalogQueryRegistry } from "./catalog-query";
import { buildCatalogRegistryRecords, validateCatalogRegistry } from "./catalog-registry";
import { buildCatalogScore } from "./catalog-scoring";
import type { ProductCatalogValidation, RegistryValidation } from "./shared/types";

function validateCatalogCategoryRegistry(): RegistryValidation {
  const categories = [
    buildEquipmentCategory(),
    buildFlooringCategory(),
    buildTrackCategory(),
    buildTurfCategory(),
    buildConstructionCategory(),
    buildServiceCategory(),
  ];
  const valid = categories.length === 6 && categories.every((category) => category.categoryReady);

  return {
    valid,
    count: categories.length,
    summary: `catalog-category count=${categories.length} valid=${valid}`,
  };
}

function validateCatalogProductRegistry(): RegistryValidation {
  const products = getAllCatalogProducts();
  const sample = buildCatalogProduct({
    productId: "pc-product-sample",
    sku: "PC-SAMPLE-001",
    catalogType: "equipment",
    industrySector: "gym-equipment",
    productName: "Sample Catalog Product",
    brandName: "AI Fitness Solution",
    unitPrice: 10000,
    leadTimeDays: 14,
  });
  const valid =
    products.length >= 10 &&
    products.every((product) => product.productReady) &&
    sample.productReady;

  return {
    valid,
    count: products.length,
    summary: `catalog-product count=${products.length} valid=${valid}`,
  };
}

function validateCatalogBundleRegistry(): RegistryValidation {
  const catalog = buildCatalogRegistryRecords()[0];
  if (!catalog) {
    return { valid: false, count: 0, summary: "catalog-bundle missing catalog" };
  }
  const bundle = buildCatalogBundle({
    catalogId: catalog.catalogId,
    proposalId: catalog.proposalId,
    catalogType: catalog.catalogType,
    industrySector: catalog.industrySector,
  });
  const valid = bundle.bundleReady && bundle.productCount >= 1;

  return {
    valid,
    count: bundle.productCount,
    summary: `catalog-bundle products=${bundle.productCount} valid=${valid}`,
  };
}

function validateCatalogMatcherRegistry(): RegistryValidation {
  const catalog = buildCatalogRegistryRecords()[0];
  if (!catalog) {
    return { valid: false, count: 0, summary: "catalog-matcher missing catalog" };
  }
  const match = matchCatalogToProposal(catalog);
  const valid = match.matchReady && match.matchScore >= 50;

  return {
    valid,
    count: match.matchedProductIds.length,
    summary: `catalog-matcher score=${match.matchScore} products=${match.matchedProductIds.length} valid=${valid}`,
  };
}

function validateCatalogScoringRegistry(): RegistryValidation {
  const score = buildCatalogScore("pc-catalog-test", {
    coverageScore: 84,
    pricingScore: 82,
    availabilityScore: 79,
    complianceScore: 88,
    matchingScore: 81,
  });
  const valid =
    score.coverageScore > 0 &&
    score.pricingScore > 0 &&
    score.availabilityScore > 0 &&
    score.complianceScore > 0 &&
    score.matchingScore > 0 &&
    score.totalCatalogScore > 0;

  return {
    valid,
    count: 1,
    summary: `catalog-scoring total=${score.totalCatalogScore} valid=${valid}`,
  };
}

function validateEngineCompatibility(): RegistryValidation {
  const compatibility = buildCatalogEngineCompatibility();
  const valid =
    compatibility.realCatalogFoundation === REAL_CATALOG_FOUNDATION_VERSION &&
    compatibility.tenderProposalLayer === TENDER_PROPOSAL_VERSION &&
    compatibility.marketplaceLayer === MARKETPLACE_LAYER_LABEL;

  return {
    valid,
    count: 1,
    summary: `engine-compatibility real=${compatibility.realCatalogFoundation} proposal=${compatibility.tenderProposalLayer} valid=${valid}`,
  };
}

function validateCatalogBuilderRegistry(): RegistryValidation {
  const built = [
    buildEquipmentCatalog(),
    buildFlooringCatalog(),
    buildTrackCatalog(),
    buildTurfCatalog(),
    buildConstructionCatalog(),
    buildServiceCatalog(),
  ];
  const valid = built.length === 6 && built.every((catalog) => catalog.catalogId.length > 0);

  return {
    valid,
    count: built.length,
    summary: `catalog-builder count=${built.length} valid=${valid}`,
  };
}

export function validateProductCatalogFoundation(): ProductCatalogValidation {
  const catalogRegistry = validateCatalogRegistry();
  const catalogContext = validateCatalogContext();
  const catalogCategory = validateCatalogCategoryRegistry();
  const catalogProduct = validateCatalogProductRegistry();
  const catalogBundle = validateCatalogBundleRegistry();
  const catalogMatcher = validateCatalogMatcherRegistry();
  const catalogScoring = validateCatalogScoringRegistry();
  const catalogQuery = validateCatalogQueryRegistry();
  const engineCompatibility = validateEngineCompatibility();
  const catalogBuilder = validateCatalogBuilderRegistry();

  const tenderProposal = validateTenderProposalFoundation();
  const realCatalog = validateRealCatalogFoundation();

  return {
    valid:
      catalogRegistry.valid &&
      catalogContext.valid &&
      catalogCategory.valid &&
      catalogProduct.valid &&
      catalogBundle.valid &&
      catalogMatcher.valid &&
      catalogScoring.valid &&
      catalogQuery.valid &&
      engineCompatibility.valid &&
      catalogBuilder.valid &&
      tenderProposal.valid &&
      realCatalog.valid,
    catalogRegistry,
    catalogContext,
    catalogCategory,
    catalogProduct,
    catalogBundle,
    catalogMatcher,
    catalogScoring,
    catalogQuery,
    engineCompatibility,
  };
}

export function buildProductCatalogFoundationSnapshot() {
  return {
    context: buildCatalogContext(),
    validation: validateProductCatalogFoundation(),
  };
}
