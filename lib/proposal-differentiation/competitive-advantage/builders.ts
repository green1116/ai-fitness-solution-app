import { buildBidderProfileSnapshot } from "@/lib/bidder-intelligence/bidder-profile/builders";
import { buildSupplierCapabilitySnapshot } from "@/lib/bidder-intelligence/supplier-capability/builders";
import { buildBrandIntelligenceProfiles } from "@/lib/brand-catalog-intelligence/brand-intelligence/builders";
import type { DifferentiationBidderBrand } from "../shared/types";
import type { CompetitiveAdvantageSnapshot } from "./types";

export function buildCompetitiveAdvantageSnapshot(input?: {
  deploymentId?: string;
  bidderBrand?: DifferentiationBidderBrand;
}): CompetitiveAdvantageSnapshot {
  const deploymentId = input?.deploymentId ?? "competitive-advantage-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const brandProfile = buildBrandIntelligenceProfiles({ deploymentId }).find((p) => p.brandName === bidderBrand);
  const bidderProfile = buildBidderProfileSnapshot({ deploymentId });
  const supplier = buildSupplierCapabilitySnapshot({ deploymentId });

  if (!brandProfile) throw new Error(`Brand profile not found: ${bidderBrand}`);

  const matrix = {
    brandAdvantage: [
      ...brandProfile.competitiveAdvantages,
      `${brandProfile.brandTier} tier positioning: ${brandProfile.marketPosition}`,
    ],
    serviceAdvantage: supplier.serviceCoverage.map((s) => `${s.serviceType} — ${s.regions.join("/")}`),
    deliveryAdvantage: [
      ...bidderProfile.deliveryCapabilities.map((d) => `${d.region}: on-time ${Math.round(d.onTimeRate * 100)}%`),
      ...supplier.deliveryCoverage.map((d) => `${d.region}: lead time ${d.avgLeadTimeDays}d`),
    ],
    supportAdvantage: [
      `Support tier: ${supplier.supportCapability.supportTier}`,
      `SLA response: ${supplier.supportCapability.slaResponseHours}h`,
      ...brandProfile.maintenanceCharacteristics,
    ],
  };

  const advantageScore = Math.round(
    (brandProfile.intelligenceScore + bidderProfile.profileReadiness + supplier.supplierReadiness) / 3,
  );

  return {
    snapshotId: `competitive-advantage-${bidderBrand}-${deploymentId}`,
    bidderBrand,
    matrix,
    advantageScore,
  };
}
