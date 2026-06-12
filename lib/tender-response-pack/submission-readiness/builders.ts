import { buildCommercialPackage } from "../commercial-attachment/builders";
import { buildCompliancePackage } from "../compliance-attachment/builders";
import { buildEquipmentAttachmentPackage } from "../equipment-attachment/builders";
import { buildResponsePackContext } from "../bridge/response-bridge";
import { buildTenderResponsePack } from "../response-pack-assembly/builders";
import { RESPONSE_PACK_BIDDER_BRANDS, type ResponsePackBidderBrand } from "../shared/types";
import type { SubmissionReadinessAssessment } from "./types";

export function buildSubmissionReadinessAssessment(input: {
  deploymentId: string;
  bidderBrand: ResponsePackBidderBrand;
}): SubmissionReadinessAssessment {
  const { deploymentId, bidderBrand } = input;
  const ctx = buildResponsePackContext({ deploymentId, bidderBrand });
  const pack = buildTenderResponsePack({ deploymentId, bidderBrand });
  const compliance = buildCompliancePackage({ deploymentId, bidderBrand });
  const equipment = buildEquipmentAttachmentPackage({ deploymentId, bidderBrand });
  const commercial = buildCommercialPackage({ deploymentId, bidderBrand });

  const completeness = pack.assemblyReadiness;
  const complianceReadiness = compliance.complianceReadiness;
  const attachmentReadiness = Math.round(
    (equipment.attachmentReadiness + commercial.commercialReadiness) / 2,
  );
  const budgetReadiness = commercial.commercialReadiness;
  const responseReadiness = ctx.deliveryReadiness;

  const submissionReadinessScore = Math.round(
    completeness * 0.25 +
      complianceReadiness * 0.2 +
      attachmentReadiness * 0.2 +
      budgetReadiness * 0.15 +
      responseReadiness * 0.2,
  );

  return {
    assessmentId: `submission-readiness-${bidderBrand}-${deploymentId}`,
    packLabel: ctx.packLabel,
    bidderBrand,
    completeness,
    complianceReadiness,
    attachmentReadiness,
    budgetReadiness,
    responseReadiness,
    submissionReadinessScore: Math.min(100, submissionReadinessScore),
  };
}

export function buildAllSubmissionReadinessAssessments(input?: { deploymentId?: string }): {
  assessments: SubmissionReadinessAssessment[];
  averageSubmissionReadinessScore: number;
} {
  const deploymentId = input?.deploymentId ?? "submission-readiness-default";
  const assessments = RESPONSE_PACK_BIDDER_BRANDS.map((brand) =>
    buildSubmissionReadinessAssessment({ deploymentId, bidderBrand: brand }),
  );
  const averageSubmissionReadinessScore = Math.round(
    assessments.reduce((s, a) => s + a.submissionReadinessScore, 0) / assessments.length,
  );
  return { assessments, averageSubmissionReadinessScore };
}
