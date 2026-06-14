import { buildBidCommercialBundle } from "../bridge/commercial-bid-bridge";
import { buildCommercialProposalSections } from "../proposal-sections/builders";
import type { BidCommercialReport, CommercialProposalReadinessReport } from "../shared/types";
import { BID_COMMERCIAL_INTEGRATION_VERSION } from "../shared/types";
import {
  validateBidCommercialBundle,
  validateCommercialProposalSections,
} from "../validation/validators";

const EXAMPLE_BID_COMMERCIAL_QUERY = {
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym" as const,
};

export function buildBidCommercialReport(): BidCommercialReport {
  const bundleValidation = validateBidCommercialBundle(EXAMPLE_BID_COMMERCIAL_QUERY);
  const exampleBundle = bundleValidation.valid
    ? buildBidCommercialBundle(EXAMPLE_BID_COMMERCIAL_QUERY)
    : null;

  const catalogReadiness = exampleBundle?.catalog !== null ? 100 : 0;
  const supplierReadiness = exampleBundle?.supplierNetwork.bundleReadiness ?? 0;
  const procurementReadiness = exampleBundle?.procurement.bundleReadiness ?? 0;
  const overallReadiness = exampleBundle?.readinessScore ?? 0;

  return {
    version: BID_COMMERCIAL_INTEGRATION_VERSION,
    reportId: `bid-commercial-report-${Date.now()}`,
    bundleValidation,
    exampleBundle,
    catalogReadiness,
    supplierReadiness,
    procurementReadiness,
    overallReadiness,
    summary: [
      "bid-commercial-report",
      `valid=${bundleValidation.valid}`,
      `catalogReadiness=${catalogReadiness}`,
      `supplierReadiness=${supplierReadiness}`,
      `procurementReadiness=${procurementReadiness}`,
      `overallReadiness=${overallReadiness}`,
      exampleBundle
        ? `finalPrice=${exampleBundle.finalPrice} savings=${exampleBundle.savings}`
        : "example=null",
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}

export function buildCommercialProposalReadinessReport(): CommercialProposalReadinessReport {
  const bundleValidation = validateBidCommercialBundle(EXAMPLE_BID_COMMERCIAL_QUERY);
  const exampleBundle = bundleValidation.valid
    ? buildBidCommercialBundle(EXAMPLE_BID_COMMERCIAL_QUERY)
    : null;

  const exampleSections = exampleBundle
    ? buildCommercialProposalSections(exampleBundle)
    : [];

  const sectionsValidation = exampleBundle
    ? validateCommercialProposalSections(exampleBundle)
    : {
        valid: false,
        equipmentSectionExists: false,
        supplyChainSectionExists: false,
        procurementSectionExists: false,
        deliverySectionExists: false,
      };

  const equipmentReadiness =
    exampleSections.find((s) => s.id === "equipment-section")?.readinessScore ?? 0;
  const supplyChainReadiness =
    exampleSections.find((s) => s.id === "supply-chain-section")?.readinessScore ?? 0;
  const procurementReadiness =
    exampleSections.find((s) => s.id === "procurement-section")?.readinessScore ?? 0;
  const deliveryReadiness =
    exampleSections.find((s) => s.id === "delivery-section")?.readinessScore ?? 0;
  const overallProposalReadiness = exampleSections.length
    ? Math.round(
        exampleSections.reduce((sum, s) => sum + s.readinessScore, 0) /
          exampleSections.length,
      )
    : 0;

  return {
    version: BID_COMMERCIAL_INTEGRATION_VERSION,
    reportId: `commercial-proposal-readiness-report-${Date.now()}`,
    bundleValidation,
    sectionsValidation,
    exampleSections,
    equipmentReadiness,
    supplyChainReadiness,
    procurementReadiness,
    deliveryReadiness,
    overallProposalReadiness,
    summary: [
      "commercial-proposal-readiness-report",
      `valid=${sectionsValidation.valid}`,
      `equipmentReadiness=${equipmentReadiness}`,
      `supplyChainReadiness=${supplyChainReadiness}`,
      `procurementReadiness=${procurementReadiness}`,
      `deliveryReadiness=${deliveryReadiness}`,
      `overallProposalReadiness=${overallProposalReadiness}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
