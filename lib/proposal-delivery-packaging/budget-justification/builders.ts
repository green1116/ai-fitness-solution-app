import { buildPackagingContext } from "../bridge/packaging-bridge";
import type { PackagingBidderBrand } from "../shared/types";
import { BRAND_STRATEGY_TIER } from "../shared/types";

const PROCUREMENT_NOTES: Record<PackagingBidderBrand, string> = {
  Technogym: "International premium procurement with design certification and extended warranty coverage",
  "Life Fitness": "Global OEM direct procurement with enterprise SLA and standardized maintenance contracts",
  Matrix: "Balanced procurement via authorized distributor with competitive bidding compliance",
  Shuhua: "Domestic procurement aligned with government budget guidelines and local supply chain preference",
};

const PREMIUM_NOTES: Record<PackagingBidderBrand, string> = {
  Technogym: "Brand premium justified by Italian design IP, digital ecosystem, and flagship venue positioning uplift",
  "Life Fitness": "Reliability premium justified by industry-leading uptime, global service network, and lowest downtime TCO",
  Matrix: "Mid-market premium justified by feature density and modern UX without flagship-tier capital expenditure",
  Shuhua: "Value positioning — no brand premium; cost leadership through domestic manufacturing and volume efficiency",
};

export function buildBudgetJustificationProfile(input?: {
  deploymentId?: string;
  bidderBrand?: PackagingBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "budget-justification-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildPackagingContext({ deploymentId, bidderBrand });
  const tier = BRAND_STRATEGY_TIER[bidderBrand];

  const costJustification = [
    `${ctx.packageLabel} total investment: ¥${ctx.totalBudgetMin.toLocaleString()} – ¥${ctx.totalBudgetMax.toLocaleString()}.`,
    `${ctx.equipmentCount} units at ¥${ctx.budgetPerUnit.toLocaleString()}/unit.`,
    `Equipment strategy score: ${ctx.equipmentStrategyScore}%.`,
    ctx.proposalVariant.budgetNarrative.costJustification,
  ].join(" ");

  const procurementJustification = [
    PROCUREMENT_NOTES[bidderBrand],
    `Route type: ${ctx.routeType}. Budget strategy score: ${ctx.budgetStrategyScore}%.`,
    `Procurement aligned with ${tier} tier for ${ctx.projectName}.`,
  ].join(" ");

  const brandPremiumJustification = [
    PREMIUM_NOTES[bidderBrand],
    `Brand strategy score: ${ctx.brandStrategyScore}%.`,
    tier === "value"
      ? "No brand premium applied — value procurement model."
      : `Brand premium factor embedded in unit pricing for ${tier} positioning.`,
  ].join(" ");

  const budgetFormatted = ctx.totalBudgetMin.toLocaleString();
  const hasBudgetRef =
    costJustification.includes(budgetFormatted) ||
    costJustification.includes(String(ctx.totalBudgetMin));
  const hasProcurementRef = procurementJustification.length > 60;
  const hasBrandRef = brandPremiumJustification.length > 40;
  const budgetAlignmentScore = Math.min(
    100,
    Math.round(
      ctx.budgetStrategyScore * 0.4 +
        (hasBudgetRef ? 30 : 0) +
        (hasProcurementRef ? 15 : 0) +
        (hasBrandRef ? 15 : 0),
    ),
  );

  return {
    profileId: `budget-justification-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    bidderBrand,
    costJustification,
    procurementJustification,
    brandPremiumJustification,
    budgetTotal: ctx.totalBudgetMin,
    budgetAlignmentScore,
  };
}
