import { runBidderProfileRuntime } from "../bidder-profile/runtime";
import { runBrandLibraryRuntime } from "../brand-library/runtime";
import { runEquipmentCatalogRuntime } from "../equipment-catalog/runtime";
import { runProposalPersonalizationRuntime } from "../proposal-personalization/runtime";
import { runSupplierCapabilityRuntime } from "../supplier-capability/runtime";

export function buildBidderDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  bidderReadiness: number;
  brandReadiness: number;
  catalogReadiness: number;
  proposalDifferentiationReadiness: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "bidder-dashboard-default";

  const profile = runBidderProfileRuntime({ deploymentId });
  const brands = runBrandLibraryRuntime({ deploymentId });
  const catalog = runEquipmentCatalogRuntime({ deploymentId });
  const supplier = runSupplierCapabilityRuntime({ deploymentId });
  const personalization = runProposalPersonalizationRuntime({ deploymentId });

  const bidderReadiness = Math.round(
    (profile.payload.profileReadiness + supplier.payload.supplierReadiness) / 2,
  );
  const brandReadiness = brands.payload.brandReadiness;
  const catalogReadiness = catalog.payload.catalogReadiness;
  const proposalDifferentiationReadiness = personalization.payload.differentiationReadiness;

  return {
    bidderReadiness,
    brandReadiness,
    catalogReadiness,
    proposalDifferentiationReadiness,
    summary: `bidder-dashboard bidder=${bidderReadiness}% brand=${brandReadiness}% catalog=${catalogReadiness}% differentiation=${proposalDifferentiationReadiness}%`,
  };
}
