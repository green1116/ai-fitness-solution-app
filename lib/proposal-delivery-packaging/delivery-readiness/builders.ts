import { buildPackagingContext } from "../bridge/packaging-bridge";
import { buildBudgetJustificationProfile } from "../budget-justification/builders";
import { buildProposalDeliveryPackage } from "../proposal-delivery-package/builders";
import { buildROINarrative } from "../roi-narrative/builders";
import { buildTCOProfile } from "../tco-runtime/builders";
import { PACKAGING_BIDDER_BRANDS, type PackagingBidderBrand } from "../shared/types";
import type { DeliveryReadinessAssessment } from "./types";

export function buildDeliveryReadinessAssessment(input: {
  deploymentId: string;
  bidderBrand: PackagingBidderBrand;
}): DeliveryReadinessAssessment {
  const { deploymentId, bidderBrand } = input;
  const ctx = buildPackagingContext({ deploymentId, bidderBrand });
  const pkg = buildProposalDeliveryPackage({ deploymentId, bidderBrand });
  const budgetJust = buildBudgetJustificationProfile({ deploymentId, bidderBrand });
  const roi = buildROINarrative({ deploymentId, bidderBrand });
  const tco = buildTCOProfile({ deploymentId, bidderBrand });

  const completeness = pkg.deliveryPackageReadiness;

  const explainabilityChecks = [
    budgetJust.costJustification.length > 80,
    budgetJust.procurementJustification.length > 60,
    budgetJust.brandPremiumJustification.length > 40,
    roi.investmentLogic.length > 80,
    pkg.maintenanceNarrative.serviceCoverage.length > 40,
    tco.totalTCO > ctx.totalBudgetMin,
  ];
  const explainability = Math.round(
    (explainabilityChecks.filter(Boolean).length / explainabilityChecks.length) * 100,
  );

  const budgetAlignment = budgetJust.budgetAlignmentScore;
  const equipmentAlignment = Math.min(
    100,
    Math.round(ctx.equipmentStrategyScore * 0.6 + (pkg.equipmentPlan.includes(ctx.packageLabel) ? 40 : 0)),
  );
  const bidderAlignment = Math.min(
    100,
    Math.round(ctx.brandStrategyScore * 0.5 + ctx.proposalVariant.variantReadiness * 0.5),
  );
  const roiAlignment = roi.roiReadiness;

  const deliveryReadinessScore = Math.round(
    completeness * 0.2 +
      explainability * 0.2 +
      budgetAlignment * 0.2 +
      equipmentAlignment * 0.15 +
      bidderAlignment * 0.1 +
      roiAlignment * 0.15,
  );

  return {
    assessmentId: `delivery-readiness-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    bidderBrand,
    completeness,
    explainability,
    budgetAlignment,
    equipmentAlignment,
    bidderAlignment,
    roiAlignment,
    deliveryReadinessScore: Math.min(100, deliveryReadinessScore),
  };
}

export function buildAllDeliveryReadinessAssessments(input?: { deploymentId?: string }): {
  assessments: DeliveryReadinessAssessment[];
  averageDeliveryReadinessScore: number;
} {
  const deploymentId = input?.deploymentId ?? "delivery-readiness-default";
  const assessments = PACKAGING_BIDDER_BRANDS.map((brand) =>
    buildDeliveryReadinessAssessment({ deploymentId, bidderBrand: brand }),
  );
  const averageDeliveryReadinessScore = Math.round(
    assessments.reduce((s, a) => s + a.deliveryReadinessScore, 0) / assessments.length,
  );
  return { assessments, averageDeliveryReadinessScore };
}
