import { buildProposalContext } from "../bridge/context-bridge";
import type { ComposerBidderBrand } from "../shared/types";

const BUDGET_NARRATIVES: Record<ComposerBidderBrand, { logic: string; cost: string; value: string }> = {
  Technogym: {
    logic: "Premium investment strategy prioritizing design excellence, digital ecosystem, and lifecycle value",
    cost: "Higher unit cost offset by extended lifespan, premium residual value, and reduced replacement frequency",
    value: "Flagship venue positioning with measurable member engagement and brand prestige uplift",
  },
  "Life Fitness": {
    logic: "Reliability-focused investment with proven TCO model and global service network assurance",
    cost: "Moderate premium justified by industry-leading durability and lowest downtime cost over 7-year lifecycle",
    value: "Maximum uptime guarantee with standardized maintenance and modular component replacement",
  },
  Matrix: {
    logic: "Balanced capital allocation optimizing feature set against footprint and procurement budget constraints",
    cost: "Mid-range pricing with competitive feature density — optimal cost-per-capability ratio",
    value: "Modern member experience without premium-tier capital expenditure",
  },
  Shuhua: {
    logic: "Value procurement strategy aligned with government budget compliance and domestic supply chain efficiency",
    cost: "Lowest unit cost with fast domestic delivery — minimal import duty and logistics overhead",
    value: "Maximum equipment quantity within budget envelope with full procurement compliance",
  },
};

export function buildBudgetNarrativeComposition(input?: {
  deploymentId?: string;
  bidderBrand?: ComposerBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "budget-narrative-composer-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildProposalContext({ deploymentId, bidderBrand });
  const narrative = BUDGET_NARRATIVES[bidderBrand];

  const budgetLogic = `${narrative.logic}. Total budget: ¥${ctx.budgetContext.totalBudgetMin.toLocaleString()} – ¥${ctx.budgetContext.totalBudgetMax.toLocaleString()} for ${ctx.budgetContext.equipmentCount} units (${ctx.budgetContext.budgetPerUnit.toLocaleString()}/unit).`;

  const budgetReadiness = Math.round(
    ctx.differentiationContext.budgetStrategy.budgetStrategyScore * 0.7 +
      (ctx.budgetContext.totalBudgetMin > 0 ? 30 : 0),
  );

  return {
    compositionId: `budget-narrative-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    budgetLogic,
    costJustification: narrative.cost,
    valueJustification: narrative.value,
    budgetReadiness: Math.min(100, budgetReadiness),
  };
}
