import { buildBudgetJustificationProfile } from "../budget-justification/builders";
import { buildAllDeliveryReadinessAssessments } from "../delivery-readiness/builders";
import { buildLifecycleCostProfile } from "../lifecycle-cost/builders";
import { buildMaintenanceNarrative } from "../maintenance-narrative/builders";
import { buildROINarrative } from "../roi-narrative/builders";
import { buildTCOProfile } from "../tco-runtime/builders";
import { PACKAGING_BIDDER_BRANDS } from "../shared/types";
import type { ProposalPackagingDashboardMetrics } from "./types";

export function buildProposalPackagingDashboardMetrics(input?: {
  deploymentId?: string;
}): ProposalPackagingDashboardMetrics {
  const deploymentId = input?.deploymentId ?? "proposal-packaging-dashboard-default";

  const budgetScores = PACKAGING_BIDDER_BRANDS.map(
    (brand) => buildBudgetJustificationProfile({ deploymentId, bidderBrand: brand }).budgetAlignmentScore,
  );
  const lifecycleScores = PACKAGING_BIDDER_BRANDS.map(
    (brand) => buildLifecycleCostProfile({ deploymentId, bidderBrand: brand }).lifecycleReadiness,
  );
  const maintenanceScores = PACKAGING_BIDDER_BRANDS.map(
    (brand) => buildMaintenanceNarrative({ deploymentId, bidderBrand: brand }).maintenanceReadiness,
  );
  const roiScores = PACKAGING_BIDDER_BRANDS.map(
    (brand) => buildROINarrative({ deploymentId, bidderBrand: brand }).roiReadiness,
  );
  const tcoScores = PACKAGING_BIDDER_BRANDS.map(
    (brand) => buildTCOProfile({ deploymentId, bidderBrand: brand }).tcoReadiness,
  );

  const delivery = buildAllDeliveryReadinessAssessments({ deploymentId });
  const avg = (scores: number[]) => Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);

  const budgetReadiness = avg(budgetScores);
  const lifecycleReadiness = avg(lifecycleScores);
  const maintenanceReadiness = avg(maintenanceScores);
  const roiReadiness = avg(roiScores);
  const tcoReadiness = avg(tcoScores);
  const deliveryReadiness = delivery.averageDeliveryReadinessScore;

  const budgetAlignmentScore = Math.min(
    100,
    Math.round(
      budgetReadiness * 0.4 +
        tcoReadiness * 0.25 +
        roiReadiness * 0.2 +
        lifecycleReadiness * 0.15,
    ),
  );

  return {
    budgetReadiness,
    lifecycleReadiness,
    maintenanceReadiness,
    roiReadiness,
    tcoReadiness,
    deliveryReadiness,
    budgetAlignmentScore,
    summary: [
      "proposal-packaging-dashboard",
      `budgetAlignmentScore=${budgetAlignmentScore}%`,
      `budget=${budgetReadiness}%`,
      `lifecycle=${lifecycleReadiness}%`,
      `maintenance=${maintenanceReadiness}%`,
      `roi=${roiReadiness}%`,
      `tco=${tcoReadiness}%`,
      `delivery=${deliveryReadiness}%`,
    ].join(" "),
  };
}
