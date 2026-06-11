import { buildBidderProfileSnapshot } from "@/lib/bidder-intelligence/bidder-profile/builders";
import { buildBrandIntelligenceProfiles } from "@/lib/brand-catalog-intelligence/brand-intelligence/builders";
import { buildAllBrandPackages } from "@/lib/equipment-selection/equipment-package/builders";
import { buildSelectionTenderContext } from "@/lib/equipment-selection/bridge/catalog-bridge";
import { buildBudgetPackageSnapshot } from "@/lib/equipment-selection/budget-package/builders";
import { buildProposalDifferentiationProfile } from "@/lib/proposal-differentiation/differentiation-profile/builders";
import type { ComposerBidderBrand } from "../shared/types";
import { PROPOSAL_VARIANT_LABELS } from "../shared/types";

export interface ProposalContext {
  contextId: string;
  proposalLabel: string;
  bidderBrand: ComposerBidderBrand;
  tenderContext: ReturnType<typeof buildSelectionTenderContext>;
  bidderContext: ReturnType<typeof buildBidderProfileSnapshot>;
  brandContext: ReturnType<typeof buildBrandIntelligenceProfiles>[number];
  equipmentContext: ReturnType<typeof buildAllBrandPackages>[number];
  budgetContext: ReturnType<typeof buildBudgetPackageSnapshot>["premiumBudgetPackage"];
  differentiationContext: ReturnType<typeof buildProposalDifferentiationProfile>;
}

export function buildProposalContext(input: {
  deploymentId: string;
  bidderBrand: ComposerBidderBrand;
}): ProposalContext {
  const { deploymentId, bidderBrand } = input;
  const tenderContext = buildSelectionTenderContext({ deploymentId });
  const bidderContext = buildBidderProfileSnapshot({ deploymentId });
  const brandProfiles = buildBrandIntelligenceProfiles({ deploymentId });
  const brandContext = brandProfiles.find((p) => p.brandName === bidderBrand);
  if (!brandContext) throw new Error(`Brand context not found: ${bidderBrand}`);

  const packages = buildAllBrandPackages({ deploymentId });
  const equipmentContext = packages.find((p) => p.bidderBrand === bidderBrand);
  if (!equipmentContext) throw new Error(`Equipment context not found: ${bidderBrand}`);

  const budgetSnapshot = buildBudgetPackageSnapshot({ deploymentId });
  const budgetContext =
    bidderBrand === "Technogym" ? budgetSnapshot.premiumBudgetPackage
      : bidderBrand === "Matrix" ? budgetSnapshot.balancedBudgetPackage
        : bidderBrand === "Shuhua" ? budgetSnapshot.valueBudgetPackage
          : {
              ...budgetSnapshot.premiumBudgetPackage,
              label: "Reliability Equipment Package Budget",
              bidderBrand: "Life Fitness",
              equipmentPackageId: equipmentContext.packageId,
              totalBudgetMin: equipmentContext.totalBudgetEstimate,
              totalBudgetMax: Math.round(equipmentContext.totalBudgetEstimate * 1.12),
              equipmentCount: equipmentContext.equipmentList.reduce((s, i) => s + i.quantity, 0),
              budgetPerUnit: Math.round(
                equipmentContext.totalBudgetEstimate /
                  equipmentContext.equipmentList.reduce((s, i) => s + i.quantity, 0),
              ),
            };

  const differentiationContext = buildProposalDifferentiationProfile({ deploymentId, bidderBrand });

  return {
    contextId: `proposal-context-${bidderBrand}-${deploymentId}`,
    proposalLabel: PROPOSAL_VARIANT_LABELS[bidderBrand],
    bidderBrand,
    tenderContext,
    bidderContext,
    brandContext,
    equipmentContext,
    budgetContext,
    differentiationContext,
  };
}

export function buildAllProposalContexts(input?: { deploymentId?: string }): ProposalContext[] {
  const deploymentId = input?.deploymentId ?? "bidder-proposal-composer-default";
  return (["Technogym", "Life Fitness", "Matrix", "Shuhua"] as ComposerBidderBrand[]).map(
    (brand) => buildProposalContext({ deploymentId, bidderBrand: brand }),
  );
}
