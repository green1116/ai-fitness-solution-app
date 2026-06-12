import { buildProposalContext } from "@/lib/bidder-proposal-composer/bridge/context-bridge";
import { buildFullProposalVariant } from "@/lib/bidder-proposal-composer/proposal-variant/builders";
import type { PackagingBidderBrand } from "../shared/types";
import { PACKAGING_PROPOSAL_LABELS } from "../shared/types";

export interface PackagingContext {
  contextId: string;
  proposalLabel: string;
  bidderBrand: PackagingBidderBrand;
  tenderId: string;
  projectName: string;
  packageLabel: string;
  routeType: string;
  totalBudgetMin: number;
  totalBudgetMax: number;
  equipmentCount: number;
  budgetPerUnit: number;
  brandStrategyScore: number;
  budgetStrategyScore: number;
  equipmentStrategyScore: number;
  proposalVariant: ReturnType<typeof buildFullProposalVariant>;
}

export function buildPackagingContext(input: {
  deploymentId: string;
  bidderBrand: PackagingBidderBrand;
}): PackagingContext {
  const { deploymentId, bidderBrand } = input;
  const ctx = buildProposalContext({ deploymentId, bidderBrand });
  const proposalVariant = buildFullProposalVariant({ deploymentId, bidderBrand });

  return {
    contextId: `packaging-context-${bidderBrand}-${deploymentId}`,
    proposalLabel: PACKAGING_PROPOSAL_LABELS[bidderBrand],
    bidderBrand,
    tenderId: ctx.tenderContext.tenderId,
    projectName: ctx.tenderContext.projectName,
    packageLabel: ctx.equipmentContext.packageLabel,
    routeType: ctx.equipmentContext.routeType,
    totalBudgetMin: ctx.budgetContext.totalBudgetMin,
    totalBudgetMax: ctx.budgetContext.totalBudgetMax,
    equipmentCount: ctx.budgetContext.equipmentCount,
    budgetPerUnit: ctx.budgetContext.budgetPerUnit,
    brandStrategyScore: ctx.differentiationContext.brandStrategy.strategyScore,
    budgetStrategyScore: ctx.differentiationContext.budgetStrategy.budgetStrategyScore,
    equipmentStrategyScore: ctx.differentiationContext.equipmentStrategy.equipmentStrategyScore,
    proposalVariant,
  };
}

export function buildAllPackagingContexts(input?: { deploymentId?: string }): PackagingContext[] {
  const deploymentId = input?.deploymentId ?? "proposal-delivery-packaging-default";
  return (["Technogym", "Life Fitness", "Matrix", "Shuhua"] as PackagingBidderBrand[]).map(
    (brand) => buildPackagingContext({ deploymentId, bidderBrand: brand }),
  );
}
