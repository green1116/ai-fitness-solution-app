import { buildPackagingContext } from "../bridge/packaging-bridge";
import { buildLifecycleCostProfile } from "../lifecycle-cost/builders";
import type { PackagingBidderBrand } from "../shared/types";

const ROI_PROFILES: Record<PackagingBidderBrand, { business: string; operational: string; experience: string }> = {
  Technogym: {
    business: "Flagship wellness positioning drives premium membership conversion and corporate brand prestige",
    operational: "Digital ecosystem integration reduces manual operations and enables data-driven facility management",
    experience: "Italian design excellence and immersive training experience elevate employee satisfaction and retention",
  },
  "Life Fitness": {
    business: "Maximum uptime and reliability minimize operational disruption and protect revenue continuity",
    operational: "Standardized maintenance protocols and global parts network reduce unplanned downtime by 40%",
    experience: "Proven ergonomic design and intuitive interfaces ensure high adoption across all fitness levels",
  },
  Matrix: {
    business: "Optimal cost-performance ratio delivers modern fitness amenity within constrained capital budget",
    operational: "Balanced feature set with moderate maintenance overhead — predictable operational costs",
    experience: "Contemporary UX and versatile equipment selection appeals to diverse user demographics",
  },
  Shuhua: {
    business: "Maximum equipment quantity within budget envelope — highest member capacity per yuan invested",
    operational: "Domestic supply chain minimizes logistics cost and enables rapid replacement cycles",
    experience: "Functional fitness coverage with compliance-friendly procurement — accessible to all employees",
  },
};

export function buildROINarrative(input?: {
  deploymentId?: string;
  bidderBrand?: PackagingBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "roi-narrative-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildPackagingContext({ deploymentId, bidderBrand });
  const lifecycle = buildLifecycleCostProfile({ deploymentId, bidderBrand });
  const roi = ROI_PROFILES[bidderBrand];

  const investmentLogic = [
    `Total investment ¥${ctx.totalBudgetMin.toLocaleString()} over ${lifecycle.strategyTier} strategy.`,
    `10-year lifecycle cost ¥${lifecycle.totalLifecycleCost.toLocaleString()} (acquisition + maintenance + replacement).`,
    `Cost per unit: ¥${ctx.budgetPerUnit.toLocaleString()} for ${ctx.equipmentCount} equipment units.`,
    ctx.proposalVariant.budgetNarrative.valueJustification,
  ].join(" ");

  const budgetFormatted = ctx.totalBudgetMin.toLocaleString();
  const hasBudgetRef =
    investmentLogic.includes(budgetFormatted) ||
    investmentLogic.includes(String(ctx.totalBudgetMin));

  const roiReadiness = Math.min(
    100,
    Math.round(
      ctx.budgetStrategyScore * 0.4 +
        (hasBudgetRef ? 30 : 0) +
        (roi.business.length > 40 ? 30 : 0),
    ),
  );

  return {
    narrativeId: `roi-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    bidderBrand,
    investmentLogic,
    businessValue: roi.business,
    operationalValue: roi.operational,
    employeeExperienceValue: roi.experience,
    roiReadiness,
  };
}
