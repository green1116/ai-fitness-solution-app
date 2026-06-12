import { buildComplianceStatus } from "@/lib/proposal-generation/compliance-matrix/builders";
import { buildRiskRegister } from "@/lib/proposal-generation/risk-analysis/builders";
import { buildPackagingContext } from "../bridge/packaging-bridge";
import { buildBudgetJustificationProfile } from "../budget-justification/builders";
import { buildMaintenanceNarrative } from "../maintenance-narrative/builders";
import { buildROINarrative } from "../roi-narrative/builders";
import { buildTCOProfile } from "../tco-runtime/builders";
import { PACKAGING_BIDDER_BRANDS, type PackagingBidderBrand } from "../shared/types";
import type { ProposalDeliveryPackage } from "./types";

export function buildProposalDeliveryPackage(input: {
  deploymentId: string;
  bidderBrand: PackagingBidderBrand;
}): ProposalDeliveryPackage {
  const { deploymentId, bidderBrand } = input;
  const ctx = buildPackagingContext({ deploymentId, bidderBrand });
  const variant = ctx.proposalVariant;
  const budgetJustification = buildBudgetJustificationProfile({ deploymentId, bidderBrand });
  const maintenanceNarrative = buildMaintenanceNarrative({ deploymentId, bidderBrand });
  const roiNarrative = buildROINarrative({ deploymentId, bidderBrand });
  const tcoNarrative = buildTCOProfile({ deploymentId, bidderBrand });

  const risks = buildRiskRegister({ deploymentId });
  const compliance = buildComplianceStatus({ deploymentId });

  const riskAnalysis = risks
    .map((r) => `[${r.severity}] ${r.title} — ${r.category}, owner: ${r.owner}`)
    .join("; ");

  const complianceMatrix = compliance
    .map((c) => `${c.category}: ${c.compliantCount}/${c.totalRequirements} compliant (${c.coverageRate}%)`)
    .join("; ");

  const sectionChecks = [
    variant.executive.executiveSummary.length > 50,
    variant.technical.technicalScope.length > 30,
    variant.equipmentPlan.equipmentPlan.length > 20,
    variant.budgetNarrative.budgetLogic.length > 30,
    budgetJustification.costJustification.length > 80,
    maintenanceNarrative.serviceCoverage.length > 40,
    roiNarrative.investmentLogic.length > 80,
    tcoNarrative.totalTCO > 0,
    riskAnalysis.length > 30,
    complianceMatrix.length > 20,
  ];
  const deliveryPackageReadiness = Math.round(
    (sectionChecks.filter(Boolean).length / sectionChecks.length) * 100,
  );

  return {
    packageId: `delivery-package-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    bidderBrand,
    executiveSummary: variant.executive.executiveSummary,
    technicalProposal: variant.technical.technicalScope,
    equipmentPlan: variant.equipmentPlan.equipmentPlan,
    budgetNarrative: variant.budgetNarrative.budgetLogic,
    budgetJustification,
    maintenanceNarrative,
    roiNarrative,
    tcoNarrative,
    riskAnalysis,
    complianceMatrix,
    deliveryPackageReadiness,
  };
}

export function buildAllProposalDeliveryPackages(input?: { deploymentId?: string }): {
  packages: ProposalDeliveryPackage[];
} {
  const deploymentId = input?.deploymentId ?? "proposal-delivery-package-default";
  return {
    packages: PACKAGING_BIDDER_BRANDS.map((brand) =>
      buildProposalDeliveryPackage({ deploymentId, bidderBrand: brand }),
    ),
  };
}
