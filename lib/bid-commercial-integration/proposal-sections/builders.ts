import type { BidCommercialBundle } from "../shared/types";
import { buildDeliverySection } from "./delivery-section/builders";
import { buildEquipmentSection } from "./equipment-section/builders";
import { buildProcurementSection } from "./procurement-section/builders";
import { buildSupplyChainSection } from "./supply-chain-section/builders";
import type { ProposalSection } from "./types";

export function buildCommercialProposalSections(
  bundle: BidCommercialBundle,
): ProposalSection[] {
  return [
    buildEquipmentSection(bundle.catalog),
    buildSupplyChainSection(bundle.supplierNetwork),
    buildProcurementSection(bundle.procurement, bundle.savings),
    buildDeliverySection({
      leadTime: bundle.leadTime,
      service: bundle.supplierNetwork.service,
      inventory: bundle.supplierNetwork.inventory,
    }),
  ];
}
