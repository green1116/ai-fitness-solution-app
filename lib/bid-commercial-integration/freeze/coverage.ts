import { getRealCatalogSummary } from "@/lib/real-catalog-foundation";
import { buildRealCatalogBundle } from "@/lib/real-catalog-foundation";
import { getAllChannelPricing } from "@/lib/procurement-intelligence/channel-pricing";
import { getAllDiscountRules } from "@/lib/procurement-intelligence/discount-rules";
import { getAllLeadTimeIntelligence } from "@/lib/procurement-intelligence/lead-time-intelligence";
import { getAllProjectPricing } from "@/lib/procurement-intelligence/project-pricing";
import { getAllCoverage } from "@/lib/regional-supplier-foundation/coverage-catalog";
import { getAllDealers } from "@/lib/regional-supplier-foundation/dealer-catalog";
import { getAllInventory } from "@/lib/regional-supplier-foundation/inventory-catalog";
import { getAllServices } from "@/lib/regional-supplier-foundation/service-catalog";
import { getAllSuppliers } from "@/lib/regional-supplier-foundation/supplier-catalog";
import { buildBidCommercialBundle } from "../bridge/commercial-bid-bridge";
import { buildCommercialProposalSections } from "../proposal-sections/builders";
import { buildCommercialProposalPack } from "../proposal-composer-integration/bridge/proposal-composer-bridge";
import type { CommercialCoverageStats } from "../shared/types";
import { CANONICAL_COMMERCIAL_PROPOSAL_QUERY } from "./constants";

export function buildCommercialCoverageStats(): CommercialCoverageStats {
  const catalogSummary = getRealCatalogSummary();
  const catalogBundle = buildRealCatalogBundle(CANONICAL_COMMERCIAL_PROPOSAL_QUERY.sku);
  const catalogChecks = [
    catalogBundle?.brand !== null && catalogBundle?.brand !== undefined,
    catalogBundle?.equipment !== undefined,
    catalogBundle?.pricing !== undefined,
    catalogBundle?.maintenance !== undefined,
    catalogBundle?.replacement !== undefined,
  ];
  const catalogCoverage = Math.round(
    (catalogChecks.filter(Boolean).length / catalogChecks.length) * 100,
  );

  const bundle = buildBidCommercialBundle(CANONICAL_COMMERCIAL_PROPOSAL_QUERY);
  const supplierCoverage = bundle.supplierNetwork.bundleReadiness;
  const procurementCoverage = bundle.procurement.bundleReadiness;

  const sections = buildCommercialProposalSections(bundle);
  const proposalSectionCoverage = Math.round(
    (sections.filter((s) => s.readinessScore > 0).length / sections.length) * 100,
  );

  const pack = buildCommercialProposalPack(CANONICAL_COMMERCIAL_PROPOSAL_QUERY);
  const packChecks = [
    pack.equipmentSection.readinessScore > 0,
    pack.supplyChainSection.readinessScore > 0,
    pack.procurementSection.readinessScore > 0,
    pack.deliverySection.readinessScore > 0,
    pack.integrationReadiness > 0,
  ];
  const proposalPackCoverage = Math.round(
    (packChecks.filter(Boolean).length / packChecks.length) * 100,
  );

  const commercialCoverageScore = Math.round(
    (catalogCoverage +
      supplierCoverage +
      procurementCoverage +
      proposalSectionCoverage +
      proposalPackCoverage) /
      5,
  );

  return {
    catalogCoverage,
    supplierCoverage,
    procurementCoverage,
    proposalSectionCoverage,
    proposalPackCoverage,
    commercialCoverageScore,
    upstreamCatalog: {
      brandCount: catalogSummary.brandCount,
      equipmentCount: catalogSummary.equipmentCount,
      pricingEntryCount: catalogSummary.pricingCount,
    },
    upstreamSupplier: {
      supplierCount: getAllSuppliers().length,
      dealerCount: getAllDealers().length,
      coverageCount: getAllCoverage().length,
      inventoryCount: getAllInventory().length,
      serviceCount: getAllServices().length,
    },
    upstreamProcurement: {
      channelPricingCount: getAllChannelPricing().length,
      projectPricingCount: getAllProjectPricing().length,
      discountRuleCount: getAllDiscountRules().length,
      leadTimeCount: getAllLeadTimeIntelligence().length,
    },
  };
}
