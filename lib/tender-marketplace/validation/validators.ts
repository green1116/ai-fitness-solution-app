import { validateBidCommercialBundle } from "@/lib/bid-commercial-integration/validation/validators";
import { CANONICAL_COMMERCIAL_PROPOSAL_QUERY } from "@/lib/bid-commercial-integration/freeze/constants";
import { getV20BrandEntries, getV21SupplierEntries } from "@/lib/data-asset-loader";
import { getAllChannelPricing } from "@/lib/procurement-intelligence/channel-pricing";
import { validateProposalIntelligence } from "@/lib/proposal-intelligence/validation/validators";
import { CANONICAL_PROPOSAL_INTELLIGENCE_QUERY } from "@/lib/proposal-intelligence/shared/types";
import { getAllSuppliers } from "@/lib/regional-supplier-foundation/supplier-catalog";
import { getAllHistoricalTenders } from "@/lib/tender-knowledge/project-archive";
import { getAllEvaluationProfiles } from "../evaluation-profile";
import { getAllOpportunityProfiles } from "../opportunity-profile";
import { getAllRequirementProfiles } from "../requirement-profile";
import { getAllTenderProfiles } from "../tender-profile";
import type { TenderMarketplaceValidation } from "../shared/types";
import { CANONICAL_TENDER_MARKETPLACE_QUERY } from "../shared/types";

function validateV20CatalogCompatibility(): boolean {
  const v20BrandIds = new Set(getV20BrandEntries().map((brand) => brand.brandId));
  const opportunities = getAllOpportunityProfiles();
  return opportunities.every((opportunity) =>
    opportunity.targetBrands.every((brandId) => v20BrandIds.has(brandId)),
  );
}

function validateV21SupplierCompatibility(): boolean {
  const v21Suppliers = getAllSuppliers();
  const dataSupplierIds = new Set(getV21SupplierEntries().map((supplier) => supplier.id));
  const targetSupplierIds = new Set(
    getAllOpportunityProfiles().flatMap((opportunity) => opportunity.targetSuppliers),
  );
  return (
    v21Suppliers.every((supplier) => targetSupplierIds.has(supplier.id)) &&
    [...targetSupplierIds].every((supplierId) => dataSupplierIds.has(supplierId))
  );
}

function validateV22ProcurementCompatibility(): boolean {
  const v22Skus = [...new Set(getAllChannelPricing().map((entry) => entry.sku))];
  const requirements = getAllRequirementProfiles();
  return v22Skus.every((sku) =>
    requirements.some((requirement) => requirement.technicalRequirement.includes(sku)),
  );
}

function validateV23ProposalCompatibility(): boolean {
  const canonicalTender = getAllTenderProfiles().find(
    (tender) => tender.tenderId === CANONICAL_TENDER_MARKETPLACE_QUERY.tenderId,
  );
  if (!canonicalTender) return false;

  const bundleValidation = validateBidCommercialBundle({
    sku: CANONICAL_COMMERCIAL_PROPOSAL_QUERY.sku,
    city: canonicalTender.city,
    quantity: 10,
    projectType: canonicalTender.industry,
  });
  return bundleValidation.valid;
}

function validateV24IntelligenceCompatibility(): boolean {
  const validation = validateProposalIntelligence(CANONICAL_PROPOSAL_INTELLIGENCE_QUERY);
  return validation.valid;
}

function validateV25KnowledgeCompatibility(): boolean {
  const knowledgeTenders = getAllHistoricalTenders();
  const marketplaceIds = new Set(getAllTenderProfiles().map((tender) => tender.tenderId));
  return knowledgeTenders.every((tender) => marketplaceIds.has(tender.tenderId));
}

export function validateTenderMarketplace(): TenderMarketplaceValidation {
  const tenders = getAllTenderProfiles();
  const requirements = getAllRequirementProfiles();
  const evaluations = getAllEvaluationProfiles();
  const opportunities = getAllOpportunityProfiles();
  const tenderIds = new Set(tenders.map((tender) => tender.tenderId));
  const canonicalTender = tenders.find(
    (tender) => tender.tenderId === CANONICAL_TENDER_MARKETPLACE_QUERY.tenderId,
  );

  const tenderExists =
    tenders.length >= 5 &&
    tenders.every(
      (tender) =>
        tender.tenderId.length > 0 &&
        tender.title.length > 0 &&
        tender.budget > 0 &&
        tender.mode === "tender-marketplace",
    ) &&
    canonicalTender !== undefined;

  const requirementsExist =
    requirements.length >= 10 &&
    requirements.every(
      (requirement) =>
        tenderIds.has(requirement.tenderId) &&
        requirement.equipmentCategory.length > 0 &&
        requirement.quantity > 0 &&
        requirement.mode === "tender-marketplace",
    );

  const evaluationExists =
    evaluations.length >= 5 &&
    evaluations.every(
      (evaluation) =>
        tenderIds.has(evaluation.tenderId) &&
        evaluation.priceWeight +
          evaluation.technicalWeight +
          evaluation.serviceWeight +
          evaluation.deliveryWeight +
          evaluation.brandWeight ===
          100 &&
        evaluation.mode === "tender-marketplace",
    );

  const opportunityExists =
    opportunities.length >= 5 &&
    opportunities.every(
      (opportunity) =>
        tenderIds.has(opportunity.tenderId) &&
        opportunity.estimatedValue > 0 &&
        opportunity.targetBrands.length > 0 &&
        opportunity.targetSuppliers.length > 0 &&
        opportunity.mode === "tender-marketplace",
    );

  const v20CatalogCompatible = validateV20CatalogCompatibility();
  const v21SupplierCompatible = validateV21SupplierCompatibility();
  const v22ProcurementCompatible = validateV22ProcurementCompatibility();
  const v23ProposalCompatible = validateV23ProposalCompatibility();
  const v24IntelligenceCompatible = validateV24IntelligenceCompatibility();
  const v25KnowledgeCompatible = validateV25KnowledgeCompatibility();

  return {
    valid:
      tenderExists &&
      requirementsExist &&
      evaluationExists &&
      opportunityExists &&
      v20CatalogCompatible &&
      v21SupplierCompatible &&
      v22ProcurementCompatible &&
      v23ProposalCompatible &&
      v24IntelligenceCompatible &&
      v25KnowledgeCompatible,
    tenderExists,
    requirementsExist,
    evaluationExists,
    opportunityExists,
    v20CatalogCompatible,
    v21SupplierCompatible,
    v22ProcurementCompatible,
    v23ProposalCompatible,
    v24IntelligenceCompatible,
    v25KnowledgeCompatible,
  };
}
