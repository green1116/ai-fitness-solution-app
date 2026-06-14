import { REAL_CATALOG_FOUNDATION_VERSION, validateRealCatalogFoundation } from "@/lib/real-catalog-foundation";
import { validateProductCatalogFoundation } from "@/lib/product-catalog";
import { validateTenderProposalFoundation } from "@/lib/tender-proposal";
import { validateAliasRegistryLayer, validateBrandContext } from "./brand-context";
import {
  validateBrandManufacturerRelations,
  validateBrandRegistry,
} from "./brand-registry";
import { validateBrandDecisionRegistry } from "./brand-decision/decision-context";
import { validateBrandMatcherRegistry } from "./brand-matcher";
import { validateBrandNetworkContext } from "./brand-network-context";
import { validateBrandQueryRegistry } from "./brand-query";
import {
  buildBrandEngineCompatibility,
  SUPPLIER_NETWORK_LAYER_VERSION,
} from "./brand-engine-compat";
import { validateAuthorizationLinkRegistry } from "./brand-mapping/authorization-link-registry";
import { validateBrandLinkRegistry } from "./brand-mapping/brand-link-registry";
import { validateSkuLinkRegistry } from "./brand-mapping/sku-link-registry";
import { validateSupplierLinkRegistry } from "./brand-mapping/supplier-link-registry";
import {
  validateCaseStudyEvidenceBoost,
  validateEvidenceKindStats,
  validateEvidenceLinkRegistry,
} from "./evidence-link/evidence-link-registry";
import { validateManufacturerRegistry } from "./manufacturer-registry";
import {
  validateTenderStubReadyStats,
  validateTenderStubRegistry,
} from "./tender-stub/tender-brand-stub";
import type { BrandIntelligenceNetworkValidation, RegistryValidation } from "./shared/types";
import { BRAND_INTELLIGENCE_NETWORK_TAG, BRAND_INTELLIGENCE_NETWORK_VERSION } from "./shared/types";

function validateEngineCompatibility(): RegistryValidation {
  const compatibility = buildBrandEngineCompatibility();
  const valid =
    compatibility.realCatalogFoundation === REAL_CATALOG_FOUNDATION_VERSION &&
    compatibility.supplierNetworkLayer === SUPPLIER_NETWORK_LAYER_VERSION &&
    compatibility.evidenceIntelligenceLayer.length > 0;

  return {
    valid,
    count: 1,
    summary: `engine-compatibility supplier=${compatibility.supplierNetworkLayer} evidence=${compatibility.evidenceIntelligenceLayer} valid=${valid}`,
  };
}

export function validateBrandIntelligenceNetworkPhase1(): BrandIntelligenceNetworkValidation {
  const brandRegistry = validateBrandRegistry();
  const manufacturerRegistry = validateManufacturerRegistry();
  const aliasRegistry = validateAliasRegistryLayer();
  const brandContext = validateBrandContext();
  const engineCompatibility = validateEngineCompatibility();
  const brandManufacturer = validateBrandManufacturerRelations();

  const tenderProposal = validateTenderProposalFoundation();
  const realCatalog = validateRealCatalogFoundation();

  return {
    valid:
      brandRegistry.valid &&
      manufacturerRegistry.valid &&
      aliasRegistry.valid &&
      brandContext.valid &&
      brandManufacturer.valid &&
      engineCompatibility.valid &&
      tenderProposal.valid &&
      realCatalog.valid,
    brandRegistry,
    manufacturerRegistry,
    aliasRegistry,
    supplierLinkRegistry: { valid: true, count: 0, summary: "phase1-skip" },
    skuLinkRegistry: { valid: true, count: 0, summary: "phase1-skip" },
    authorizationLinkRegistry: { valid: true, count: 0, summary: "phase1-skip" },
    evidenceLinkRegistry: { valid: true, count: 0, summary: "phase1-skip" },
    tenderStubRegistry: { valid: true, count: 0, summary: "phase1-skip" },
    brandContext,
    brandNetworkContext: { valid: true, count: 0, summary: "phase1-skip" },
    brandQuery: { valid: true, count: 0, summary: "phase1-skip" },
    brandMatcher: { valid: true, count: 0, summary: "phase1-skip" },
    brandDecision: { valid: true, count: 0, summary: "phase1-skip" },
    engineCompatibility,
  };
}

export function validateBrandIntelligenceNetworkPhase2(): BrandIntelligenceNetworkValidation {
  const phase1 = validateBrandIntelligenceNetworkPhase1();
  const supplierLinkRegistry = validateSupplierLinkRegistry();
  const skuLinkRegistry = validateSkuLinkRegistry();
  const authorizationLinkRegistry = validateAuthorizationLinkRegistry();
  const brandNetworkContext = validateBrandNetworkContext();
  validateBrandLinkRegistry();

  const productCatalog = validateProductCatalogFoundation();

  return {
    ...phase1,
    valid:
      phase1.valid &&
      supplierLinkRegistry.valid &&
      skuLinkRegistry.valid &&
      authorizationLinkRegistry.valid &&
      brandNetworkContext.valid &&
      productCatalog.valid,
    supplierLinkRegistry,
    skuLinkRegistry,
    authorizationLinkRegistry,
    brandNetworkContext,
  };
}

export function validateBrandIntelligenceNetworkPhase3(): BrandIntelligenceNetworkValidation {
  const phase2 = validateBrandIntelligenceNetworkPhase2();
  const evidenceLinkRegistry = validateEvidenceLinkRegistry();
  const tenderStubRegistry = validateTenderStubRegistry();
  validateEvidenceKindStats();
  validateCaseStudyEvidenceBoost();
  validateTenderStubReadyStats();

  return {
    ...phase2,
    valid: phase2.valid && evidenceLinkRegistry.valid && tenderStubRegistry.valid,
    evidenceLinkRegistry,
    tenderStubRegistry,
  };
}

export function validateBrandIntelligenceNetworkFoundation(): BrandIntelligenceNetworkValidation {
  const phase3 = validateBrandIntelligenceNetworkPhase3();
  const brandQuery = validateBrandQueryRegistry();
  const brandMatcher = validateBrandMatcherRegistry();
  const brandDecision = validateBrandDecisionRegistry();

  return {
    ...phase3,
    valid: phase3.valid && brandQuery.valid && brandMatcher.valid && brandDecision.valid,
    brandQuery,
    brandMatcher,
    brandDecision,
  };
}

export function getBrandIntelligenceNetworkFreezeMeta() {
  return {
    version: BRAND_INTELLIGENCE_NETWORK_VERSION,
    tag: BRAND_INTELLIGENCE_NETWORK_TAG,
  };
}
