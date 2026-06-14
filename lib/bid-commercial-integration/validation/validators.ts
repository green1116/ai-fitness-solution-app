import { buildBidCommercialBundle } from "../bridge/commercial-bid-bridge";
import { buildCommercialProposalSections } from "../proposal-sections/builders";
import { PROPOSAL_SECTION_IDS } from "../proposal-sections/types";
import type {
  BidCommercialBundle,
  BidCommercialBundleValidation,
  CommercialProposalSectionsValidation,
  ProjectType,
} from "../shared/types";

export function validateBidCommercialBundle(input: {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
}): BidCommercialBundleValidation {
  const bundle = buildBidCommercialBundle(input);

  const catalogExists = bundle.catalog !== null;
  const supplierExists = bundle.supplierNetwork.supplier.length > 0;
  const inventoryExists = bundle.supplierNetwork.inventory.length > 0;
  const serviceExists = bundle.supplierNetwork.service.length > 0;
  const pricingExists =
    bundle.catalog?.pricing !== undefined && bundle.procurement.finalPrice > 0;
  const leadTimeExists = bundle.leadTime !== undefined;

  const valid =
    catalogExists &&
    supplierExists &&
    inventoryExists &&
    serviceExists &&
    pricingExists &&
    leadTimeExists &&
    bundle.readinessScore > 0;

  return {
    valid,
    catalogExists,
    supplierExists,
    inventoryExists,
    serviceExists,
    pricingExists,
    leadTimeExists,
  };
}

function sectionExists(
  sections: ReturnType<typeof buildCommercialProposalSections>,
  id: (typeof PROPOSAL_SECTION_IDS)[number],
): boolean {
  const section = sections.find((s) => s.id === id);
  return section !== undefined && section.content.length > 0 && section.readinessScore > 0;
}

export function validateCommercialProposalSections(
  bundle: BidCommercialBundle,
): CommercialProposalSectionsValidation {
  const sections = buildCommercialProposalSections(bundle);

  const equipmentSectionExists = sectionExists(sections, "equipment-section");
  const supplyChainSectionExists = sectionExists(sections, "supply-chain-section");
  const procurementSectionExists = sectionExists(sections, "procurement-section");
  const deliverySectionExists = sectionExists(sections, "delivery-section");

  const valid =
    equipmentSectionExists &&
    supplyChainSectionExists &&
    procurementSectionExists &&
    deliverySectionExists;

  return {
    valid,
    equipmentSectionExists,
    supplyChainSectionExists,
    procurementSectionExists,
    deliverySectionExists,
  };
}

export function validateCommercialProposalSectionsFromInput(input: {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
}): CommercialProposalSectionsValidation {
  const bundle = buildBidCommercialBundle(input);
  return validateCommercialProposalSections(bundle);
}
