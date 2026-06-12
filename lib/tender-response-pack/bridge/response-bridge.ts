import { buildProposalContext } from "@/lib/bidder-proposal-composer/bridge/context-bridge";
import { buildProposalDeliveryPackage } from "@/lib/proposal-delivery-packaging/proposal-delivery-package/builders";
import { buildAllDeliveryReadinessAssessments } from "@/lib/proposal-delivery-packaging/delivery-readiness/builders";
import type { ResponsePackBidderBrand } from "../shared/types";
import { RESPONSE_PACK_LABELS } from "../shared/types";

export interface ResponsePackContext {
  contextId: string;
  packLabel: string;
  bidderBrand: ResponsePackBidderBrand;
  tenderId: string;
  projectName: string;
  proposalContext: ReturnType<typeof buildProposalContext>;
  deliveryPackage: ReturnType<typeof buildProposalDeliveryPackage>;
  deliveryReadiness: number;
  contextReadiness: number;
}

export function buildResponsePackContext(input: {
  deploymentId: string;
  bidderBrand: ResponsePackBidderBrand;
}): ResponsePackContext {
  const { deploymentId, bidderBrand } = input;
  const proposalContext = buildProposalContext({ deploymentId, bidderBrand });
  const deliveryPackage = buildProposalDeliveryPackage({ deploymentId, bidderBrand });
  const deliveryAssessments = buildAllDeliveryReadinessAssessments({ deploymentId });
  const assessment = deliveryAssessments.assessments.find((a) => a.bidderBrand === bidderBrand)!;

  const contextChecks = [
    proposalContext.tenderContext.tenderId.length > 0,
    proposalContext.bidderContext.profileReadiness > 0,
    proposalContext.equipmentContext.equipmentList.length >= 2,
    proposalContext.budgetContext.totalBudgetMin > 0,
    deliveryPackage.deliveryPackageReadiness >= 80,
  ];
  const contextReadiness = Math.round((contextChecks.filter(Boolean).length / contextChecks.length) * 100);

  return {
    contextId: `response-pack-context-${bidderBrand}-${deploymentId}`,
    packLabel: RESPONSE_PACK_LABELS[bidderBrand],
    bidderBrand,
    tenderId: proposalContext.tenderContext.tenderId,
    projectName: proposalContext.tenderContext.projectName,
    proposalContext,
    deliveryPackage,
    deliveryReadiness: assessment.deliveryReadinessScore,
    contextReadiness,
  };
}

export function buildAllResponsePackContexts(input?: { deploymentId?: string }): ResponsePackContext[] {
  const deploymentId = input?.deploymentId ?? "tender-response-pack-default";
  return (["Technogym", "Life Fitness", "Matrix", "Shuhua"] as ResponsePackBidderBrand[]).map(
    (brand) => buildResponsePackContext({ deploymentId, bidderBrand: brand }),
  );
}
