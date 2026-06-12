import { buildAllDeliveryReadinessAssessments } from "@/lib/proposal-delivery-packaging/delivery-readiness/builders";
import { buildCommercialPackage } from "../commercial-attachment/builders";
import { buildCompliancePackage } from "../compliance-attachment/builders";
import { buildEquipmentAttachmentPackage } from "../equipment-attachment/builders";
import { buildAllSubmissionReadinessAssessments } from "../submission-readiness/builders";
import { buildAllVariantPacks } from "../variant-pack/builders";
import { RESPONSE_PACK_BIDDER_BRANDS } from "../shared/types";
import type { TenderResponseDashboardMetrics } from "./types";

export function buildTenderResponseDashboardMetrics(input?: {
  deploymentId?: string;
}): TenderResponseDashboardMetrics {
  const deploymentId = input?.deploymentId ?? "tender-response-dashboard-default";

  const delivery = buildAllDeliveryReadinessAssessments({ deploymentId });
  const complianceScores = RESPONSE_PACK_BIDDER_BRANDS.map(
    (brand) => buildCompliancePackage({ deploymentId, bidderBrand: brand }).complianceReadiness,
  );
  const equipmentScores = RESPONSE_PACK_BIDDER_BRANDS.map(
    (brand) => buildEquipmentAttachmentPackage({ deploymentId, bidderBrand: brand }).attachmentReadiness,
  );
  const commercialScores = RESPONSE_PACK_BIDDER_BRANDS.map(
    (brand) => buildCommercialPackage({ deploymentId, bidderBrand: brand }).commercialReadiness,
  );
  const submission = buildAllSubmissionReadinessAssessments({ deploymentId });
  const { variantSpreadScore } = buildAllVariantPacks({ deploymentId });

  const avg = (scores: number[]) => Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);

  const proposalReadiness = delivery.averageDeliveryReadinessScore;
  const complianceReadiness = avg(complianceScores);
  const attachmentReadiness = Math.round((avg(equipmentScores) + avg(commercialScores)) / 2);
  const submissionReadiness = submission.averageSubmissionReadinessScore;

  const tenderResponseReadiness = Math.min(
    100,
    Math.round(
      proposalReadiness * 0.3 +
        complianceReadiness * 0.2 +
        attachmentReadiness * 0.25 +
        submissionReadiness * 0.25,
    ),
  );

  return {
    proposalReadiness,
    complianceReadiness,
    attachmentReadiness,
    submissionReadiness,
    tenderResponseReadiness,
    summary: [
      "tender-response-dashboard",
      `tenderResponseReadiness=${tenderResponseReadiness}%`,
      `proposal=${proposalReadiness}%`,
      `compliance=${complianceReadiness}%`,
      `attachment=${attachmentReadiness}%`,
      `submission=${submissionReadiness}%`,
      `variantSpread=${variantSpreadScore}%`,
    ].join(" "),
  };
}
