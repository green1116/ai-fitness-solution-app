import { buildBidderProfileSnapshot } from "@/lib/bidder-intelligence/bidder-profile/builders";
import { buildTenderRequirementSet } from "@/lib/brand-catalog-intelligence/equipment-matching/builders";
import { buildProposalKnowledgeAssets } from "@/lib/knowledge-base/proposal/builders";
import type { DifferentiationBidderBrand } from "../shared/types";

export interface DifferentiationTenderContext {
  tenderId: string;
  projectName: string;
  projectType: string;
  budgetTier: string;
  complianceRequirements: string[];
  requiredCategories: string[];
  knowledgeInsights: string[];
}

export function buildDifferentiationTenderContext(input?: {
  deploymentId?: string;
  bidderBrand?: DifferentiationBidderBrand;
}): DifferentiationTenderContext {
  const deploymentId = input?.deploymentId ?? "proposal-differentiation-default";
  const tenderReq = buildTenderRequirementSet({ deploymentId });
  const bidderProfile = buildBidderProfileSnapshot({ deploymentId });
  const knowledge = buildProposalKnowledgeAssets({ deploymentId });

  void input?.bidderBrand;
  void bidderProfile;

  return {
    tenderId: tenderReq.requirementId,
    projectName: tenderReq.projectName,
    projectType: "government-procurement",
    budgetTier: tenderReq.budgetTier,
    complianceRequirements: tenderReq.complianceTags,
    requiredCategories: tenderReq.requiredCategories,
    knowledgeInsights: knowledge.slice(0, 3).map((asset) => asset.template.title),
  };
}
