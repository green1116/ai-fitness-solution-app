import { buildProposalContext, buildAllProposalContexts } from "../bridge/context-bridge";
import { buildBudgetNarrativeComposition } from "../budget-narrative/builders";
import { buildCompetitiveNarrativeComposition } from "../competitive-narrative/builders";
import { buildEquipmentPlanComposition } from "../equipment-plan-composer/builders";
import { buildExecutiveSummaryComposition } from "../executive-composer/builders";
import { buildTechnicalProposalComposition } from "../technical-composer/builders";
import { COMPOSER_BIDDER_BRANDS, type ComposerBidderBrand } from "../shared/types";
import type { FullProposalVariant } from "./types";

function spreadPercent(values: number[]): number {
  if (values.length < 2) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === 0) return 0;
  return Math.round(((max - min) / max) * 100);
}

export function buildFullProposalVariant(input: {
  deploymentId: string;
  bidderBrand: ComposerBidderBrand;
}): FullProposalVariant {
  const { deploymentId, bidderBrand } = input;
  const ctx = buildProposalContext({ deploymentId, bidderBrand });
  const executive = buildExecutiveSummaryComposition({ deploymentId, bidderBrand });
  const technical = buildTechnicalProposalComposition({ deploymentId, bidderBrand });
  const equipmentPlan = buildEquipmentPlanComposition({ deploymentId, bidderBrand });
  const budgetNarrative = buildBudgetNarrativeComposition({ deploymentId, bidderBrand });
  const competitiveNarrative = buildCompetitiveNarrativeComposition({ deploymentId, bidderBrand });

  const variantReadiness = Math.round(
    executive.executiveReadiness * 0.2 +
      technical.technicalReadiness * 0.2 +
      equipmentPlan.equipmentPlanReadiness * 0.2 +
      budgetNarrative.budgetReadiness * 0.2 +
      competitiveNarrative.differentiationReadiness * 0.2,
  );

  return {
    variantId: `proposal-variant-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    bidderBrand,
    packageLabel: ctx.equipmentContext.packageLabel,
    executive,
    technical,
    equipmentPlan,
    budgetNarrative,
    competitiveNarrative,
    variantReadiness: Math.min(100, variantReadiness),
  };
}

export function buildAllProposalVariants(input?: { deploymentId?: string }): {
  variants: FullProposalVariant[];
  variantSpreadScore: number;
} {
  const deploymentId = input?.deploymentId ?? "proposal-variant-composer-default";
  const variants = COMPOSER_BIDDER_BRANDS.map((brand) =>
    buildFullProposalVariant({ deploymentId, bidderBrand: brand }),
  );

  const budgets = buildAllProposalContexts({ deploymentId }).map((c) => c.budgetContext.totalBudgetMin);
  const styles = new Set(variants.map((v) => v.executive.style));
  const packages = new Set(variants.map((v) => v.packageLabel));
  const brands = new Set(variants.map((v) => v.bidderBrand));

  const variantSpreadScore = Math.min(
    100,
    Math.round(
      spreadPercent(budgets) * 0.35 +
        (styles.size / 3) * 100 * 0.25 +
        (packages.size / 4) * 100 * 0.25 +
        (brands.size / 4) * 100 * 0.15,
    ),
  );

  return { variants, variantSpreadScore };
}
