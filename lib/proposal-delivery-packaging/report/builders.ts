import { buildPackagingContext } from "../bridge/packaging-bridge";
import { buildProposalPackagingDashboardMetrics } from "../dashboard/builders";
import { buildLifecycleCostProfile } from "../lifecycle-cost/builders";
import { buildMaintenanceNarrative } from "../maintenance-narrative/builders";
import { buildROINarrative } from "../roi-narrative/builders";
import { buildTCOProfile } from "../tco-runtime/builders";
import { buildAllDeliveryReadinessAssessments } from "../delivery-readiness/builders";
import type { ProposalDeliveryPackagingReport } from "../shared/types";
import { PACKAGING_BIDDER_BRANDS, PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";

export function buildProposalDeliveryPackagingReport(input?: {
  deploymentId?: string;
}): ProposalDeliveryPackagingReport {
  const deploymentId = input?.deploymentId ?? "proposal-delivery-packaging-report-default";
  const dashboard = buildProposalPackagingDashboardMetrics({ deploymentId });
  const delivery = buildAllDeliveryReadinessAssessments({ deploymentId });
  const primaryCtx = buildPackagingContext({ deploymentId, bidderBrand: "Technogym" });

  const lifecycleCostProfiles = PACKAGING_BIDDER_BRANDS.map((brand) => {
    const lc = buildLifecycleCostProfile({ deploymentId, bidderBrand: brand });
    return {
      proposalLabel: lc.proposalLabel,
      bidderBrand: brand,
      acquisitionCost: lc.acquisitionCost,
      maintenanceCost: lc.maintenanceCost,
      replacementCost: lc.replacementCost,
      totalLifecycleCost: lc.totalLifecycleCost,
    };
  });

  const maintenanceNarratives = PACKAGING_BIDDER_BRANDS.map((brand) => {
    const m = buildMaintenanceNarrative({ deploymentId, bidderBrand: brand });
    return {
      proposalLabel: m.proposalLabel,
      bidderBrand: brand,
      serviceCoverage: m.serviceCoverage,
      supportReadiness: m.supportReadiness,
    };
  });

  const roiNarratives = PACKAGING_BIDDER_BRANDS.map((brand) => {
    const r = buildROINarrative({ deploymentId, bidderBrand: brand });
    return {
      proposalLabel: r.proposalLabel,
      bidderBrand: brand,
      investmentLogic: r.investmentLogic,
      businessValue: r.businessValue,
    };
  });

  const tcoProfiles = PACKAGING_BIDDER_BRANDS.map((brand) => {
    const t = buildTCOProfile({ deploymentId, bidderBrand: brand });
    return {
      proposalLabel: t.proposalLabel,
      bidderBrand: brand,
      acquisition: t.acquisition,
      operation: t.operation,
      maintenance: t.maintenance,
      replacement: t.replacement,
      totalTCO: t.totalTCO,
    };
  });

  return {
    version: PROPOSAL_DELIVERY_PACKAGING_VERSION,
    reportId: `proposal-delivery-packaging-report-${deploymentId}`,
    deploymentId,
    tenderId: primaryCtx.tenderId,
    budgetAlignmentScore: dashboard.budgetAlignmentScore,
    deliveryReadinessScore: delivery.averageDeliveryReadinessScore,
    lifecycleCostProfiles,
    maintenanceNarratives,
    roiNarratives,
    tcoProfiles,
    summary: [
      "proposal-delivery-packaging-report",
      `budgetAlignmentScore=${dashboard.budgetAlignmentScore}%`,
      `deliveryReadinessScore=${delivery.averageDeliveryReadinessScore}%`,
      `variants=${PACKAGING_BIDDER_BRANDS.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
