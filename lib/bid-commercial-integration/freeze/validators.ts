import { buildCommercialProposalPack, validateTenderResponsePackCompatibility } from "../proposal-composer-integration/bridge/proposal-composer-bridge";
import { validateCommercialProposalPack } from "../proposal-composer-integration/validation/validators";
import type { CommercialProposalFreezeValidation } from "../shared/types";
import {
  validateBidCommercialBundle,
  validateCommercialProposalSections,
} from "../validation/validators";
import { buildBidCommercialBundle } from "../bridge/commercial-bid-bridge";
import { CANONICAL_COMMERCIAL_PROPOSAL_QUERY } from "./constants";

export function validateCommercialProposalFreeze(): CommercialProposalFreezeValidation {
  const bundleValidation = validateBidCommercialBundle(CANONICAL_COMMERCIAL_PROPOSAL_QUERY);
  const bundle = buildBidCommercialBundle(CANONICAL_COMMERCIAL_PROPOSAL_QUERY);
  const sectionsValidation = validateCommercialProposalSections(bundle);
  const pack = buildCommercialProposalPack(CANONICAL_COMMERCIAL_PROPOSAL_QUERY);
  const packValidation = validateCommercialProposalPack(pack);
  const tenderCompatibility = validateTenderResponsePackCompatibility(pack);

  const gates = [
    bundleValidation.catalogExists,
    bundleValidation.supplierExists,
    bundleValidation.inventoryExists,
    bundleValidation.serviceExists,
    bundleValidation.pricingExists,
    bundleValidation.leadTimeExists,
    bundleValidation.valid,
    sectionsValidation.equipmentSectionExists,
    sectionsValidation.supplyChainSectionExists,
    sectionsValidation.procurementSectionExists,
    sectionsValidation.deliverySectionExists,
    sectionsValidation.valid,
    packValidation.equipmentSectionExists,
    packValidation.supplyChainSectionExists,
    packValidation.procurementSectionExists,
    packValidation.deliverySectionExists,
    packValidation.valid,
    tenderCompatibility.equipmentAttachmentCompatible,
    tenderCompatibility.commercialAttachmentCompatible,
    tenderCompatibility.deliveryScheduleCompatible,
    tenderCompatibility.supplyChainCompatible,
    tenderCompatibility.compatible,
  ];

  const validationScore = Math.round((gates.filter(Boolean).length / gates.length) * 100);

  const valid =
    bundleValidation.valid &&
    sectionsValidation.valid &&
    packValidation.valid &&
    tenderCompatibility.compatible;

  return {
    valid,
    bundleValid: bundleValidation.valid,
    sectionsValid: sectionsValidation.valid,
    packValid: packValidation.valid,
    tenderCompatible: tenderCompatibility.compatible,
    validationScore,
  };
}
